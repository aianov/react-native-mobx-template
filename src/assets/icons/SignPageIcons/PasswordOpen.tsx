import Svg, { Path } from 'react-native-svg';
import { IconWithWidthAndHeight } from '../../../core/utils/globalTypes';

export const PasswordOpenIcon = ({ width = 22, height = 15, color = 'white' }: IconWithWidthAndHeight) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox='0 0 22 15'
      fill='none'
    >
      <Path
        d='M11 4.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6m0 8a5 5 0 1 1 0-10 5 5 0 0 1 0 10M11 0C6 0 1.73 3.11 0 7.5 1.73 11.89 6 15 11 15s9.27-3.11 11-7.5C20.27 3.11 16 0 11 0'
        fill={color}
      />
    </Svg>
  );
};
