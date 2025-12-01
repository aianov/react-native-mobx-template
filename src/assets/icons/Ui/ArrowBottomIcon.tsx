import Svg, { Path } from 'react-native-svg';
import { IconWithWidthAndHeight } from '../../../core/utils/globalTypes';

export const ArrowBottomIcon = ({ width = 12, height = 7, color = '#BABABA' }: IconWithWidthAndHeight) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox='0 0 12 7'
    >
      <Path d='M11 1 6 6 1 1' stroke={color} />
    </Svg>
  );
};
