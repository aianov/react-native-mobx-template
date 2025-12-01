import { GROUPED_BTNS_ICON_SIZE } from '@core/config/const';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export const AppereanceColoredIcon = ({ size = GROUPED_BTNS_ICON_SIZE }) => {
	return (
		<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
			<Rect width={size} height={size} rx="7" fill="url(#paint0_linear_152_2719)" />
			<G transform={`translate(-1.5, -1) scale(${size / 30})`}>
				<Path d="M22.773 6H16.6183L20.5346 10.761L22.773 6ZM9.71938 6L11.9578 10.761L15.8741 6H9.71938ZM16.2462 7.80967L13.2691 11.4286H19.2233L16.2462 7.80967ZM24.0122 6.80835L21.8403 11.4286H27.0382L24.0122 6.80835ZM8.48017 6.80835L5.40771 11.4286H10.652L8.48017 6.80835ZM11.1609 12.7857H5.45423L15.8182 25H15.8429L11.1609 12.7857ZM21.3314 12.7857L16.6495 25H16.6741L27.0382 12.7857H21.3314ZM19.6601 12.7857H12.8323L16.2462 21.6071L19.6601 12.7857Z" fill="white" />
			</G>
			<Defs>
				<LinearGradient id="paint0_linear_152_2719" x1="14.6005" y1="-1" x2="22.1615" y2="28.4099" gradientUnits="userSpaceOnUse">
					<Stop offset="0.005" stopColor="#032CFF" />
					<Stop offset="0.5025" stopColor="#03B3FF" />
					<Stop offset="1" stopColor="#0094FF" />
				</LinearGradient>
			</Defs>
		</Svg>
	);
};