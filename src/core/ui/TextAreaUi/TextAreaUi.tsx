import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CreateStylesParams {
	btnBg300: string;
	textColor: string;
	paddingBottom: number;
	containerStyle?: ViewStyle;
	inputStyle?: ViewStyle;
}

interface TextAreaUiProps extends Omit<TextInputProps, 'style'> {
	containerStyle?: ViewStyle;
	inputStyle?: ViewStyle;
	considerKeyboard?: boolean;
}

export const TextAreaUi = observer(({
	containerStyle,
	inputStyle,
	considerKeyboard = true,
	placeholder = 'Введите текст...',
	placeholderTextColor,
	value,
	onChangeText,
	maxLength = 5000,
	...props
}: TextAreaUiProps) => {
	const { currentTheme } = themeStore;
	const insets = useSafeAreaInsets();
	const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
	const [text, setText] = useState(value || '');
	const inputRef = useRef<TextInput>(null);

	useEffect(() => {
		if (value !== undefined && value !== text) {
			setText(value);
		}
	}, [value]);

	const handleKeyboardShow = useCallback(() => {
		setIsKeyboardVisible(true);
	}, []);

	const handleKeyboardHide = useCallback(() => {
		setIsKeyboardVisible(false);
	}, []);

	useEffect(() => {
		if (!considerKeyboard) return;

		const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		const keyboardShowListener = Keyboard.addListener(showEvent, handleKeyboardShow);
		const keyboardHideListener = Keyboard.addListener(hideEvent, handleKeyboardHide);

		return () => {
			keyboardShowListener.remove();
			keyboardHideListener.remove();
		};
	}, [handleKeyboardShow, handleKeyboardHide, considerKeyboard]);

	const paddingBottom = considerKeyboard && isKeyboardVisible ? 0 : insets.bottom > 0 ? insets.bottom - 5 : 0;

	const styles = useMemo(() => createStyles({
		btnBg300: currentTheme.btn_bg_300,
		textColor: currentTheme.text_100,
		paddingBottom,
		containerStyle,
		inputStyle,
	}), [currentTheme.btn_bg_300, currentTheme.text_100, paddingBottom, containerStyle, inputStyle]);

	const handleChangeText = useCallback((newText: string) => {
		setText(newText);
		if (onChangeText) {
			onChangeText(newText);
		}
	}, [onChangeText]);

	return (
		<View style={styles.container}>
			<View style={styles.inputContainer}>
				<TextInput
					ref={inputRef}
					style={styles.input}
					autoCapitalize='none'
					keyboardType='default'
					placeholder={placeholder}
					placeholderTextColor={placeholderTextColor || currentTheme.secondary_100}
					multiline={true}
					scrollEnabled={true}
					maxLength={maxLength}
					onChangeText={handleChangeText}
					value={text}
					{...props}
				/>
			</View>
		</View>
	);
});

const createStyles = ({ btnBg300, textColor, paddingBottom, containerStyle, inputStyle }: CreateStylesParams) => StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom,
		...containerStyle,
	},
	inputContainer: {
		flex: 1,
		backgroundColor: btnBg300,
		borderRadius: 15,
	},
	input: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		color: textColor,
		minHeight: 40,
		maxHeight: 80,
		...inputStyle,
	}
});