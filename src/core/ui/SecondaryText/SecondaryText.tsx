import { themeStore } from '@theme/stores';
import { TextAlignT } from '@ui/types';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface SecondaryTextProps extends TextProps {
	px?: number;
	tac?: TextAlignT;
	ml?: number;
	mt?: number;
	mb?: number;
	debug?: boolean;
	strikethrough?: boolean;
}

export const SecondaryText = observer(({
	style,
	px = 16,
	tac = "auto",
	ml = 0,
	mt = 0,
	mb = 0,
	debug = false,
	strikethrough = false,
	...props
}: SecondaryTextProps) => {
	const { currentTheme } = themeStore;

	return (
		<Text
			style={[
				{
					fontSize: px,
					color: currentTheme.secondary_100,
					textAlign: tac,
					marginLeft: ml,
					marginTop: mt,
					marginBottom: mb,
					textDecorationLine: strikethrough ? 'line-through' : 'none',
				},
				debug && {
					borderWidth: 0.5,
					borderColor: "red",
				},
				style
			]}
			{...props}
		/>
	);
});