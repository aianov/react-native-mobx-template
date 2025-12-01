import { Box, MainText } from '@core/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import { themeStore } from '@theme/stores';
import { showNotify } from '@utils/notifications';
import { BlurView } from 'expo-blur';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Dimensions,
	GestureResponderEvent,
	Pressable,
	StyleSheet,
	View,
	ViewStyle
} from 'react-native';
import Animated, {
	Easing,
	SharedValue,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming
} from 'react-native-reanimated';

export interface HoldContextMenuAction {
	icon: string;
	title: string;
	onPress: () => void;
}

interface HoldContextMenuUiProps {
	itemLayout: { x: number; y: number; width: number; height: number; } | null;
	open?: boolean;
	onClose?: () => void;
	selectedItem?: any;
	setSelectedItem?: (item: any) => void;
	actions?: HoldContextMenuAction[];
	side?: "right" | "left";
	menuStyle?: ViewStyle;
	isBlurMenu?: boolean;
	messageAnimatedY?: SharedValue<number>;
	renderMessage?: React.ReactNode;
}

const MenuItem = memo(({
	item,
	index,
	isLast,
	isHighlighted,
	onLayout
}: {
	item: HoldContextMenuAction;
	index: number;
	isLast: boolean;
	isHighlighted: boolean;
	onLayout: (index: number, y: number, height: number) => void;
}) => {
	const currentTheme = themeStore.currentTheme;

	const handleLayout = useCallback((e: any) => {
		const { y, height } = e.nativeEvent.layout;
		onLayout(index, y, height);
	}, [index, onLayout]);

	return (
		<View
			onLayout={handleLayout}
			style={[
				styles.menuItem,
				{
					borderBottomWidth: isLast ? 0 : 0.5,
					borderBottomColor: currentTheme.border_100,
					backgroundColor: isHighlighted ? 'rgba(100, 100, 100, 0.15)' : 'transparent'
				}
			]}
		>
			<MainText color={item.icon === "delete" ? "red" : currentTheme.text_100}>
				{item.title}
			</MainText>
			<MaterialIcons
				name={item.icon as any}
				size={20}
				color={item.icon === "delete" ? "red" : currentTheme.text_100}
			/>
		</View>
	);
});

