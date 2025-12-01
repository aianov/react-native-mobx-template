import { Portal } from '@gorhom/portal';
import { ArrowDownIcon } from '@icons/Ui/ArrowDownIcon';
import { ArrowUpIcon } from '@icons/Ui/ArrowUpIcon';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { MainText } from '../MainText/MainText';

interface CreateDynamicStylesParams {
	menuX: number;
	menuY: number;
	width: number;
	bg200: string;
	bg300: string;
	borderColor: string;
}

export interface ContextMenuItem {
	id: number;
	label: string;
	icon?: string;
	jsxIcon?: ReactNode;
	callback: () => void;
	disabled?: boolean;
	danger?: boolean;
	submenu?: ContextMenuItem[];
	key?: string;
	isActive?: boolean;
	textColor?: string;
}

interface ContextMenuProps {
	items: ContextMenuItem[];
	isVisible: boolean;
	onClose: () => void;
	anchorRef?: React.RefObject<View | null>;
	width?: number;
	offset?: { x: number; y: number; };
	edgeMargin?: number;
	selected?: null | string;
	position?: 'top' | 'bottom' | 'auto';
	disabled?: boolean;
}

export const ContextMenuUi = observer(({
	items,
	isVisible,
	onClose,
	anchorRef,
	width = 200,
	offset = { x: 0, y: 0 },
	edgeMargin = 10,
	selected = null,
	position = 'auto',
	disabled = false
}: ContextMenuProps) => {
	const { currentTheme } = themeStore;
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
	const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.9)).current;
	const overlayFadeAnim = useRef(new Animated.Value(0)).current;
	const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
	const positionCalculated = useRef(false);
	const estimatedMenuHeight = Math.min(screenHeight * 0.7, items.length * 50);

	useEffect(() => {
		if (isVisible) {
			Animated.timing(overlayFadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(overlayFadeAnim, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true,
			}).start();
		}
	}, [isVisible, overlayFadeAnim]);

	useEffect(() => {
		if (isVisible && anchorRef?.current && !positionCalculated.current) {
			anchorRef.current.measure((x, y, anchorWidth, anchorHeight, pageX, pageY) => {
				let newX = pageX;
				let newY = 0;

				const availableSpaceBelow = screenHeight - (pageY + anchorHeight);
				const availableSpaceAbove = pageY;

				if (offset?.x) {
					newX += offset.x;
				} else {
					newX = pageX + (anchorWidth / 2) - (width / 2);
				}

				if (newX < edgeMargin) {
					newX = edgeMargin;
				} else if (newX + width > screenWidth - edgeMargin) {
					newX = screenWidth - width - edgeMargin;
				}

				let autoPosition = position;
				if (autoPosition === 'auto') {
					if (availableSpaceBelow >= estimatedMenuHeight || availableSpaceBelow > availableSpaceAbove) {
						autoPosition = 'bottom';
					} else {
						autoPosition = 'top';
					}
				}

				if (autoPosition === 'bottom') {
					newY = pageY + anchorHeight + (offset?.y ?? 5);
				} else {
					newY = pageY - estimatedMenuHeight - (offset?.y ?? 5);
				}

				if (newY < edgeMargin) {
					newY = edgeMargin;
				} else if (newY + estimatedMenuHeight > screenHeight - edgeMargin) {
					if (autoPosition === 'bottom' && availableSpaceAbove > estimatedMenuHeight) {
						newY = pageY - estimatedMenuHeight - 5;
					} else {
						newY = screenHeight - estimatedMenuHeight - edgeMargin;
					}
				}

				setMenuPosition({ x: newX, y: newY });
				positionCalculated.current = true;

				Animated.parallel([
					Animated.spring(fadeAnim, {
						toValue: 1,
						useNativeDriver: true,
						friction: 8,
						tension: 65
					}),
					Animated.spring(scaleAnim, {
						toValue: 1,
						useNativeDriver: true,
						friction: 8,
						tension: 65
					})
				]).start();
			});
		} else if (!isVisible) {
			positionCalculated.current = false;

			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 0.9,
					duration: 100,
					useNativeDriver: true,
				})
			]).start();
		}
	}, [isVisible, anchorRef, offset, screenWidth, screenHeight, items?.length, fadeAnim, scaleAnim, edgeMargin, position, width, estimatedMenuHeight]);

	const handleItemPress = (item: ContextMenuItem, index: number) => {
		if (item.submenu && item.submenu.length > 0) {
			setActiveSubmenu(activeSubmenu === index ? null : index);
		} else {
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 0.9,
					duration: 100,
					useNativeDriver: true,
				})
			]).start(() => {
				onClose();
				item.callback();
			});
		}
	};

	const handleCloseMenu = () => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 0.9,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(overlayFadeAnim, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true,
			})
		]).start(() => {
			onClose();
		});
	};

	const dynamicStyles = useMemo(() => createDynamicStyles({
		menuX: menuPosition.x,
		menuY: menuPosition.y,
		width,
		bg200: currentTheme.bg_200,
		bg300: currentTheme.bg_300,
		borderColor: currentTheme.border_100,
	}), [menuPosition.x, menuPosition.y, width, currentTheme.bg_200, currentTheme.bg_300, currentTheme.border_100]);

	if (!isVisible) return null;

	return (
		<Portal>
			<TouchableWithoutFeedback
				onPress={handleCloseMenu}
				disabled={disabled}
			>
				<Animated.View
					style={[
						staticStyles.overlay,
						{ opacity: disabled ? 0.5 : overlayFadeAnim }
					]}
				/>
			</TouchableWithoutFeedback>

			<Animated.View
				style={[
					dynamicStyles.menuContainer,
					{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
				]}
			>
				<ScrollView>
					{items.map((item, index) => (
						<View key={`${item.label}-${index}`}>
							<TouchableOpacity
								style={[
									dynamicStyles.menuItem,
									item.disabled && staticStyles.disabledItem,
									index === items.length - 1 && !item.submenu && { borderBottomWidth: 0 },
								]}
								onPress={() => !item.disabled && handleItemPress(item, index)}
								disabled={item.disabled}
							>
								<MainText
									px={14}
									style={[
										staticStyles.menuItemText,
										item.danger && staticStyles.dangerItem,
										item.textColor && { color: item.textColor }
									]}
									color={selected == item.key ? currentTheme.primary_100 : currentTheme.text_100}
								>
									{item.label}
								</MainText>
								{item.jsxIcon && item.jsxIcon}
								{item.submenu && item.submenu.length > 0 && (
									<>
										{activeSubmenu === index ? (
											<ArrowUpIcon
												width={20}
												height={20}
												color={selected == item.key ? currentTheme.primary_100 : currentTheme.text_100}
											/>
										) : (
											<ArrowDownIcon
												width={20}
												height={20}
												color={selected == item.key ? currentTheme.primary_100 : currentTheme.text_100}
											/>
										)}
									</>
								)}
							</TouchableOpacity>

							{activeSubmenu === index && item.submenu && (
								<View style={dynamicStyles.submenuContainer}>
									{item.submenu.map((subItem, subIndex) => (
										<TouchableOpacity
											key={`${subItem.label}-${subIndex}`}
											style={[
												dynamicStyles.menuItem,
												subItem.disabled && staticStyles.disabledItem,
												subIndex === item.submenu!.length - 1 && { borderBottomWidth: 0 },
											]}
											onPress={() => {
												if (!subItem.disabled) {
													Animated.parallel([
														Animated.timing(fadeAnim, {
															toValue: 0,
															duration: 100,
															useNativeDriver: true,
														}),
														Animated.timing(scaleAnim, {
															toValue: 0.9,
															duration: 100,
															useNativeDriver: true,
														})
													]).start(() => {
														onClose();
														subItem.callback();
													});
												}
											}}
											disabled={subItem.disabled}
										>
											<MainText
												px={14}
												style={[
													staticStyles.menuItemText,
													subItem.danger && staticStyles.dangerItem,
												]}
											>
												{subItem.label}
											</MainText>
										</TouchableOpacity>
									))}
								</View>
							)}
						</View>
					))}
				</ScrollView>
			</Animated.View>
		</Portal>
	);
});

const staticStyles = StyleSheet.create({
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: 99999,
	},
	menuItemText: {
		flex: 1,
	},
	disabledItem: {
		opacity: 0.5,
	},
	dangerItem: {
		color: '#FF3B30',
	},
});


const createDynamicStyles = ({ menuX, menuY, width, bg200, bg300, borderColor }: CreateDynamicStylesParams) => StyleSheet.create({
	menuContainer: {
		position: 'absolute',
		left: menuX,
		top: menuY,
		width: width,
		backgroundColor: bg200,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 999,
		overflow: 'hidden',
		zIndex: 100000,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingRight: 12.5,
		paddingLeft: 15,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: borderColor,
	},
	submenuContainer: {
		backgroundColor: bg300,
		paddingLeft: 16,
	},
});