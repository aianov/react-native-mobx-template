import { GROUPED_BTNS_ICON_SIZE } from '@core/config/const';
import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

export const LogoColoredIcon = ({ size = GROUPED_BTNS_ICON_SIZE }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill='none'
    >
      <Rect width={30} height={30} rx={7} fill='url(#paint0_linear_152_2725)' />
      <G transform={`translate(-1.5, -1) scale(${size / 30})`}>
        <Path
          d='M13.9595 7.28571L16.3434 6L18.7272 7.28571'
          fill='url(#paint1_linear_152_2725)'
        />
        <Path
          d='M13.9595 7.28571L16.3434 6L18.7272 7.28571'
          stroke='white'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path d='M16.3433 6V9.21428V6Z' fill='url(#paint2_linear_152_2725)' />
        <Path
          d='M16.3433 6V9.21428'
          stroke='white'
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap='round'
        />
        <Path
          d='M18.7272 22.7139L16.3434 23.9996L13.9595 22.7139'
          fill='url(#paint3_linear_152_2725)'
        />
        <Path
          d='M18.7272 22.7139L16.3434 23.9996L13.9595 22.7139'
          stroke='white'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M16.3433 24.0004V20.7861V24.0004Z'
          fill='url(#paint4_linear_152_2725)'
        />
        <Path
          d='M16.3433 24.0004V20.7861'
          stroke='white'
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap='round'
        />
        <Path
          d='M8 13.0512V10.4994L10.3096 9.2334'
          fill='url(#paint5_linear_152_2725)'
        />
        <Path
          d='M8 13.0512V10.4994L10.3096 9.2334'
          stroke='white'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M8 10.5L10.924 12.1071L8 10.5Z'
          fill='url(#paint6_linear_152_2725)'
        />
        <Path
          d='M8 10.5L10.924 12.1071'
          stroke='white'
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap='round'
        />
        <Path
          d='M24.6865 16.9482V19.5L22.377 20.766'
          fill='url(#paint7_linear_152_2725)'
        />
        <Path
          d='M24.6865 16.9482V19.5L22.377 20.766'
          stroke='white'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M24.6862 19.4997L21.7622 17.8926L24.6862 19.4997Z'
          fill='url(#paint8_linear_152_2725)'
        />
        <Path
          d='M24.6862 19.4997L21.7622 17.8926'
          stroke='white'
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap='round'
        />
        <Path
          d='M10.3096 20.7857L8 19.5V16.9482'
          fill='url(#paint9_linear_152_2725)'
        />
        <Path
          d='M10.3096 20.7857L8 19.5V16.9482'
          stroke='white'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M8 19.4997L10.8958 17.8926L8 19.4997Z'
          fill='url(#paint10_linear_152_2725)'
        />
        <Path
          d='M8 19.4997L10.8958 17.8926'
          stroke='white'
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap='round'
        />
        <Path
          d='M22.377 9.2334L24.6865 10.4994V13.0512'
          fill='url(#paint11_linear_152_2725)'
        />
        <Path
          d='M22.377 9.2334L24.6865 10.4994V13.0512'
          stroke='white'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M24.6865 10.5L21.7625 12.1071L24.6865 10.5ZM16.3434 17.5714V15L18.7272 13.7143M16.3434 15L13.9595 13.7143L16.3434 15Z'
          fill='url(#paint12_linear_152_2725)'
        />
        <Path
          d='M24.6865 10.5L21.7625 12.1071M16.3434 17.5714V15M16.3434 15L18.7272 13.7143M16.3434 15L13.9595 13.7143'
          stroke='white'
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap='round'
        />
      </G>
      <Defs>
        <LinearGradient
          id='paint0_linear_152_2725'
          x1={33.9345}
          y1={-8.00266}
          x2={43.5689}
          y2={24.8615}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint1_linear_152_2725'
          x1={18.946}
          y1={5.65703}
          x2={19.0758}
          y2={7.17544}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint2_linear_152_2725'
          x1={17.3891}
          y1={5.14257}
          x2={19.3007}
          y2={7.01826}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint3_linear_152_2725'
          x1={18.946}
          y1={22.3709}
          x2={19.0758}
          y2={23.8893}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint4_linear_152_2725'
          x1={17.3891}
          y1={19.9287}
          x2={19.3007}
          y2={21.8044}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint5_linear_152_2725'
          x1={10.4156}
          y1={8.21499}
          x2={12.2829}
          y2={11.778}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint6_linear_152_2725'
          x1={11.0582}
          y1={10.0713}
          x2={11.3815}
          y2={11.9268}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint7_linear_152_2725'
          x1={24.7925}
          y1={15.9298}
          x2={26.6599}
          y2={19.4928}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint8_linear_152_2725'
          x1={24.8204}
          y1={17.4639}
          x2={25.1438}
          y2={19.3194}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint9_linear_152_2725'
          x1={10.4156}
          y1={15.9246}
          x2={12.298}
          y2={19.498}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint10_linear_152_2725'
          x1={11.0286}
          y1={17.4639}
          x2={11.355}
          y2={19.3183}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint11_linear_152_2725'
          x1={24.7925}
          y1={8.21499}
          x2={26.6599}
          y2={11.778}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
        <LinearGradient
          id='paint12_linear_152_2725'
          x1={25.1787}
          y1={8.61366}
          x2={26.8634}
          y2={16.6738}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} stopColor='#03B3FF' />
          <Stop offset={0.5025} stopColor='#8103FF' />
          <Stop offset={1} stopColor='#BD00FF' />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
