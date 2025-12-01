import Svg, { Path } from 'react-native-svg'

export const CrownIcon = ({ width = 25, height = 22, color = "white" }) => {
	return (
		<Svg width={width} height={height} viewBox="0 0 25 22" fill="none">
			<Path d="M2.77778 16.5L0 1.375L7.63889 8.25L12.5 0L17.3611 8.25L25 1.375L22.2222 16.5H2.77778ZM22.2222 20.625C22.2222 21.45 21.6667 22 20.8333 22H4.16667C3.33333 22 2.77778 21.45 2.77778 20.625V19.25H22.2222V20.625Z" fill={color} />
		</Svg>
	)
}