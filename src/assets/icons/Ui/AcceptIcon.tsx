import Svg, { Path } from 'react-native-svg'

export const AcceptIcon = ({ size = 19, color = '#3dc90e' }) => {
   return (
      <Svg width={size} height={size} viewBox="0 0 22 16" fill="none">
         <Path d="M7.69325 16L0 8.4158L1.92331 6.51975L7.69325 12.2079L20.0767 0L22 1.89605L7.69325 16Z" fill={color} />
      </Svg>
   )
}