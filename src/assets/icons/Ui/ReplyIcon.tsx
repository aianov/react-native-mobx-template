import Svg, { Path } from 'react-native-svg';

export const ReplyIcon = ({ size = 20, color = "currentColor" }) => {
	return (
		<Svg
			style={{
				transform: [{ rotate: '180deg' }]
			}}
			width={size}
			height={size}
			viewBox="0 0 46 37"
			fill="none"
		>
			<Path d="M28.8541 2.08577C27.5914 0.835671 25.4472 1.72993 25.4469 3.50667V9.82893C11.0742 12.371 4.25338 22.3655 1.57092 32.6766C1.29046 33.7547 1.92016 34.631 2.65588 34.9764C3.37392 35.3135 4.39574 35.2524 5.0719 34.453C9.90152 28.7415 16.3779 25.89 25.4469 25.6112V31.91C25.447 33.6869 27.5914 34.581 28.8541 33.3309L43.1989 19.1297C43.9894 18.3471 43.9894 17.0696 43.1989 16.2869L28.8541 2.08577Z" stroke={color} strokeWidth="3" />
		</Svg>
	);
};