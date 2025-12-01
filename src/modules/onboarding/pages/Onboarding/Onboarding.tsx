import { authStore } from '@auth/stores';
import { BgWrapperUi, ButtonUi, MainText, PressableUi } from '@core/ui';
import { navigate } from '@lib/navigation';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
	Extrapolate,
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated';
import { OnboardingSlide1 } from './slides/OnboardingSlide1';
import { OnboardingSlide2 } from './slides/OnboardingSlide2';
import { OnboardingSlide3 } from './slides/OnboardingSlide3';
import { OnboardingSlide4 } from './slides/OnboardingSlide4';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES_DATA = [
	{ id: 1, component: OnboardingSlide1 },
	{ id: 2, component: OnboardingSlide2 },
	{ id: 3, component: OnboardingSlide3 },
	{ id: 4, component: OnboardingSlide4 },
];

export const Onboarding = observer(() => {
	const { currentTheme } = themeStore;
	const {
		currentSlide: { currentSlide, setCurrentSlide },
		completeOnboarding,
		skipOnboarding
	} = authStore;
	const { t } = useTranslation();

	const scrollViewRef = useRef<Animated.ScrollView>(null);
	const scrollX = useSharedValue(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
			const index = Math.round(event.contentOffset.x / SCREEN_WIDTH);
		},
	});

	const handleNext = () => {
		if (currentSlide < SLIDES_DATA.length - 1) {
			const nextSlide = currentSlide + 1;
			setCurrentSlide(nextSlide);
			scrollViewRef.current?.scrollTo({
				x: nextSlide * SCREEN_WIDTH,
				animated: true
			});
		} else {
			handleGetStarted();
		}
	};

	const handleSkip = async () => {
		await skipOnboarding();
		navigate('SignUp');
	};

	const handleGetStarted = async () => {
		await completeOnboarding();
		navigate('SignUp');
	};

	const isLastSlide = currentSlide === SLIDES_DATA.length - 1;

	return (
		<BgWrapperUi requiredBg={false} style={s.container}>
			{/* Skip Button */}
			{!isLastSlide && (
				<View style={s.skipContainer}>
					<PressableUi onPress={handleSkip}>
						<MainText
							px={16}
							style={{ fontWeight: '600' }}
							color={currentTheme.secondary_100}
						>
							{t('skip')}
						</MainText>
					</PressableUi>
				</View>
			)}

			{/* Slides */}
			<Animated.ScrollView
				ref={scrollViewRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				onMomentumScrollEnd={(e) => {
					const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
					setCurrentSlide(index);
				}}
			>
				{SLIDES_DATA.map((slide) => {
					const SlideComponent = slide.component;
					return (
						<View key={slide.id} style={[s.slide, { width: SCREEN_WIDTH }]}>
							<SlideComponent />
						</View>
					);
				})}
			</Animated.ScrollView>

			{/* Pagination Dots */}
			<View style={s.pagination}>
				{SLIDES_DATA.map((_, index) => {
					const animatedDotStyle = useAnimatedStyle(() => {
						const inputRange = [
							(index - 1) * SCREEN_WIDTH,
							index * SCREEN_WIDTH,
							(index + 1) * SCREEN_WIDTH,
						];

						const dotWidth = interpolate(
							scrollX.value,
							inputRange,
							[8, 24, 8],
							Extrapolate.CLAMP
						);

						const opacity = interpolate(
							scrollX.value,
							inputRange,
							[0.3, 1, 0.3],
							Extrapolate.CLAMP
						);

						return {
							width: withSpring(dotWidth),
							opacity: withSpring(opacity),
						};
					});

					return (
						<Animated.View
							key={index}
							style={[
								s.dot,
								{
									backgroundColor: currentTheme.primary_100,
								},
								animatedDotStyle,
							]}
						/>
					);
				})}
			</View>

			{/* Bottom Button */}
			<View style={s.bottomContainer}>
				<ButtonUi
					onPress={handleNext}
					bRad={30}
					height={50}
				>
					<MainText
						px={18}
						style={{ fontWeight: '600' }}
						color={currentTheme.btn_bg_000}
					>
						{isLastSlide ? t('get_started') : t('next')}
					</MainText>
				</ButtonUi>
			</View>
		</BgWrapperUi>
	);
});

const s = StyleSheet.create({
	bottomContainer: {
		paddingHorizontal: 30,
		paddingBottom: 40,
	},
	container: {
		flex: 1,
	},
	skipContainer: {
		position: 'absolute',
		top: 60,
		right: 20,
		zIndex: 100,
	},
	slide: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	pagination: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 20,
		gap: 8,
	},
	dot: {
		height: 8,
		borderRadius: 4,
	},
});

