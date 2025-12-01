import Svg, { Path } from "react-native-svg"

export const RejectIcon = ({ size = 19, color = 'red' }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox='0 0 19 19'
      fill='none'
    >
      <Path
        d='M1.9 19 0 17.1l7.6-7.6L0 1.9 1.9 0l7.6 7.6L17.1 0 19 1.9l-7.6 7.6 7.6 7.6-1.9 1.9-7.6-7.6z'
        fill={color}
      />
    </Svg>
  )
}
