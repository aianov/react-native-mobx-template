import Svg, { Path } from 'react-native-svg'
import { IconWithSize } from '@/shared/utils/globalTypes'

export const PaintIcon = ({ size = 22, color = "white" }: IconWithSize) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox='0 0 22 21'
      fill='none'
    >
      <Path
        d='M5.789 12.834c-1.922 0-3.474 1.564-3.474 3.5 0 1.528-1.342 2.333-2.315 2.333C1.065 20.09 2.883 21 4.631 21c2.559 0 4.631-2.088 4.631-4.666 0-1.936-1.551-3.5-3.473-3.5M21.66 1.904 20.11.341A1.15 1.15 0 0 0 18.852.09q-.212.089-.374.252L8.104 10.793l3.184 3.208L21.661 3.549A1.16 1.16 0 0 0 22 2.727a1.17 1.17 0 0 0-.339-.823'
        fill={color}
      />
    </Svg>
  )
}
