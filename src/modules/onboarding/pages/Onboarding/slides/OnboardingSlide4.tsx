import { PartyAnimation } from '@animations/components/PartyAnimation';
import { MainText, SecondaryText } from '@core/ui';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const OnboardingSlide4 = observer(() => {
	const { currentTheme } = themeStore;
	const { t } = useTranslation();

	return (
		<Animated.View
			entering={FadeInDown.duration(600).delay(100)}
			style={s.container}
		>
			<View style={s.animationContainer}>
				<PartyAnimation
					size={225}
				/>
			</View>

			{/* Title */}
			<MainText
				px={32}
				tac="center"
				style={{ fontWeight: '700', marginTop: 40 }}
			>
				{t('onboarding_slide4_title')}
			</MainText>

			{/* Description */}
			<SecondaryText
				px={16}
				tac="center"
				style={{ marginTop: 16, lineHeight: 24 }}
			>
				{t('onboarding_slide4_description')}
			</SecondaryText>
		</Animated.View>
	);
});

const s = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 30,
	},
	animationContainer: {
		width: 300,
		height: 300,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		padding: 20,
	},
});

