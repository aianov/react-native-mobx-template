import { formatExactDate, formatRelativeTime } from '@lib/date';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { MainText } from '../MainText/MainText';

interface LiveTimeAgoProps {
	date: string | Date;
	style?: any;
	fontSize?: number;
}

const splitTimeString = (timeString: string): { value: string; unit: string; } => {
	const match = timeString.match(/^(\d+)/);
	if (match) {
		const value = match[0];
		const unit = timeString.substring(value.length);
		return { value, unit };
	}
	return { value: '', unit: timeString };
};

let activeTooltipCloseHandler: (() => void) | null = null;

const LiveTimeAgoComponent = observer(({ date, style, fontSize }: LiveTimeAgoProps) => {
	const { currentTheme } = themeStore;

	const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

	const [timeData, setTimeData] = useState(() => {
		const formattedTime = formatRelativeTime(date);
		const { value, unit } = splitTimeString(formattedTime);
		return { formattedTime, value, unit };
	});

	const [showModal, setShowModal] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

	const opacityAnim = useRef(new Animated.Value(1)).current;
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isMounted = useRef(true);
	const containerRef = useRef<View>(null);

	const exactDate = useMemo(() => formatExactDate(date), [date]);

	const closeModal = useCallback(() => {
		setShowModal(false);
		activeTooltipCloseHandler = null;
	}, []);

	const getUpdateInterval = useCallback((dateObj: Date): number => {
		if (!dateObj) return 1000;

		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return 1000; // каждую секунду
		} else if (diffInSeconds < 3600) {
			return 10 * 1000; // каждые 10 секунд
		} else if (diffInSeconds < 86400) {
			return 60 * 1000; // каждую минуту
		}
		return 60 * 60 * 1000; // каждый час
	}, []);

	const updateTime = useCallback(() => {
		if (!isMounted.current) return;

		const newFormattedTime = formatRelativeTime(date);
		const { value: newValue, unit: newUnit } = splitTimeString(newFormattedTime);

		if (newUnit === timeData.unit && newValue !== timeData.value) {
			Animated.timing(opacityAnim, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true
			}).start(() => {
				if (isMounted.current) {
					setTimeData({ formattedTime: newFormattedTime, value: newValue, unit: newUnit });

					Animated.timing(opacityAnim, {
						toValue: 1,
						duration: 150,
						useNativeDriver: true
					}).start();
				}
			});
		} else if (newUnit !== timeData.unit) {
			if (isMounted.current) {
				setTimeData({ formattedTime: newFormattedTime, value: newValue, unit: newUnit });
			}
		}

		scheduleNextUpdate();
	}, [date, timeData, opacityAnim]);

	const scheduleNextUpdate = useCallback(() => {
		if (!isMounted.current) return;

		const dateObj = typeof date === 'string' ? new Date(date) : date;
		const interval = getUpdateInterval(dateObj);

		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		timerRef.current = setTimeout(updateTime, interval);
	}, [date, getUpdateInterval, updateTime]);

	const showDateModal = useCallback(() => {
		if (!showModal && containerRef.current) {
			if (activeTooltipCloseHandler) {
				activeTooltipCloseHandler();
			}

			containerRef.current.measure((x, y, width, height, pageX, pageY) => {
				setTooltipPosition({
					x: pageX,
					y: pageY,
					width,
					height
				});

				setShowModal(true);

				activeTooltipCloseHandler = closeModal;
			});
		} else {
			closeModal();
		}
	}, [showModal, closeModal]);

	useEffect(() => {
		if (showModal) {
			const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
				closeModal();
				return true;
			});

			return () => backHandler.remove();
		}
	}, [showModal, closeModal]);

	useEffect(() => {
		isMounted.current = true;

		updateTime();

		return () => {
			isMounted.current = false;
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}

			if (activeTooltipCloseHandler === closeModal) {
				activeTooltipCloseHandler = null;
			}
		};
	}, [date, updateTime, closeModal]);

	const getTooltipPosition = useCallback(() => {
		const { x, y, width, height } = tooltipPosition;

		const tooltipWidth = Math.min(200, SCREEN_WIDTH * 0.7);
		const tooltipHeight = 40;

		const spaceAbove = y;
		const showOnTop = spaceAbove >= tooltipHeight + 10;

		let left = x + width / 2 - tooltipWidth / 2;

		if (left < 10) {
			left = 10;
		} else if (left + tooltipWidth > SCREEN_WIDTH - 10) {
			left = SCREEN_WIDTH - tooltipWidth + 10;
		}

		const top = showOnTop ? y - tooltipHeight - 10 : y + height + 10;

		const arrowLeft = x + width / 2 - left - 5; // 5 - половина ширины стрелки

		return {
			left,
			top,
			showOnTop,
			arrowLeft
		};
	}, [tooltipPosition]);

	return (
		<>
			<View style={styles.wrapper} ref={containerRef}>
				<TouchableOpacity
					onLongPress={showDateModal}
					delayLongPress={500}
					activeOpacity={0.7}
				>
					<View style={styles.container}>
						<Animated.Text
							style={[
								{ color: currentTheme.secondary_100 },
								style,
								{ opacity: opacityAnim, fontSize: fontSize || 7 }
							]}
						>
							{timeData.value}
						</Animated.Text>
						<Text
							style={[
								{ color: currentTheme.secondary_100, },
								style,
								{ fontSize: fontSize || 7 }
							]}
						>
							{timeData.unit}
						</Text>
					</View>
				</TouchableOpacity>
			</View>

			<Modal
				visible={showModal}
				transparent={true}
				animationType="fade"
				onRequestClose={closeModal}
			>
				<TouchableWithoutFeedback onPress={closeModal}>
					<View style={styles.modalOverlay}>
						<TouchableWithoutFeedback>
							<View
								style={[
									styles.tooltip,
									{
										backgroundColor: currentTheme.bg_200,
										maxWidth: SCREEN_WIDTH * 0.7,
									},
									getTooltipPosition()
								]}
							>
								<View
									style={[
										styles.tooltipArrow,
										getTooltipPosition().showOnTop
											? { bottom: -5, borderTopWidth: 5, borderBottomWidth: 0, borderTopColor: currentTheme.bg_200 }
											: { top: -5, borderBottomWidth: 5, borderTopWidth: 0, borderBottomColor: currentTheme.bg_200 },
										{ left: getTooltipPosition().arrowLeft }
									]}
								/>
								<MainText
									px={12}
									color={currentTheme.secondary_100}
								>
									{exactDate}
								</MainText>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</>
	);
});

const styles = StyleSheet.create({
	tooltip: {
		position: 'absolute',
		padding: 10,
		borderRadius: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	wrapper: {
		position: 'relative',
	},
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tooltipArrow: {
		position: 'absolute',
		width: 0,
		height: 0,
		borderLeftWidth: 5,
		borderRightWidth: 5,
		borderStyle: 'solid',
		backgroundColor: 'transparent',
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
	},
});

export const LiveTimeAgo = React.memo(LiveTimeAgoComponent, (prevProps, nextProps) => {
	const prevDate = typeof prevProps.date === 'string' ? new Date(prevProps.date) : prevProps.date;
	const nextDate = typeof nextProps.date === 'string' ? new Date(nextProps.date) : nextProps.date;

	return (
		prevDate.getTime() === nextDate.getTime() &&
		prevProps.fontSize === nextProps.fontSize
	);
});

