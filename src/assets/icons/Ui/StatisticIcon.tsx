import Svg, { Rect } from 'react-native-svg'

export const StatisticIcon = ({ size = 20 }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
			<Rect width={size} height={size} rx="8" fill="#925BFF" />
			<Rect x="7" y="10.5294" width="3.52941" height="11.4706" rx="1" fill="white" />
			<Rect x="12.2941" y="7" width="3.52941" height="15" rx="1" fill="white" />
			<Rect x="17.5882" y="14.9412" width="3.52941" height="7.05882" rx="1" fill="white" />
		</Svg>
	)
}