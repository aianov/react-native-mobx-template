import { CameraIcon } from '@icons/Ui/CameraIcon';
import { changeRgbA } from '@lib/theme';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Box } from '../BoxUi/Box';
import { MediaItem, MediaPickerRef, MediaPickerUi } from '../MediaPickerUi/MediaPickerUi';
import { SimpleButtonUi } from '../SimpleButtonUi/SimpleButtonUi';

interface SelectImageUiProps {
	/** Size of the button (default: 50) */
	size?: number;
	/** Callback when image(s) are selected */
	onSelectImage?: (media: MediaItem[]) => void;
	/** Allow multiple image selection (default: false) */
	multiple?: boolean;
	/** Maximum number of images to select (default: 10) */
	maxSelections?: number;
	/** Include image editing features (default: true) */
	includeEditing?: boolean;
	/** Show action buttons in picker (default: true) */
	showsButtons?: boolean;
	/** Auto reset picker states on close (default: true) */
	needAutoReset?: boolean;
	/** Pre-selected media items */
	selectedMedias?: MediaItem[];
	/** URI of already selected image to show as preview (controlled mode) */
	selectedImageUri?: string;
	/** Disable the button */
	disabled?: boolean;
	/** Custom placeholder component instead of camera icon */
	placeholder?: React.ReactNode;
	/** Border radius override (defaults to size for circular) */
	borderRadius?: number;
}

export const SelectImageUi = observer(({
	size = 50,
	onSelectImage,
	multiple = false,
	maxSelections = 10,
	includeEditing = true,
	showsButtons = true,
	needAutoReset = true,
	selectedMedias = [],
	selectedImageUri: externalSelectedImageUri,
	disabled = false,
	placeholder,
	borderRadius,
}: SelectImageUiProps) => {
	const { currentTheme } = themeStore;
	const [isPickerVisible, setIsPickerVisible] = useState(false);
	const [internalSelectedUri, setInternalSelectedUri] = useState<string | undefined>(undefined);
	const mediaPickerRef = useRef<MediaPickerRef>(null);

	useEffect(() => {
		if (externalSelectedImageUri !== undefined) {
			setInternalSelectedUri(externalSelectedImageUri);
		}
	}, [externalSelectedImageUri]);

	const handleOpenPicker = useCallback(() => {
		if (disabled) return;
		setIsPickerVisible(true);
	}, [disabled]);

	const handleClosePicker = useCallback(() => {
		setIsPickerVisible(false);
	}, []);

	const handleFinish = useCallback((selectedMedia: MediaItem[]) => {
		console.log('[SelectImageUi] handleFinish received:', selectedMedia);
		if (selectedMedia.length > 0) {
			const firstMedia = selectedMedia[0];
			const imageUri = firstMedia.file?.uri || firstMedia.uri;
			console.log('[SelectImageUi] Setting image URI:', imageUri);
			setInternalSelectedUri(imageUri);
		}

		onSelectImage?.(selectedMedia);
		setIsPickerVisible(false);
	}, [onSelectImage]);

	const selectedImageUri = externalSelectedImageUri ?? internalSelectedUri;
	const hasSelectedImage = !!selectedImageUri;
	const finalBorderRadius = borderRadius ?? size;

	return (
		<>
			<SimpleButtonUi
				onPress={handleOpenPicker}
				disabled={disabled}
				style={[
					styles.button,
					{
						width: size,
						height: size,
						borderRadius: finalBorderRadius,
						backgroundColor: hasSelectedImage
							? 'transparent'
							: changeRgbA(currentTheme.primary_100, "0.25"),
						opacity: disabled ? 0.5 : 1,
					}
				]}
			>
				{hasSelectedImage ? (
					<View style={[styles.imageWrapper, { borderRadius: finalBorderRadius }]}>
						<Image
							source={{ uri: selectedImageUri }}
							style={[
								styles.previewImage,
								{ borderRadius: finalBorderRadius }
							]}
						/>
						<View style={[
							styles.imageOverlay,
							{
								backgroundColor: changeRgbA(currentTheme.bg_100, "0.4"),
								borderRadius: finalBorderRadius
							}
						]}>
							<CameraIcon
								size={size * 0.35}
								color={currentTheme.text_100}
							/>
						</View>
					</View>
				) : placeholder ? (
					placeholder
				) : (
					<Box
						centered
						height={"100%"}
						width={"100%"}
					>
						<CameraIcon
							size={size * 0.45}
							color={currentTheme.primary_100}
						/>
					</Box>
				)}
			</SimpleButtonUi>

			<MediaPickerUi
				ref={mediaPickerRef}
				isVisible={isPickerVisible}
				onClose={handleClosePicker}
				onFinish={handleFinish}
				multiple={multiple}
				maxSelections={maxSelections}
				includeEditing={includeEditing}
				showsButtons={showsButtons}
				needAutoReset={needAutoReset}
				selectedMedias={selectedMedias}
			/>
		</>
	);
});

const styles = StyleSheet.create({
	button: {
		overflow: 'hidden',
		alignContent: "center",
		justifyContent: "center",
	},
	imageWrapper: {
		width: '100%',
		height: '100%',
		position: 'relative',
		overflow: 'hidden',
	},
	previewImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	imageOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		opacity: 0,
	},
});

export type { MediaItem } from '../MediaPickerUi/MediaPickerUi';
