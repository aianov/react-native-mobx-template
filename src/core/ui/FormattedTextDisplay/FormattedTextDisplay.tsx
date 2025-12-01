import { changeRgbA } from '@lib/theme';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Clipboard,
	Linking,
	ScrollView,
	StyleProp,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle
} from 'react-native';

interface FormattedTextDisplayProps {
	value: string;
	style?: StyleProp<ViewStyle>;
	containerStyle?: StyleProp<ViewStyle>;
	scrollEnabled?: boolean;
	onLinkPress?: (url: string) => void;
	minHeight?: number;
	isRawHtml?: boolean;
}

export const FormattedTextDisplay: React.FC<FormattedTextDisplayProps> = observer(({
	value,
	style,
	containerStyle,
	scrollEnabled = true,
	onLinkPress,
	minHeight = 40,
	isRawHtml = false
}) => {
	const { currentTheme } = themeStore;

	const [isLoaded, setIsLoaded] = useState(false);
	const [formattedContent, setFormattedContent] = useState<any>(null);

	useEffect(() => {
		// Обработка контента при изменении value
		processContent(value, isRawHtml);
	}, [value, isRawHtml]);

	const isHtml = (text: string): boolean => {
		return /<\/?[a-z][\s\S]*>/i.test(text);
	};

	const processContent = (text: string, isRawHtml: boolean) => {
		setIsLoaded(false);

		// Если текст пустой, сразу завершаем
		if (!text) {
			setFormattedContent(null);
			setIsLoaded(true);
			return;
		}

		// Если текст уже HTML или указан флаг isRawHtml, используем его напрямую
		const shouldProcessAsHtml = isRawHtml || isHtml(text);

		if (shouldProcessAsHtml) {
			// Преобразуем HTML в простой текст с сохранением базового форматирования
			setFormattedContent(simplifyHtml(text));
		} else {
			setFormattedContent(convertMarkdownToNative(text));
		}

		setIsLoaded(true);
	};

	const extractColorFromStyle = (styleAttr: string): string | null => {
		const colorMatch = styleAttr.match(/color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
		if (colorMatch) {
			const r = parseInt(colorMatch[1]);
			const g = parseInt(colorMatch[2]);
			const b = parseInt(colorMatch[3]);
			return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		}
		return null;
	};

	const simplifyHtml = (html: string) => {
		// Для HTML с бэкенда, просто извлекаем текст и применяем форматирование
		const textContent = html.replace(/<[^>]*>/g, '').trim();

		// Если в исходном HTML был тег <b>, делаем текст жирным
		if (html.includes('<b>')) {
			return `__BOLD_START__${textContent}__BOLD_END__`;
		}

		return textContent;
	};

	const convertMarkdownToNative = (text: string) => {
		// Конвертация Markdown в нативные компоненты
		let processedText = text.replace(/\r\n|\r/g, "\n");

		// Обработка блоков кода
		processedText = processedText.replace(/```python\n([\s\S]*?)```/g, (_, code) => {
			return `__CODE_BLOCK_START__python__${code}__CODE_BLOCK_END__`;
		});

		// Обработка форматирования текста
		processedText = processedText
			// Цвет
			.replace(/:([A-Fa-f0-9]{6}):(.*?):/g, `__COLOR_START__$1__$2__COLOR_END__`)
			// Жирный текст
			.replace(/\*\*(.*?)\*\*/g, `__BOLD_START__$1__BOLD_END__`)
			// Курсив
			.replace(/\*(.*?)\*/g, `__ITALIC_START__$1__ITALIC_END__`)
			// Подчеркнутый
			.replace(/__(.*?)__/g, `__UNDERLINE_START__$1__UNDERLINE_END__`)
			// Ссылки
			.replace(/\[(.*?)\]\((.*?)\)/g, `__LINK_START__$2__$1__LINK_END__`);

		return processedText;
	};

	const renderFormattedText = () => {
		if (!formattedContent) return null;

		// Разбиваем контент на части для обработки специальных маркеров
		const parts = formattedContent.split(/(__(CODE_BLOCK|COLOR|BOLD|ITALIC|UNDERLINE|LINK)_START__.*?__(CODE_BLOCK|COLOR|BOLD|ITALIC|UNDERLINE|LINK)_END__)/g);

		return parts.map((part: string, index: number) => {
			// Обработка блоков кода
			if (part.startsWith('__CODE_BLOCK_START__')) {
				const match = part.match(/__CODE_BLOCK_START__([^_]*)__(.*)__CODE_BLOCK_END__/);
				if (match) {
					const [, language, code] = match;
					return renderCodeBlock(code, language, index);
				}
			}

			// Обработка цветного текста
			if (part.startsWith('__COLOR_START__')) {
				const match = part.match(/__COLOR_START__([^_]*)__(.*)__COLOR_END__/);
				if (match) {
					const [, color, text] = match;
					return (
						<Text key={index} style={{ color: color.startsWith('#') ? color : `#${color}` }}>
							{text}
						</Text>
					);
				}
			}

			if (part.startsWith('__BOLD_START__')) {
				const match = part.match(/__BOLD_START__(.*)__BOLD_END__/);
				if (match) {
					return (
						<Text
							key={index}
							style={{
								fontWeight: 'bold',
								color: currentTheme.text_100
							}}
						>
							{match[1]}
						</Text>
					);
				}
			}

			// Обработка курсива
			if (part.startsWith('__ITALIC_START__')) {
				const match = part.match(/__ITALIC_START__(.*)__ITALIC_END__/);
				if (match) {
					return (
						<Text key={index} style={{
							fontStyle: 'italic',
							color: themeStore.currentTheme.text_100 as string
						}}>
							{match[1]}
						</Text>
					);
				}
			}

			// Обработка подчеркнутого текста
			if (part.startsWith('__UNDERLINE_START__')) {
				const match = part.match(/__UNDERLINE_START__(.*)__UNDERLINE_END__/);
				if (match) {
					return (
						<Text key={index} style={{
							textDecorationLine: 'underline',
							color: themeStore.currentTheme.text_100
						}}>
							{match[1]}
						</Text>
					);
				}
			}

			// Обработка ссылок
			if (part.startsWith('__LINK_START__')) {
				const match = part.match(/__LINK_START__([^_]*)__(.*)__LINK_END__/);
				if (match) {
					const [, url, text] = match;
					return (
						<Text
							key={index}
							style={{
								color: themeStore.currentTheme.primary_100,
								textDecorationLine: 'underline'
							}}
							onPress={() => {
								if (onLinkPress) {
									onLinkPress(url);
								} else {
									Linking.openURL(url);
								}
							}}
						>
							{text}
						</Text>
					);
				}
			}

			// Обычный текст (если не пустой)
			if (part.trim()) {
				return (
					<Text key={index} style={{ color: themeStore.currentTheme.text_100 }}>
						{part}
					</Text>
				);
			}

			return null;
		}).filter(Boolean);
	};

	const renderCodeBlock = (code: string, language: string, key: number) => {
		const accentColor = themeStore.currentTheme.primary_100;
		const bgColor = changeRgbA(accentColor, "0.1");

		return (
			<View key={key} style={styles.codeContainer}>
				<View style={[styles.codeHeader, { backgroundColor: bgColor }]}>
					<Text style={[styles.languageLabel, { color: accentColor }]}>
						{language.charAt(0).toUpperCase() + language.slice(1)}
					</Text>
					<TouchableOpacity
						style={styles.copyButton}
						onPress={() => Clipboard.setString(code)}
					>
						<Text style={{ color: accentColor, fontSize: 12 }}>Копировать</Text>
					</TouchableOpacity>
				</View>
				<ScrollView horizontal style={{ backgroundColor: bgColor }}>
					<Text
						style={{
							fontFamily: 'monospace',
							fontSize: 10,
							color: themeStore.currentTheme.text_100,
							padding: 10,
							borderLeftWidth: 3,
							borderLeftColor: accentColor
						}}
					>
						{code}
					</Text>
				</ScrollView>
			</View>
		);
	};

	// Если текст пустой, показываем пустой контейнер
	if (!value) {
		return <View style={[styles.container, { minHeight }, containerStyle]} />;
	}

	const contentContainer = (
		<View style={[styles.contentContainer, { minHeight }]}>
			{!isLoaded ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator
						size="small"
						color={themeStore.currentTheme.primary_100}
					/>
					<Text style={{
						color: themeStore.currentTheme.secondary_100,
						marginTop: 8
					}}>
						Загрузка...
					</Text>
				</View>
			) : (
				renderFormattedText()
			)}
		</View>
	);

	return (
		<View style={[styles.container, { minHeight }, containerStyle]}>
			{scrollEnabled ? (
				<ScrollView
					style={[styles.scrollView, style]}
					showsVerticalScrollIndicator={true}
				>
					{contentContainer}
				</ScrollView>
			) : (
				contentContainer
			)}
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		overflow: 'hidden',
		backgroundColor: 'transparent',
	},
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		padding: 8,
	},
	loadingContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	codeContainer: {
		marginVertical: 10,
		borderRadius: 5,
		overflow: 'hidden',
	},
	codeHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	languageLabel: {
		fontSize: 10,
	},
	copyButton: {
		padding: 4,
		borderRadius: 4,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
	}
});