export const HoldContextMenuUi = memo(({
	itemLayout,
	open,
	onClose,
	selectedItem,
	setSelectedItem,
	actions = defaultContextMenuActions,
	side = "right",
	menuStyle = {},
	messageAnimatedY,
	renderMessage
}: HoldContextMenuUiProps) => {
	const currentTheme = themeStore.currentTheme;
	const screenHeight = Dimensions.get('window').height;

	const backdropOpacity = useSharedValue(0);
	const menuOpacity = useSharedValue(0);
	const menuScaleX = useSharedValue(0.3);
	const menuScaleY = useSharedValue(0.3);
	const messageOpacity = useSharedValue(0);
	const messageScale = useSharedValue(1);
	const containerTranslateY = useSharedValue(0);
	const menuOriginOffsetX = useSharedValue(0);
	const menuOriginOffsetY = useSharedValue(0);

	const [menuLayout, setMenuLayout] = useState<{ width: number; height: number; } | null>(null);
	const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

	const menuRef = useRef<View>(null);
	const itemPositionsRef = useRef<Array<{ top: number; bottom: number; }>>([]);
	const menuPageYRef = useRef<number>(0);
	const isClosingRef = useRef(false);

	const MENU_MARGIN = 10;
	const SAFE_BOTTOM = 40;

	const handleMenuLayout = useCallback((event: any) => {
		const { width, height } = event.nativeEvent.layout;
		setMenuLayout({ width, height });

		if (menuRef.current) {
			menuRef.current.measure((x, y, w, h, pageX, pageY) => {
				menuPageYRef.current = pageY;
			});
		}
	}, []);

	const findMenuItemAtY = useCallback((pageY: number) => {
		const menuY = menuPageYRef.current;
		for (let i = 0; i < itemPositionsRef.current.length; i++) {
			const item = itemPositionsRef.current[i];
			if (item && pageY >= menuY + item.top && pageY <= menuY + item.bottom) {
				return i;
			}
		}
		return null;
	}, []);

	const handleCloseComplete = useCallback(() => {
		if (onClose) onClose();
		if (setSelectedItem) setSelectedItem(null);
		setHighlightedIndex(null);
		setMenuLayout(null);
		isClosingRef.current = false;
	}, [onClose, setSelectedItem]);

	const closeMenu = useCallback(() => {
		if (isClosingRef.current) return;
		isClosingRef.current = true;

		menuOpacity.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.ease) });
		menuScaleX.value = withTiming(0.85, { duration: 150, easing: Easing.out(Easing.ease) });
		menuScaleY.value = withTiming(0.85, { duration: 150, easing: Easing.out(Easing.ease) });

		messageOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
		messageScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
		containerTranslateY.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
		backdropOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) }, (finished) => {
			if (finished) {
				runOnJS(handleCloseComplete)();
			}
		});

		if (messageAnimatedY) {
			messageAnimatedY.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
		}
	}, [backdropOpacity, menuOpacity, menuScaleX, menuScaleY, messageOpacity, messageScale, containerTranslateY, messageAnimatedY, handleCloseComplete]);

	const handleResponderGrant = useCallback((event: GestureResponderEvent) => {
		const itemIndex = findMenuItemAtY(event.nativeEvent.pageY);
		if (itemIndex !== null) {
			setHighlightedIndex(itemIndex);
		}
	}, [findMenuItemAtY]);

	const handleResponderMove = useCallback((event: GestureResponderEvent) => {
		const itemIndex = findMenuItemAtY(event.nativeEvent.pageY);
		setHighlightedIndex(itemIndex);
	}, [findMenuItemAtY]);

	const handleResponderRelease = useCallback(() => {
		if (highlightedIndex !== null) {
			const action = actions[highlightedIndex];
			if (action?.onPress) {
				action.onPress();
			}
		}
		closeMenu();
	}, [highlightedIndex, actions, closeMenu]);

	const updateItemPosition = useCallback((index: number, y: number, height: number) => {
		itemPositionsRef.current[index] = { top: y, bottom: y + height };
	}, []);

	useEffect(() => {
		if (!selectedItem && !open) {
			backdropOpacity.value = 0;
			menuOpacity.value = 0;
			menuScaleX.value = 0.3;
			menuScaleY.value = 0.3;
			messageOpacity.value = 0;
			messageScale.value = 1;
			containerTranslateY.value = 0;
			if (messageAnimatedY) {
				messageAnimatedY.value = 0;
			}
			isClosingRef.current = false;
			setMenuLayout(null);
			return;
		}

		isClosingRef.current = false;

		containerTranslateY.value = 0;
		if (messageAnimatedY) {
			messageAnimatedY.value = 0;
		}

		backdropOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });

		messageOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
		messageScale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });

		menuOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
		menuScaleX.value = withSpring(1, {
			damping: 16,
			stiffness: 200,
			mass: 0.7
		});
		menuScaleY.value = withSpring(1, {
			damping: 16,
			stiffness: 200,
			mass: 0.7
		});
	}, [selectedItem, open, backdropOpacity, menuOpacity, menuScaleX, menuScaleY, messageOpacity, messageScale, messageAnimatedY, containerTranslateY]);

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value
	}), []);

	const messageAnimStyle = useAnimatedStyle(() => ({
		opacity: messageOpacity.value,
		transform: [
			{ scale: messageScale.value },
			{ translateY: containerTranslateY.value }
		]
	}), []);

	const menuAnimStyle = useAnimatedStyle(() => {
		const offsetX = menuOriginOffsetX.value * (1 - menuScaleX.value);
		const offsetY = menuOriginOffsetY.value * (1 - menuScaleY.value);

		return {
			opacity: menuOpacity.value,
			transform: [
				{ scaleX: menuScaleX.value },
				{ scaleY: menuScaleY.value },
				{ translateX: offsetX },
				{ translateY: offsetY + containerTranslateY.value }
			]
		};
	}, []);

	const calculatedShift = useMemo(() => {
		if (!itemLayout || !menuLayout) {
			return 0;
		}

		const menuTop = itemLayout.y + itemLayout.height + MENU_MARGIN;
		const menuBottom = menuTop + menuLayout.height;

		if (menuBottom > screenHeight - SAFE_BOTTOM) {
			const overflow = menuBottom - (screenHeight - SAFE_BOTTOM);
			return -overflow;
		}

		return 0;
	}, [itemLayout, menuLayout, screenHeight]);

	useEffect(() => {
		if (!itemLayout || !menuLayout || !open || !selectedItem) return;

		menuOriginOffsetX.value = 0;
		menuOriginOffsetY.value = 0;

		if (calculatedShift !== 0) {
			containerTranslateY.value = withTiming(calculatedShift, {
				duration: 200,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1)
			});
		}
	}, [calculatedShift, itemLayout, menuLayout, open, selectedItem, side, containerTranslateY, menuOriginOffsetX, menuOriginOffsetY]);

	if (!selectedItem && !open && !isClosingRef.current) {
		return null;
	}

	return (
		<Portal>
			<Animated.View
				style={[styles.backdrop, backdropStyle]}
				pointerEvents={open || selectedItem ? 'auto' : 'none'}
			>
				<BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill}>
					<Pressable
						style={StyleSheet.absoluteFill}
						onPress={closeMenu}
					/>
				</BlurView>
			</Animated.View>

			{itemLayout && renderMessage && (
				<Animated.View
					style={[
						{
							position: 'absolute',
							top: itemLayout.y + 3,
							left: itemLayout.x,
							width: itemLayout.width,
							zIndex: 10000
						},
						messageAnimStyle
					]}
					pointerEvents="none"
				>
					{renderMessage}
				</Animated.View>
			)}

			{itemLayout && (
				<Box
					style={styles.interactionArea}
					onStartShouldSetResponder={() => true}
					onMoveShouldSetResponder={() => true}
					onResponderGrant={handleResponderGrant}
					onResponderMove={handleResponderMove}
					onResponderRelease={handleResponderRelease}
					onResponderTerminate={closeMenu}
				>
					<Animated.View
						ref={menuRef}
						onLayout={handleMenuLayout}
						style={[
							styles.contextMenu,
							{
								position: 'absolute',
								top: itemLayout.y + itemLayout.height + MENU_MARGIN,
								left: side === "right" ? itemLayout.x + itemLayout.width - 200 - 5 : itemLayout.x + 5,
								backgroundColor: currentTheme.bg_200
							},
							menuAnimStyle,
							menuStyle
						]}
					>
						{actions.map((item, index) => (
							<MenuItem
								key={index}
								item={item}
								index={index}
								isLast={index === actions.length - 1}
								isHighlighted={highlightedIndex === index}
								onLayout={updateItemPosition}
							/>
						))}
					</Animated.View>
				</Box>
			)}
		</Portal>
	);
});

const styles = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'transparent',
		zIndex: 9998
	},
	interactionArea: {
		...StyleSheet.absoluteFillObject,
		zIndex: 10001
	},
	contextMenu: {
		borderRadius: 12,
		paddingVertical: 3,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
		width: 200
	},
	menuItem: {
		paddingHorizontal: 17.5,
		width: 200,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 40,
		gap: 10
	}
});

export const defaultContextMenuActions: HoldContextMenuAction[] = [
	{
		icon: "content-copy",
		title: "Скопировать (Test)",
		onPress: () => {
			showNotify("system", { message: "Вы не добавили actions" });
		}
	},
	{
		icon: "reply",
		title: "Ответить (Test)",
		onPress: () => {
			showNotify("system", { message: "Вы не добавили actions" });
		}
	},
	{
		icon: "content-copy",
		title: "Скопировать (Test)",
		onPress: () => {
			showNotify("system", { message: "Вы не добавили actions" });
		}
	},
	{
		icon: "reply",
		title: "Ответить (Test)",
		onPress: () => {
			showNotify("system", { message: "Вы не добавили actions" });
		}
	},
	{
		icon: "delete",
		title: "Удалить",
		onPress: () => {
			showNotify("system", { message: "Вы не добавили actions" });
		}
	}
];