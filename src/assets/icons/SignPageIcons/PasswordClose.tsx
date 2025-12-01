import Svg, { Path } from 'react-native-svg';
import { IconWithWidthAndHeight } from '../../../core/utils/globalTypes';

export const PasswordCloseIcon = ({ width = 22, height = 12, color = "white" }: IconWithWidthAndHeight) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox='0 0 22 12'
      fill='none'
    >
      <Path
        d='m8.954 9.037-.787 2.94-1.932-.517.787-2.94a11 11 0 0 1-3.237-1.871L1.632 8.802.218 7.388l2.153-2.154A10.96 10.96 0 0 1 0 .164L.9 0a16.92 16.92 0 0 0 9.924 3.195c3.704 0 7.132-1.184 9.924-3.195l.9.163a10.96 10.96 0 0 1-2.37 5.071l2.153 2.154-1.414 1.414-2.154-2.153a11 11 0 0 1-3.237 1.872l.788 2.939-1.932.517-.788-2.94a11.1 11.1 0 0 1-3.74 0'
        fill={color}
      />
    </Svg>
  );
};
