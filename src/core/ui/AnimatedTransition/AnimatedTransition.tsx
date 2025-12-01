import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native'
import { useLocation, useNavigate } from 'react-router-native'

const { width } = Dimensions.get('window')

interface AnimatedTransitionProps {
	children: React.ReactNode
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ children }) => {
	const translateX = useRef(new Animated.Value(width)).current
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		// Анимация входа
		Animated.timing(translateX, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start()
	}, [])

	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gestureState) => {
				// Активируем только при горизонтальном свайпе от левого края
				return gestureState.dx > 20 && gestureState.dx > Math.abs(gestureState.dy) && gestureState.moveX < 50
			},
			onPanResponderMove: (_, gestureState) => {
				// Ограничиваем движение только вправо
				if (gestureState.dx > 0) {
					translateX.setValue(gestureState.dx)
				}
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dx > width / 3) {
					// Если свайп достаточно длинный, завершаем анимацию и возвращаемся назад
					Animated.timing(translateX, {
						toValue: width,
						duration: 300,
						useNativeDriver: true,
					}).start(() => {
						navigate(-1)
					})
				} else {
					// Иначе возвращаем на место
					Animated.timing(translateX, {
						toValue: 0,
						duration: 300,
						useNativeDriver: true,
					}).start()
				}
			},
		})
	).current

	return (
		<View style={styles.container}>
			<Animated.View
				style={[
					styles.animatedContainer,
					{ transform: [{ translateX }] }
				]}
				{...panResponder.panHandlers}
			>
				{children}
			</Animated.View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
	},
	animatedContainer: {
		flex: 1,
		width: '100%',
		height: '100%',
	},
}) 