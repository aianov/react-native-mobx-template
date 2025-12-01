import { ErrorTextUi, SimpleInputUi } from '@core/ui';
import { pxNative } from '@lib/theme';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { NativeSyntheticEvent, StyleProp, TextInputChangeEventData, TextInputProps, View, ViewStyle } from 'react-native';
import { InputUiValues } from '../types';

interface InputUiProps<T> extends Omit<TextInputProps, 'error'>, InputUiValues {
	values?: T,
	errors?: T,
	mode?: 'flat' | 'outlined',
	placeholder?: string;
	name?: string;
	errorTextPost?: "absolute" | "static";
	containerStyle?: StyleProp<ViewStyle>;
}

export const InputUi = observer(<T,>({
	style,
	mode = 'outlined',
	values = {} as T,
	errors = {} as T,
	placeholder = '',
	name = "",
	errorTextPost = "absolute",
	containerStyle = {},
	setValue,
	...props
}: InputUiProps<T>) => {
	const { currentTheme } = themeStore;

	const onChangeHandler = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
		if (!setValue) return;
		setValue(name, e.nativeEvent.text);
	};

	const getInput = () => (
		<SimpleInputUi
			value={(values as any)[name] || ""}
			onChange={onChangeHandler}
			placeholder={placeholder}
			placeholderTextColor={currentTheme.secondary_100}
			cursorColor={currentTheme.primary_100}
			selectionColor={currentTheme.primary_100}
			style={{
				color: currentTheme.text_100,
				height: pxNative(currentTheme.input_height_300),
				flex: 1,
				paddingHorizontal: 12.5,
				fontSize: 16,
				borderWidth: 0.5,
				borderColor: currentTheme.input_border_300,
				borderRadius: pxNative(currentTheme.input_radius_300),
				...style
			}}
			{...props}
		/>
	);

	if (!setValue) return getInput();

	return (
		<View
			style={[{ position: 'relative', width: "100%" }, containerStyle]}
		>
			{getInput()}
			{(errors as any)[name + 'Err'] && (
				<ErrorTextUi
					style={{
						position: errorTextPost,
						bottom: -15
					}}
					px={12}
				>
					{(errors as any)[name + 'Err']}
				</ErrorTextUi>
			)}
		</View>
	);
});