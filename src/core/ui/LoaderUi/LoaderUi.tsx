import { MaterialCommunityIcons } from '@expo/vector-icons';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { ActivityIndicator, ActivityIndicatorProps, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const LoaderUi = observer(({
	size = "large",
	color = themeStore.currentTheme.primary_100,
	progress = 0.1,
	type = "default",
	radius: customRadius,
	thickness = 2.5,
	roundness = "round",
	debug = false,
	speed = 3,
	closeCallback,
	gap = 3,
	...props
}: LoaderUiProps) => {
	const { currentTheme } = themeStore;
	const getDuration = () => {
		const normalizedSpeed = Math.min(10, Math.max(1, speed));
		return 1500 - ((normalizedSpeed - 1) * (1500 - 300) / 9);
	};

	const circleSize = type === "progress" ?
		(typeof size === 'number' ? size : (size === 'large' ? 50 : 35)) :
		24;

	const rotation = useSharedValue(0);
	const animatedProgress = useSharedValue(progress || 0);

	useEffect(() => {
		const previousProgress = animatedProgress.value;
		const newProgress = progress || 0;
		const progressDiff = Math.abs(newProgress - previousProgress);

		const MIN_DURATION = 200;
		const MAX_DURATION = 1000;

		const duration = MAX_DURATION - (progressDiff * (MAX_DURATION - MIN_DURATION));

		animatedProgress.value = withTiming(newProgress, {
			duration: Math.max(MIN_DURATION, Math.min(MAX_DURATION, duration)),
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
	}, [progress]);

	const maxRadius = (circleSize / 2) - thickness - gap;
	const radius = Math.min(customRadius || maxRadius, maxRadius);

	const getCloseIconSize = () => {
		const baseSize = typeof size === 'number' ? size : (size === 'large' ? 40 : 40);
		return Math.max(12, baseSize / 2);
	};

	useEffect(() => {
		if (type === "progress") {
			rotation.value = 0;
			rotation.value = withRepeat(
				withTiming(360, {
					duration: getDuration(),
					easing: Easing.linear
				}),
				-1,
				false
			);
		}
	}, [type, speed]);

	const getArcPath = (angle: number) => {
		'worklet';
		const centerX = circleSize / 2;
		const centerY = circleSize / 2;

		if (angle >= 360) {
			return `
				M ${centerX} ${centerY - radius}
				A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius}
				A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius}
			`.trim();
		}

		const angleRad = (angle * Math.PI) / 180;
		const startX = centerX;
		const startY = centerY - radius;
		const endX = centerX + radius * Math.sin(angleRad);
		const endY = centerY - radius * Math.cos(angleRad);
		const largeArcFlag = angle > 180 ? 1 : 0;

		return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
	};

	const animatedStyle = useAnimatedStyle(() => {
		'worklet';
		return {
			transform: [{ rotate: `${rotation.value}deg` }]
		};
	});

	const animatedProps = useAnimatedProps(() => {
		'worklet';
		return {
			d: getArcPath(animatedProgress.value * 360)
		};
	});

	if (type === "progress") {
		return (
			<Pressable
				onPress={closeCallback}
				style={[
					styles.container,
					{ width: circleSize, height: circleSize },
					debug && { backgroundColor: "red" }
				]}
			>
				<View
					style={[
						styles.closeIconContainer,
						{
							width: "100%",
							height: "100%",
							borderRadius: "50%",
							backgroundColor: "rgba(0, 0, 0, 0.8)",
							overflow: "hidden",
							justifyContent: "center",
							alignItems: "center"
						}
					]}
				>
					<Animated.View style={[{ width: circleSize, height: circleSize }, animatedStyle]}>
						<Svg width={circleSize} height={circleSize}>
							<AnimatedPath
								animatedProps={animatedProps}
								stroke={"white"}
								strokeWidth={thickness}
								strokeLinecap={roundness === "square" ? "butt" : "round"}
								fill="none"
							/>
						</Svg>
					</Animated.View>
					{closeCallback && (
						<View style={[
							styles.closeIconContainer,
							{
								width: "100%",
								height: "100%",
							}
						]}>
							<MaterialCommunityIcons
								name="close"
								size={getCloseIconSize()}
								color="#fff"
							/>
						</View>
					)}
				</View>
			</Pressable>
		);
	}

	return (
		<ActivityIndicator
			size={size}
			color={color}
			{...props}
		/>
	);
});

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden'
	},
	closeIconContainer: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1
	}
});

interface LoaderUiProps extends ActivityIndicatorProps {
	size?: number | "small" | "large";
	color?: string;
	progress?: number;
	type?: "default" | "progress";
	radius?: number;
	thickness?: number;
	roundness?: "round" | "square";
	debug?: boolean;
	speed?: number;
	closeCallback?: () => void;
	gap?: number;
}
