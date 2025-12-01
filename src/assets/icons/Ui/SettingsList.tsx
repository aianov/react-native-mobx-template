import Svg, { Circle } from 'react-native-svg'
import { IconWithWidthAndHeight } from '@/shared/utils/globalTypes'

export const SettingsList = ({ width = 20, height = 5, color = 'white' }: IconWithWidthAndHeight) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox='0 0 25 5'
      fill='none'
    >
      <Circle cx={2.5} cy={2.5} r={2.5} fill={color} />
      <Circle cx={12.5} cy={2.5} r={2.5} fill={color} />
      <Circle cx={22.5} cy={2.5} r={2.5} fill={color} />
    </Svg>
  )
}
