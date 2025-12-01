import React, { useEffect, useRef } from 'react'
import { Animated as AnimatedRn, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, { AnimatedStyle } from 'react-native-reanimated'
import { AnimatedAppLogo } from '../AnimatedAppLogo/AnimatedAppLogo'
import { LoaderUi } from '../LoaderUi/LoaderUi'

interface CustomRefreshControlProps {
	refreshing: boolean
	onRefresh: () => void | Promise<void>
	progressViewOffset?: number
	containerStyle?: AnimatedStyle<StyleProp<ViewStyle>>
	progress?: AnimatedRn.Value
	onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
	isAbsolute?: boolean
}

export const CustomRefreshControl = ({
	refreshing,
	onRefresh,
	progressViewOffset = 0,
	progress: externalProgress,
	onScroll,
	containerStyle = {},
	isAbsolute = false
}: CustomRefreshControlProps) => {
	const progress = externalProgress || useRef(new AnimatedRn.Value(0)).current

	useEffect(() => {
		if (refreshing) {
			AnimatedRn.loop(
				AnimatedRn.sequence([
					AnimatedRn.timing(progress, {
						toValue: 1,
						duration: 1000,
						useNativeDriver: true,
					}),
					AnimatedRn.timing(progress, {
						toValue: 0.7,
						duration: 500,
						useNativeDriver: true,
					})
				])
			).start()
		} else {
			AnimatedRn.timing(progress, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start()
		}
	}, [refreshing])

	const handleRefresh = () => {
		onRefresh()
	}

	// Если компонент используется как абсолютный (поверх контента)
	if (isAbsolute) {
		return (
			<Animated.View
				style={[
					styles.refreshingContainer,
					styles.absoluteContainer,
					containerStyle
				]}
			>
				{refreshing ? (
					<LoaderUi size={"small"} />
				) : (
					<AnimatedAppLogo progress={progress} />
				)}
			</Animated.View>
		)
	}

	// Стандартный вариант использования
	return (
		<>
			<RefreshControl
				refreshing={refreshing}
				onRefresh={handleRefresh}
				progressViewOffset={progressViewOffset}
				tintColor="transparent"
				colors={['transparent']}
				progressBackgroundColor="transparent"
				style={styles.refreshControl}
			/>
			<View
				style={[
					styles.refreshingContainer
				]}
			>
				{refreshing ? (
					<LoaderUi size={"small"} />
				) : (
					<AnimatedAppLogo progress={progress} />
				)}
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	refreshControl: {
		backgroundColor: 'transparent',
	},
	progressView: {
		backgroundColor: 'transparent',
	},
	refreshingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 100,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: 'transparent',
		zIndex: 1
	},
	absoluteContainer: {
		position: 'absolute',
		top: 30,
		left: 0,
		right: 0,
		elevation: 5,
		opacity: 1
	},
}) 