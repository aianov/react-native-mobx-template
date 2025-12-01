import Svg, { Path } from 'react-native-svg'
import { IconWithWidthAndHeight } from '@/shared/utils/globalTypes'

export const ArrowBottomIcon2 = ({ width = 10, height = 6, color = "white" }: IconWithWidthAndHeight) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox='0 0 10 6'
      fill='none'
    >
      <Path d='M9 1 5 5 1 1' stroke={color} />
    </Svg>
  )
}
