import { MobxSaiWsInstance } from '@lib/mobx-toolbox/mobxSaiWs/types';
import { getMaxLengthColor } from '@lib/numbers';
import { deleteSpacesFromStartAndEnd } from '@lib/text';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { JSX } from 'react';
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputChangeEventData, TextInputProps, View } from 'react-native';
import { Box } from '../BoxUi/Box';
import { ErrorTextUi } from '../ErrorTextUi/ErrorTextUi';
import { LoaderUi } from '../LoaderUi/LoaderUi';
import { MainText } from '../MainText/MainText';

interface SimpleInputUiProps extends TextInputProps {
	name?: null | string;
	errors?: Record<string, string> | null;
	maxLength?: number;
	value?: string;
	values?: Record<string, any> | null;
	title?: string;
	groupContainer?: boolean;
	setValue?: (key: string, value: string) => void;
	useValue?: boolean;
	debug?: boolean;
	bgColor?: string;
	bRad?: number;
	rightJsx?: JSX.Element;
	loading?: MobxSaiWsInstance<any>;
	onChangeInput?: (text: string) => void;
	noSpaces?: boolean;
	noSpaceAtStart?: boolean;
	onlyLatinCharacters?: boolean;
}

export const SimpleInputUi = observer(({
	loading,
	name = null,
	errors = null,
	maxLength,
	value,
	values = null,
	title,
	setValue,
	onChangeInput,
	groupContainer = false,
	useValue = false,
	debug = false,
	bgColor,
	rightJsx,
	bRad = 10,
	noSpaces = false,
	noSpaceAtStart = false,
	onlyLatinCharacters = false,
	...props
}: SimpleInputUiProps) => {
	const { currentTheme } = themeStore;

	const onChangeHandler = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
		if (!setValue || !name || (values?.[name] == "undefined")) return;
		let newValue = e.nativeEvent.text;

		if (noSpaces) {
			newValue = deleteSpacesFromStartAndEnd(newValue);
		}

		if (noSpaceAtStart) {
			newValue = newValue.replace(/^\s+/, '');
		}

		if (onlyLatinCharacters) {
			newValue = newValue.replace(/[^a-zA-Z0-9]/g, '');
		}

		if (onChangeInput) {
			onChangeInput(newValue);
		}
		setValue(name, newValue);
	};

	const getInput = () => {
		if (useValue) {
			return (
				<TextInput
					placeholderTextColor={currentTheme.secondary_100}
					cursorColor={currentTheme.primary_100}
					selectionColor={currentTheme.primary_100}
					onChange={e => onChangeHandler(e)}
					maxLength={maxLength}
					value={value}
					{...props}
					style={{ color: currentTheme.text_100, ...(props.style as any) }}
				/>
			);
		}

		return (
			<TextInput
				placeholderTextColor={currentTheme.secondary_100}
				cursorColor={currentTheme.primary_100}
				selectionColor={currentTheme.primary_100}
				onChange={e => onChangeHandler(e)}
				maxLength={maxLength}
				value={values?.[name as string]}
				{...props}
				style={{ color: currentTheme.text_100, ...(props.style as any) }}
			/>
		);
	};

	if (!setValue && maxLength == 0) return getInput();

	return (
		<View style={[errors?.[name as string + 'Err'] ? s.errorStyles : {}, debug && { borderWidth: 0.2, borderColor: "red" }]}>
			{title && <MainText px={12} style={s.title}>{title}</MainText>}

			<Box
				style={[
					{
						backgroundColor: bgColor || currentTheme.bg_400,
						borderRadius: bRad,
					},
					groupContainer ? s.groupContainer : {}
				]}
			>
				<Box
					fD='row'
					justify='space-between'
					position='relative'
				>
					{getInput()}

					{loading?.status === "pending" && (
						<Box
							style={{
								position: 'absolute',
								right: 15,
							}}
							height={"100%"}
							justify='center'
						>
							<LoaderUi size={"small"} color={currentTheme.text_100} />
						</Box>
					)}

					{maxLength && value && (
						<Box
							style={{
								position: 'absolute',
								bottom: 0,
								right: -5,
							}}
						>
							<MainText color={getMaxLengthColor(value.length, maxLength)} px={11}>
								{maxLength - value.length}
							</MainText>
						</Box>
					)}
				</Box>

				{errors?.[name as string + 'Err'] && (
					<ErrorTextUi
						style={s.error}
						px={11}
					>
						{errors?.[name as string + 'Err']}
					</ErrorTextUi>
				)}
			</Box>
		</View>
	);
});

const s = StyleSheet.create({
	groupContainer: {
		position: 'relative',
		borderRadius: 10,
		flexDirection: 'column',
		gap: 15,
		paddingVertical: 8,
		paddingHorizontal: 12.5,
		width: '100%',
	},
	title: {
		marginLeft: 6,
		marginBottom: 3
	},
	error: {
		position: 'absolute',
		bottom: -14,
	},
	errorStyles: {
		marginBottom: 1
	},
});