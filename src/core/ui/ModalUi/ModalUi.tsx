import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

interface ModalUiProps {
	visible: boolean;
	onClose: () => void;
	children?: React.ReactNode;
	animationDuration?: number;
	width?: number;
}

export const ModalUi = observer(({
	visible,
	onClose,
	children,
	animationDuration = 300,
	width = 300,
}: ModalUiProps): React.ReactElement | null => {
	const { currentTheme } = themeStore;

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
		<View style={StyleSheet.absoluteFill}>
			<Animated.View
				style={[
					StyleSheet.absoluteFill,
					styles.overlay,
					{ opacity: opacityAnim }
				]}
			>
				<TouchableWithoutFeedback onPress={onClose}>
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
								{children || (
									<View style={styles.defaultContent}>
										<Text style={styles.defaultText}>Модальное окно</Text>
									</View>
								)}
							</Animated.View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Animated.View>
		</View>
	);
});

const styles = StyleSheet.create({
	modalContainer: {
		borderRadius: 10,
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
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