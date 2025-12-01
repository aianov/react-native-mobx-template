import defaultLogoImport from '@images/defaultlogo.jpg';
import { logger } from '@lib/helpers';
import { appStorage } from '@storage/AppStorage';
import { themeStore } from '@theme/stores';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, ImageProps, ImageStyle, Modal, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { AnimateProps, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MainText } from '../MainText/MainText';
import { SkeletonUi } from '../SkeletonUi/SkeletonUi';

type AnimatedImageProps = AnimateProps<ImageProps>;

interface CleverImageProps extends AnimatedImageProps {
	source: any;
	alt?: string;
	placeholderStyles?: ViewStyle;
	type?: "default" | "user" | "banner";
	imageStyles?: ImageStyle;
	wrapperStyles?: ViewStyle;
	withoutWrapper?: boolean;
	withoutBlur?: boolean;
	withBackgroundBlur?: boolean;
	blurRadius?: number;
	imgOpacity?: number;
	resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
	intensity?: number;
	onImageLoad?: () => void;
	onPress?: () => void;
	cacheTime?: number;
	debugDownload?: boolean;
	// Video props
	isVideo?: boolean;
	videoUri?: string;
	isInView?: boolean;
	onVideoPress?: () => void;
}

export const CleverImage = observer(({
	source,
	alt = "Image",
	type = "default",
	placeholderStyles,
	intensity,
	imageStyles,
	wrapperStyles,
	debugDownload = false,
	withoutWrapper = false,
	withoutBlur = true,
	withBackgroundBlur = false,
	blurRadius = 15,
	imgOpacity = 1,
	resizeMode = 'contain',
	onImageLoad,
	onPress,
	cacheTime,
	// Video props
	isVideo = false,
	videoUri,
	isInView = false,
	onVideoPress,
	...props
}: CleverImageProps) => {
	const { currentTheme } = themeStore;

	const [imageLoaded, setImageLoaded] = useState(false);
	const [cachedSource, setCachedSource] = useState<any>(null);
	const [isLoadingFromNetwork, setIsLoadingFromNetwork] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [position, setPosition] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [imageError, setImageError] = useState(false);

	const videoRef = useRef<Video>(null);
	const opacity = useSharedValue(0);
	const progressX = useSharedValue(0);
	const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

	useEffect(() => {
		if (isVideo && videoRef.current) {
			if (isInView && !isFullscreen) {
				videoRef.current.playAsync();
				setIsPlaying(true);
			} else {
				videoRef.current.pauseAsync();
				setIsPlaying(false);
			}
		}
	}, [isInView, isVideo, isFullscreen]);

	useEffect(() => {
		if (isVideo && videoRef.current && isInView && !isPlaying) {
			videoRef.current.setPositionAsync(0);
			setPosition(0);
			progressX.value = 0;
		}
	}, [isInView, isVideo]);

	const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
		if (status.isLoaded) {
			setDuration(status.durationMillis || 0);
			setPosition(status.positionMillis || 0);

			if (status.durationMillis && status.durationMillis > 0) {
				const progress = (status.positionMillis || 0) / status.durationMillis;
				progressX.value = progress * (screenWidth - 40);
			}
		}
	}, [screenWidth]);

	const progressGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
		onStart: () => {
			if (videoRef.current) {
				runOnJS((ref: any) => ref.pauseAsync())(videoRef.current);
			}
		},
		onActive: (event: PanGestureHandlerGestureEvent['nativeEvent']) => {
			const maxWidth = screenWidth - 40;
			const newX = Math.max(0, Math.min(event.x, maxWidth));
			progressX.value = newX;

			const newPosition = (newX / maxWidth) * duration;
			runOnJS((pos: number) => {
				if (videoRef.current) {
					videoRef.current.setPositionAsync(pos);
				}
			})(newPosition);
		},
		onEnd: () => {
			if (videoRef.current && isPlaying) {
				runOnJS((ref: any) => ref.playAsync())(videoRef.current);
			}
		}
	});

	const handleVideoPress = useCallback(() => {
		if (onVideoPress) {
			onVideoPress();
			return;
		}
		setIsFullscreen(true);
	}, [onVideoPress]);

	const animatedImageStyle = useAnimatedStyle(() => { return { opacity: opacity.value }; });
	const progressBarStyle = useAnimatedStyle(() => { return { width: progressX.value, }; });
	const handleCloseFullscreen = useCallback(() => { setIsFullscreen(false); }, []);

	useEffect(() => {
		if (!source) return;

		let isCancelled = false;

		if (typeof source === 'string' && source.startsWith('http')) {
			setIsLoadingFromNetwork(true);
			setImageLoaded(false);

			const loadCachedImage = async () => {
				try {
					const mediaKey = `image_${hashString(source)}`;
					let cachedPath = await appStorage.getMedia(mediaKey);

					if (isCancelled) return;

					if (cachedPath && cachedPath !== source) {
						if (debugDownload) logger.ui("CleverImage", `Getting from CACHE: ${cachedPath}`);
						setCachedSource({ uri: cachedPath });
						setIsLoadingFromNetwork(false);
					} else {
						if (debugDownload) logger.ui("CleverImage", `Getting from NETWORK: ${source}`);
						setCachedSource({ uri: source });

						appStorage.saveMedia(source).catch(err => {
							console.error('Error saving media:', err);
						});
					}
				} catch (error) {
					if (!isCancelled) {
						console.error('Error loading cached image:', error);
						setCachedSource({ uri: source });
						setIsLoadingFromNetwork(false);
					}
				}
			};

			loadCachedImage();
		} else {
			setCachedSource(source);
			setIsLoadingFromNetwork(false);
		}

		return () => {
			isCancelled = true;
		};
	}, [source]);

	const handleImageLoad = () => {
		setImageLoaded(true);
		setIsLoadingFromNetwork(false);
		opacity.value = withTiming(imgOpacity, { duration: 300 });
		if (onImageLoad) {
			onImageLoad();
		}
	};

	const getImageSource = () => {
		if (isLoadingFromNetwork && !imageLoaded) {
			if (type === "user") return defaultLogoImport;
			if (type === "banner") return defaultBannerImport;
			return null;
		}

		if (type === "user") {
			if (!cachedSource) return defaultLogoImport;
			return cachedSource;
		}
		if (type === "banner") {
			if (!cachedSource) return defaultBannerImport;
			return cachedSource;
		}
		return cachedSource || source;
	};

	const finalSource = getImageSource();

	let imageSource;
	if (typeof finalSource === 'string') {
		imageSource = { uri: finalSource };
	} else if (typeof finalSource === 'number') {
		imageSource = finalSource;
	} else {
		imageSource = finalSource;
	}

	const onImageError = () => setImageError(true);

	if (imageError) {
		return (
			<View
				style={{
					width: "100%",
					height: "100%",
					backgroundColor: currentTheme.btn_bg_300,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<MainText>image_error</MainText>
			</View>
		);
	}

	if (intensity && imageSource) {
		return (
			<View style={[wrapperStyles, { flex: 1, width: "100%", overflow: "hidden" }]}>
				<Animated.Image
					source={imageSource}
					accessibilityLabel={alt}
					style={[
						styles.fullSizeAbsolute,
						{ opacity: imgOpacity, objectFit: "cover" },
						imageStyles,
						animatedImageStyle
					]}
					onError={onImageError}
					onLoad={handleImageLoad}
					resizeMode={resizeMode}
					{...props}
				/>
				<BlurView
					intensity={intensity}
					style={{ flex: 1, width: "100%", zIndex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)" }}
				/>
			</View>
		);
	}

	if (withoutWrapper && imageSource) return (
		<>
			{isLoadingFromNetwork && type === "user" && (
				<View style={[styles.fullSizeAbsolute, { justifyContent: 'center', alignItems: 'center', backgroundColor: currentTheme.bg_200 }]}>
				</View>
			)}
			<Animated.Image
				source={imageSource}
				accessibilityLabel={alt}
				style={[
					styles.fullSizeAbsolute,
					{ opacity: imgOpacity },
					imageStyles,
					animatedImageStyle
				]}
				onError={onImageError}
				onLoad={handleImageLoad}
			/>
		</>
	);

	if (isVideo && videoUri) {
		return (
			<>
				<TouchableOpacity
					style={[styles.wrapper, wrapperStyles]}
					onPress={handleVideoPress}
					activeOpacity={0.8}
				>
					<Video
						ref={videoRef}
						source={{ uri: videoUri }}
						style={[styles.video, imageStyles]}
						resizeMode={ResizeMode.COVER}
						shouldPlay={isInView && !isFullscreen}
						isLooping
						isMuted
						onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
						onError={onImageError}
					/>
				</TouchableOpacity>

				{/* Fullscreen Modal */}
				<Modal
					visible={isFullscreen}
					animationType="slide"
					supportedOrientations={['portrait', 'landscape']}
					onRequestClose={handleCloseFullscreen}
				>
					<View style={styles.fullscreenContainer}>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={handleCloseFullscreen}
						>
							<View style={styles.closeIcon} />
						</TouchableOpacity>

						<Video
							source={{ uri: videoUri }}
							style={styles.fullscreenVideo}
							resizeMode={ResizeMode.CONTAIN}
							shouldPlay={true}
							isLooping
							useNativeControls={false}
							onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
							onError={onImageError}
						/>

						{/* Custom Progress Bar */}
						<View style={styles.progressContainer}>
							<PanGestureHandler onGestureEvent={progressGestureHandler}>
								<Animated.View style={styles.progressBarContainer}>
									<View style={styles.progressBarBackground} />
									<Animated.View style={[styles.progressBarFill, progressBarStyle]} />
									<Animated.View
										style={[
											styles.progressHandle,
											{ transform: [{ translateX: progressX.value }] }
										]}
									/>
								</Animated.View>
							</PanGestureHandler>
						</View>
					</View>
				</Modal>
			</>
		);
	}

	if (withBackgroundBlur) {
		return (
			<TouchableOpacity
				style={[styles.wrapper, wrapperStyles]}
				onPress={onPress}
				activeOpacity={onPress ? 0.8 : 1}
			>
				{!imageLoaded && (
					<SkeletonUi>
						<View
							style={{
								width: '100%',
								height: '100%',
								position: 'absolute',
								borderRadius: Number(placeholderStyles?.borderRadius) || 5,
								top: 0,
								left: 0,
								zIndex: 1,
								...placeholderStyles,
							}}
						/>
					</SkeletonUi>
				)}

				<ImageBackground
					source={imageSource}
					style={styles.backgroundImage}
					blurRadius={blurRadius}
					onError={onImageError}
				>
					<View style={styles.imageWrapper}>
						<Animated.Image
							source={imageSource}
							accessibilityLabel={alt}
							onError={onImageError}
							style={[
								styles.image,
								imageStyles,
								animatedImageStyle
							]}
							resizeMode={resizeMode}
							onLoad={handleImageLoad}
							{...props}
						/>
					</View>
				</ImageBackground>
			</TouchableOpacity>
		);
	}

	return (
		<TouchableOpacity
			style={[styles.wrapper, wrapperStyles]}
			onPress={onPress}
			activeOpacity={onPress ? 0.8 : 1}
		>
			{isLoadingFromNetwork && type === "user" && (
				<View
					style={{
						width: '100%',
						height: '100%',
						position: 'absolute',
						top: 0,
						left: 0,
						zIndex: 999,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: currentTheme.bg_200
					}}
				>
				</View>
			)}
			{!imageLoaded && !isLoadingFromNetwork && type !== "user" && (
				<SkeletonUi>
					<View
						style={{
							width: '100%',
							height: '100%',
							position: 'absolute',
							borderRadius: Number(placeholderStyles?.borderRadius) || 5,
							top: 0,
							left: 0,
							zIndex: 1,
							...placeholderStyles,
						}}
					/>
				</SkeletonUi>
			)}

			{!withoutBlur && imageLoaded && (
				<View
					style={[
						styles.blurBackground,
						{
							backgroundColor: 'transparent',
						}
					]}
				>
					<Image
						source={imageSource}
						style={styles.blurredImage}
						blurRadius={blurRadius}
						onError={onImageError}
					/>
				</View>
			)}

			<Animated.Image
				source={imageSource}
				accessibilityLabel={alt}
				style={[
					styles.image,
					imageStyles,
					animatedImageStyle
				]}
				onError={onImageError}
				resizeMode={resizeMode}
				onLoad={handleImageLoad}
				{...props}
			/>
		</TouchableOpacity>
	);
});

const hashString = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36);
};

