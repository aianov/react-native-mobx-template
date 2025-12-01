import Svg, { Path } from 'react-native-svg';
import { IconWithWidthAndHeight } from '../../../core/utils/globalTypes';

export const EmailIcon = ({ width = 20, height = 16, color = 'white' }: IconWithWidthAndHeight) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox='0 0 20 16'
      fill='none'
    >
      <Path
        d='M18 0H2C.9 0 .01.9.01 2L0 14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2m0 4-8 5-8-5V2l8 5 8-5z'
        fill={color}
      />
    </Svg>
  );
};
