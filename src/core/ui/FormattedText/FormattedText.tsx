import { themeStore } from '@theme/stores';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FormattedTextProps {
	text: string;
	style?: any;
}

export const FormattedText = ({ text, style }: FormattedTextProps) => {
	const { currentTheme } = themeStore;

	// Разбиваем текст на сегменты с форматированием
	const segments = parseFormattedText(text);

	return (
		<View style={[styles.container, style]}>
			<Text style={{ color: currentTheme.text_100 }}>
				{segments.map((segment, index) => renderSegment(segment, index))}
			</Text>
		</View>
	);
};

// Функция для разбора форматированного текста
const parseFormattedText = (text: string) => {
	const segments = [];
	let currentIndex = 0;

	// Ищем цветовое форматирование
	const colorRegex = /:([A-Fa-f0-9]{6}):(.*?):/g;
	let match;

	while ((match = colorRegex.exec(text)) !== null) {
		// Добавляем текст до форматирования
		if (match.index > currentIndex) {
			segments.push({
				type: 'plain',
				text: text.substring(currentIndex, match.index)
			});
		}

		// Добавляем форматированный текст
		segments.push({
			type: 'color',
			color: `#${match[1]}`,
			text: match[2]
		});

		currentIndex = match.index + match[0].length;
	}

	// Добавляем оставшийся текст
	if (currentIndex < text.length) {
		segments.push({
			type: 'plain',
			text: text.substring(currentIndex)
		});
	}

	return segments;
};

// Функция для рендеринга сегмента
const renderSegment = (segment: any, index: number) => {
	switch (segment.type) {
		case 'color':
			return (
				<Text key={index} style={{ color: segment.color }}>
					{segment.text}
				</Text>
			);
		default:
			return <Text key={index}>{segment.text}</Text>;
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	}
}); 