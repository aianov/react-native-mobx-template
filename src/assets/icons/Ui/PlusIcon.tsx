import Svg, { Path } from "react-native-svg"

export const PlusIcon = ({ size = 16, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox='0 0 10 10'
      fill='none'
    >
      <Path
        d='M5 0a.5.5 0 0 0-.5.5v4h-4a.5.5 0 1 0 0 1h4v4a.5.5 0 1 0 1 0v-4h4a.5.5 0 1 0 0-1h-4v-4A.5.5 0 0 0 5 0'
        fill={color}
      />
    </Svg>
  )
}
