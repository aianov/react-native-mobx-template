import Svg, { Path } from 'react-native-svg';
import { IconWithWidthAndHeight } from '../../../core/utils/globalTypes';

export const UserIcon = ({ width = 18, height = 22, color = 'white' }: IconWithWidthAndHeight) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox='0 0 17 22'
      fill='none'
    >
      <Path
        d='M8.5 8.6c2.347 0 4.25-1.925 4.25-4.3S10.847 0 8.5 0 4.25 1.925 4.25 4.3 6.153 8.6 8.5 8.6m8.5 8.063c0 2.67 0 4.837-8.5 4.837S0 19.334 0 16.663c0-2.672 3.806-4.838 8.5-4.838s8.5 2.166 8.5 4.838'
        fill={color}
      />
    </Svg>
  );
};
