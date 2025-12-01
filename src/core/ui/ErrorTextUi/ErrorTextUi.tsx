import { observer } from 'mobx-react-lite'
import { Text, TextProps } from 'react-native'

interface ErrorTextProps extends TextProps {
	px?: number
}

export const ErrorTextUi = observer(({
	px = 14,
	style,
	...props
}: ErrorTextProps) => {
	return (
		<Text
			style={[
				{ fontSize: px, color: 'red', paddingLeft: 7, paddingTop: 2 },
				style
			]}
			{...props}
		/>
	)
})