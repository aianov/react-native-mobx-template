import Svg, { Path, Rect } from 'react-native-svg'

export const CommentSettingIcon = ({ size = 20 }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
			<Rect width={size} height={size} rx="6" fill="#0066FF" />
			<Path d="M11 16C11.9889 16 12.9556 15.7068 13.7778 15.1573C14.6001 14.6079 15.241 13.827 15.6194 12.9134C15.9978 11.9998 16.0969 10.9945 15.9039 10.0246C15.711 9.05465 15.2348 8.16373 14.5355 7.46447C13.8363 6.76521 12.9454 6.289 11.9755 6.09608C11.0055 5.90315 10.0002 6.00217 9.08658 6.3806C8.17295 6.75904 7.39206 7.39991 6.84265 8.22215C6.29324 9.0444 6 10.0111 6 11C6 11.8267 6.2 12.6061 6.55556 13.2928L6 16L8.70722 15.4444C9.39389 15.8 10.1739 16 11 16Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
		</Svg>
	)
}