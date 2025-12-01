import Svg, { Circle, Path } from "react-native-svg"

export const RedCloseIcon = ({ size = 25 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox='0 0 26 26'
      fill='none'
    >
      <Circle cx={13} cy={13} r={13} fill='#B00000' />
      <Path
        d='m7.497 19.177.176.177.177-.177 5.15-5.15 5.15 5.15.177.177.176-.177.674-.674.177-.176-.177-.177-5.15-5.15 5.15-5.15.177-.177-.177-.176-.674-.674-.176-.177-.177.177-5.15 5.15-5.15-5.15-.177-.177-.176.177-.674.674-.177.176.177.177 5.15 5.15-5.15 5.15-.177.177.177.176z'
        fill='#fff'
        stroke='#fff'
      />
    </Svg>
  )
}
