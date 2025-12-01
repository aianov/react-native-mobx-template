import { overlayColor } from '@core/config/constants';
import { MainText, SimpleButtonUi } from '@core/ui';
import { Portal } from '@gorhom/portal';
import { themeStore } from '@theme/stores';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleProp, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

export interface ModalData {
	title: string;
	message: string;
	buttonText?: string;
	buttonStyle?: StyleProp<ViewStyle>;
	onCancel: () => void;
	onPress: () => void;
	width?: number;
}

interface ModalUiProps {
	visible: boolean;
	animationDuration?: number;
	width?: number;
	modalData: ModalData;
	instaOpen?: boolean;
}

export const SimpleModalUi = ({
	visible,
	animationDuration = 300,
	modalData,
	width = 300,
	instaOpen = false,
}: ModalUiProps): React.ReactElement | null => {
	const { currentTheme } = themeStore;
	const { t } = useTranslation();

	const scaleAnim = useRef(new Animated.Value(0.8)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (visible && !mounted) setMounted(true);
		if (visible) {
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: animationDuration,
					useNativeDriver: true,
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: animationDuration * 0.8,
					useNativeDriver: true,
				}),
			]).start();
		} else if (mounted) {
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 0.85,
					duration: animationDuration / 2,
					useNativeDriver: true,
				}),
				Animated.timing(opacityAnim, {
					toValue: 0,
					duration: animationDuration / 2,
					useNativeDriver: true,
				}),
			]).start(() => {
				setMounted(false);
				scaleAnim.setValue(0.8);
			});
		}
	}, [visible, animationDuration, scaleAnim, opacityAnim, mounted]);

	if (!mounted) return null;

	return (
		<Portal>
			<View style={StyleSheet.absoluteFill}>
				<Animated.View
					style={[
						StyleSheet.absoluteFill,
						styles.overlay,
						{
							opacity: (instaOpen && visible) ? 1 : opacityAnim,
							backgroundColor: overlayColor,
						}
					]}
				>
					<TouchableWithoutFeedback onPress={modalData.onCancel}>
						<View style={styles.overlayTouch}>
							<TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
								<Animated.View
									style={[
										styles.modalContainer,
										{
											backgroundColor: currentTheme.bg_200,
											opacity: opacityAnim,
											transform: [{ scale: scaleAnim }],
											width,
										},
									]}
								>
									<MainText
										tac='center'
										fontWeight='bold'
										px={17}
									>
										{modalData.title}
									</MainText>

									<MainText
										tac='center'
										px={14}
									>
										{modalData.message}
									</MainText>

									<View style={styles.buttonsContainer}>
										<SimpleButtonUi
											style={[
												styles.button,
												{ backgroundColor: currentTheme.btn_bg_300, },
												modalData.buttonStyle
											]}
											onPress={modalData.onCancel}
										>
											<MainText
												width={"100%"}
												tac='center'
												px={14}
											>
												{t('cancel_text')}
											</MainText>
										</SimpleButtonUi>

										<SimpleButtonUi
											style={[
												styles.button,
												{
													backgroundColor: currentTheme.primary_100,
												},
												modalData.buttonStyle
											]}
											onPress={modalData.onPress}
										>
											<MainText
												width={"100%"}
												tac='center'
												px={14}
											>
												{modalData.buttonText}
											</MainText>
										</SimpleButtonUi>
									</View>
								</Animated.View>
							</TouchableWithoutFeedback>
						</View>
					</TouchableWithoutFeedback>
				</Animated.View>
			</View>
		</Portal>
	);
};

const styles = StyleSheet.create({
	button: {
		borderRadius: 5,
		flex: 1,
		alignItems: 'center',
		paddingVertical: 8,
		justifyContent: 'center',
	},
	modalContainer: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 15,
		paddingHorizontal: 15,
		borderRadius: 10,
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
		width: '100%',
	},
	overlay: {
		margin: 0,
		padding: 0,
	},
	overlayTouch: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	defaultContent: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	defaultText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
});