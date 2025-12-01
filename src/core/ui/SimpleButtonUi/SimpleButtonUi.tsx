import { observer } from 'mobx-react-lite';
import React, { forwardRef } from 'react';
import { DimensionValue, FlexAlignType, GestureResponderEvent, StyleProp, TouchableOpacity, TouchableOpacityProps, View, ViewStyle } from 'react-native';

export const SimpleButtonUi = observer(forwardRef<View, SimpleButtonUiProps & TouchableOpacityProps>(({
	onPress,
	children,
	centered,
	align = "flex-start",
	justify = "flex-start",
	bgColor,
	height = "auto",
	width = "auto",
	bRad = 0,
	disabled = false,
	debug = false,
	style = {},
	...props
}, ref) => {
	return (
		<TouchableOpacity
			ref={ref}
			onPress={(event: GestureResponderEvent) => onPress && onPress(event)}
			style={[
				{
					alignItems: centered ? "center" : align,
					justifyContent: centered ? "center" : justify,
					height: height,
					opacity: disabled ? 0.5 : 1,
					backgroundColor: bgColor ? bgColor + "" : undefined,
					borderRadius: bRad
				},
				style,
				debug && { borderWidth: 0.3, borderColor: "red" }
			]}
			disabled={disabled}
			{...props}
		>
			{children || <></>}
		</TouchableOpacity>
	);
}));

interface SimpleButtonUiProps {
	bgColor?: string | number | undefined;
	centered?: boolean;
	debug?: boolean;
	onPress?: (event: GestureResponderEvent) => void;
	children?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	align?: FlexAlignType | undefined;
	justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | undefined;
	height?: DimensionValue | undefined;
	width?: DimensionValue | undefined;
	disabled?: boolean;
	bRad?: number;
}
