import { CheckedIcon } from '@icons/Ui/CheckedIcon';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Box } from '../BoxUi/Box';
import { SimpleButtonUi } from '../SimpleButtonUi/SimpleButtonUi';

export const CheckboxUi = observer(({
	isChecked = false,
	setIsChecked = null,
	onPress = () => { },
	size = 25,
	checkedSize = 16,
	style = {},
	nonInteractive = false,
}: CheckboxUiProps) => {
	const { currentTheme } = themeStore;

	if (nonInteractive) {
		const radius = size / 2;
		const strokeWidth = 1;

		return (
			<Box
				style={[
					{
						width: size,
						height: size,
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative',
					},
					style,
				]}
			>
				<Svg width={size} height={size} style={{ position: 'absolute' }}>
					<Circle
						cx={radius}
						cy={radius}
						r={radius - strokeWidth / 2}
						fill={isChecked ? currentTheme.primary_100 : "transparent"}
						stroke={currentTheme.border_600}
						strokeWidth={strokeWidth}
					/>
				</Svg>
				{isChecked && (
					<CheckedIcon size={checkedSize} />
				)}
			</Box>
		);
	}

	return (
		<SimpleButtonUi
			bRad={1000}
			style={[
				{
					borderWidth: 1.25,
					borderColor: currentTheme.border_600,
					width: size,
					height: size,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: isChecked ? currentTheme.primary_100 : "transparent",
				},
				style,
			]}
			onPress={() => {
				onPress?.();
				setIsChecked?.(!isChecked);
			}}
		>
			{isChecked && (
				<CheckedIcon
					size={checkedSize}
				/>
			)}
		</SimpleButtonUi>
	);
});

interface CheckboxUiProps {
	isChecked?: boolean;
	setIsChecked?: ((isChecked: boolean) => void) | null;
	onPress?: () => void;
	size?: number;
	style?: StyleProp<ViewStyle>;
	checkedSize?: number;
	nonInteractive?: boolean;
}