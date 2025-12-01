import { Box, CleverImage } from '@core/ui';

export const ChatFavouritesLogoIcon = ({
	size = 50,
	iconSize = 30
}) => {
	return (
		<Box
			centered
			style={{
				width: size,
				height: size,
				borderRadius: 1000,
				overflow: "hidden",
				backgroundColor: "rgba(135, 213, 255, 1)",
			}}
		>
			<CleverImage
				source={require("@images/ChatFavourites.png")}
				imageStyles={{
					width: size,
					height: size,
					objectFit: "cover",
				}}
			/>
		</Box>
	);
};