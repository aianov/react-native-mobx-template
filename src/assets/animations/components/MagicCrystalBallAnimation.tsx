import magiCrystalBallAnimation from "@animations/magic_crystal_ball.json";
import LottieView from 'lottie-react-native';
import { observer } from 'mobx-react-lite';
import { View } from 'react-native';

export const MagicCrystalBallAnimation = observer(({
	size = 100
}: PremiumIconUiProps) => {
	const style = {
		width: size,
		height: size,
	};

	return (
		<View style={style}>
			<LottieView
				source={magiCrystalBallAnimation}
				autoPlay
				loop
				style={{ width: size, height: size }}
			/>
		</View>
	);
});

interface PremiumIconUiProps {
	size?: number;
}