import { themeStore } from '@theme/stores';
import Svg, { Path } from 'react-native-svg';

export const CheckedIcon = ({ size = 24, color = themeStore.currentTheme.text_100 }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
			<Path d="M20 6 9 17l-5-5" />
		</Svg>
	);
};