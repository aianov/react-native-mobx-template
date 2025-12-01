import { ErrorTextUi } from '@core/ui';
import { pxNative } from '@lib/theme';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import PhoneInput, { ICountry } from 'react-native-international-phone-number';
import { MainText } from '../MainText/MainText';

interface PhoneInputProps<T> {
	values?: T,
	errors?: T,
	name?: string,
	title?: string,
	placeholder?: string,
	paddingTop?: number,
	style?: StyleProp<ViewStyle>,
	setValue?: (name: string, phoneNumber: string) => void;
	setCallingCode?: (callingCode: string) => void;
}

export const PhoneInputUi = observer(<T,>({
	values = {} as T,
	errors = {} as T,
	name = "",
	style,
	title,
	paddingTop = 8,
	placeholder = "Phone number",
	setValue,
	setCallingCode
}: PhoneInputProps<T>) => {
	const { currentTheme } = themeStore;
	const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

	const handleSelectedCountry = (country: ICountry) => {
		if (!setCallingCode) return;
		setSelectedCountry(country);
		setCallingCode(country.callingCode);
	};

	const handleChangePhone = (phoneNumber: string) => {
		if (!setValue || !selectedCountry) return;
		setValue(name, phoneNumber);
	};

	const getPhoneInput = () => (
		<PhoneInput
			value={(values as any)[name] || ""}
			placeholder={placeholder}
			selectedCountry={selectedCountry}
			onChangePhoneNumber={handleChangePhone}
			onChangeSelectedCountry={handleSelectedCountry}
			cursorColor={currentTheme.primary_100}
			selectionColor={currentTheme.primary_100}
			phoneInputStyles={{
				container: {
					backgroundColor: currentTheme.bg_400,
					borderColor: currentTheme.input_border_300,
					height: pxNative(currentTheme.input_height_300),
					...(style as any)
				},
				input: {
					color: currentTheme.text_100
				},
				divider: {
					display: 'none'
				},
				flagContainer: {
					backgroundColor: currentTheme.bg_400,
					borderColor: currentTheme.input_border_300,
					paddingLeft: 10,
					paddingRight: 0,
					...(style as any)
				},
				caret: {
					display: 'none'
				},
				callingCode: {
					color: currentTheme.text_100
				}
			}}
		/>
	);

	if (!setValue) return getPhoneInput();

	return (
		<View style={{ paddingTop }}>
			{title && <MainText px={12} style={s.title}>{title}</MainText>}
			{getPhoneInput()}
			{(errors as any)[name + "Err"] && <ErrorTextUi px={11} style={s.error}>{(errors as any)[name + "Err"]}</ErrorTextUi>}
		</View>
	);
});

const s = StyleSheet.create({
	error: {
		position: 'absolute',
		bottom: -12.5
	},
	title: {
		marginLeft: 6,
		marginBottom: 3
	},
});