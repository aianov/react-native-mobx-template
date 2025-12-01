import { BlurView } from "expo-blur";
import { observer } from 'mobx-react-lite';
import { StyleProp, ViewStyle } from 'react-native';

interface BlurUiProps {
	intensity?: number;
	style?: StyleProp<ViewStyle>;
	flex?: number;
	children?: React.ReactNode;
	debug?: boolean;
}

export const BlurUi = observer(({
	intensity = 10,
	style = {},
	flex = 1,
	debug = false,
	children
}: BlurUiProps) => {
	return (
		<BlurView
			intensity={intensity}
			style={[
				debug && {
					borderWidth: 0.5,
					borderColor: 'red'
				},
				{
					flex
				},
				style
			]}
		>
			{children && children}
		</BlurView>
	);
});