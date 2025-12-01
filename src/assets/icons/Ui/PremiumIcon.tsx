import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { IconOnlyWithSize } from '@/shared/utils/globalTypes'

export const PremiumIcon = ({ size = 28 }: IconOnlyWithSize) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox='0 0 19 18'
      fill='none'
    >
      <Rect x={1} y={1} width={17} height={16.105} rx={4} fill='url(#a)' />
      <Rect x={1} y={1} width={17} height={16.105} rx={4} fill='#000' />
      <G filter='url(#b)'>
        <Path
          d='M5.673 11.289 4.579 5.137l3.007 2.796L9.5 4.578l1.914 3.355 3.007-2.796-1.093 6.152zm7.655 1.677c0 .336-.22.56-.547.56H6.219c-.328 0-.546-.224-.546-.56v-.559h7.655z'
          fill='url(#c)'
        />
      </G>
      <Defs>
        <LinearGradient
          id='a'
          x1={1.5}
          y1={8}
          x2={13.214}
          y2={3.581}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} />
          <Stop offset={0.005} />
          <Stop offset={0.548} />
          <Stop offset={1} />
        </LinearGradient>
        <LinearGradient
          id='c'
          x1={19}
          y1={3}
          x2={17.492}
          y2={15.666}
          gradientUnits='userSpaceOnUse'
        >
          <Stop offset={0.005} />
          <Stop offset={0.502} />
          <Stop offset={1} />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}
