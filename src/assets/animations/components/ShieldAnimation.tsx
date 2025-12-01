import shieldAnimation from "@animations/shield.json";
import LottieView from 'lottie-react-native';
import { observer } from 'mobx-react-lite';
import { View } from 'react-native';

export const ShieldAnimation = observer(({
	size = 100
}: PremiumIconUiProps) => {
	const style = {
		width: size,
		height: size,
	};

	return (
		<View style={style}>
			<LottieView
				source={shieldAnimation}
				autoPlay
				loop
				speed={0.4}
				style={{ width: size, height: size }}
			/>
		</View>
	);
});

interface PremiumIconUiProps {
	size?: number;
}