const styles = StyleSheet.create({
	wrapper: {
		position: 'relative',
		overflow: 'hidden',
	},
	fullSizeAbsolute: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
	},
	skeletonContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1,
	},
	blurBackground: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
	},
	blurredImage: {
		width: '110%',
		height: '110%',
		position: 'absolute',
		top: '-5%',
		left: '-5%',
	},
	backgroundImage: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	imageWrapper: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
		position: 'relative',
		zIndex: 2,
	},
	video: {
		width: '100%',
		height: '100%',
	},
	fullscreenContainer: {
		flex: 1,
		backgroundColor: 'black',
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeButton: {
		position: 'absolute',
		top: 50,
		right: 20,
		width: 50,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10,
	},
	closeIcon: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: 'white',
	},
	fullscreenVideo: {
		width: '100%',
		height: '100%',
	},
	progressContainer: {
		position: 'absolute',
		bottom: 20,
		left: 20,
		right: 20,
		zIndex: 10,
	},
	progressBarContainer: {
		height: 10,
		borderRadius: 5,
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
		overflow: 'hidden',
	},
	progressBarBackground: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		borderRadius: 5,
	},
	progressBarFill: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		borderRadius: 5,
		backgroundColor: 'white',
	},
	progressHandle: {
		position: 'absolute',
		top: -5,
		bottom: -5,
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: 'white',
		zIndex: 1,
	},
});
