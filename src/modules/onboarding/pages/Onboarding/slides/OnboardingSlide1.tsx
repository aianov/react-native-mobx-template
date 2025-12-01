import { MagicCrystalBallAnimation } from '@animations/components/MagicCrystalBallAnimation';
import { MainText } from '@core/ui';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const OnboardingSlide1 = observer(() => {
	const { currentTheme } = themeStore;
	const { t } = useTranslation();

	return (
		<Animated.View
			entering={FadeInDown.duration(600).delay(100)}
			style={s.container}
		>
			<View style={s.animationContainer}>
				<MagicCrystalBallAnimation
					size={200}
				/>
			</View>

			{/* Title */}
			<MainText
				px={32}
				tac="center"
				style={{ fontWeight: '700', marginTop: 40 }}
			>
				{t('onboarding_slide1_title')}
			</MainText>

			{/* Description */}
			<MainText
				px={16}
				tac="center"
				color={currentTheme.secondary_100}
				style={{ marginTop: 16, lineHeight: 24 }}
			>
				{t('onboarding_slide1_description')}
			</MainText>
		</Animated.View>
	);
});

const s = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40
	},
	animationContainer: {
		width: "100%",
		height: 300,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
	},
});

