import { haptics } from '@utils/haptics';
import { observer } from 'mobx-react-lite';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface PressableUiProps {
	children: ReactNode;
	onPress?: () => void;
	onLongPress?: () => void;
	longPressDuration?: number;
	longPressScale?: number;
	tapScale?: number;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
}

const SPRING_CONFIG = {
	damping: 25,
	stiffness: 400,
	mass: 0.5,
};

export const PressableUi = observer(({
	children,
	onPress,
	onLongPress,
	longPressDuration = 500,
	longPressScale = 0.92,
	tapScale = 0.98,
	disabled = false,
	style,
}: PressableUiProps) => {
	const scale = useSharedValue(1);

	const handlePress = () => {
		if (onPress && !disabled) {
			onPress();
		}
	};

	const handleLongPress = () => {
		if (onLongPress && !disabled) {
			onLongPress();
		}
	};

	const longPressGesture = Gesture.LongPress()
		.minDuration(longPressDuration)
		.enabled(!disabled && !!onLongPress)
		.onBegin(() => {
			'worklet';
			scale.value = withTiming(longPressScale, { duration: longPressDuration });
		})
		.onStart(() => {
			'worklet';
			scale.value = withSpring(1, SPRING_CONFIG);
			runOnJS(handleLongPress)();
			runOnJS(haptics.medium)();
		})
		.onFinalize(() => {
			'worklet';
			scale.value = withSpring(1, SPRING_CONFIG);
		});

	const tapGesture = Gesture.Tap()
		.enabled(!disabled)
		.maxDuration(onLongPress ? longPressDuration - 50 : 250)
		.onStart(() => {
			'worklet';
			scale.value = withTiming(tapScale, { duration: 100 });
		})
		.onEnd(() => {
			'worklet';
			scale.value = withSpring(1, { ...SPRING_CONFIG, damping: 15 });
			runOnJS(handlePress)();
			runOnJS(haptics.selection)();
		})
		.onFinalize(() => {
			'worklet';
			scale.value = withSpring(1, SPRING_CONFIG);
		});

	const composed = onLongPress
		? Gesture.Simultaneous(longPressGesture, tapGesture)
		: tapGesture;

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<GestureDetector gesture={composed}>
			<Animated.View style={[style, animatedStyle]}>
				{children}
			</Animated.View>
		</GestureDetector>
	);
});
