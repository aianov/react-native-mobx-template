import Svg, { Circle, Defs, G } from 'react-native-svg';
import { IconOnlyWithWidthAndHeightAndStyle } from '../../../core/utils/globalTypes';

export const Light = ({ width = 1100, height = 620, style = {} }: IconOnlyWithWidthAndHeightAndStyle) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox='0 0 1100 620'
      fill='none'
      style={style}
    >
      <G filter='url(#a)'>
        <Circle cx={666} cy={666} r={366} fill='#fff' />
      </G>
      <Defs></Defs>
    </Svg>
  );
};
