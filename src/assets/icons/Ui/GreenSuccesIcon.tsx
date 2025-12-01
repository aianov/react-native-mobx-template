import Svg, { Circle, Path } from "react-native-svg"

export const GreenSuccessIcon = ({ size = 25 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox='0 0 26 26'
      fill='none'
    >
      <Circle cx={13} cy={13} r={13} fill='#00960F' />
      <Path
        d='M10.954 18.901 6 13.734l1.239-1.292 3.715 3.876L18.93 8l1.238 1.292z'
        fill='#fff'
      />
    </Svg>
  )
}
