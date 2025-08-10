import { ImageSourcePropType } from "react-native";

// Default image path
// TODO: Replace defaultImage with generic image (default-image.jpg)
// TODO: Add default-image.jpg and replace to @/assets/images/default-image.jpg
const defaultImage = require("@/assets/images/icon.png");

// Returns an image from a given URL, or a default image if the URL is missing or invalid.
export const getLandmarkImageOrDefault = (imageUrl?: string): ImageSourcePropType => {
    return imageUrl
        ? { uri: imageUrl }
        : defaultImage;
};


// Returns an image based on the landmark title, or a default image if none is found.
// NOTE: "fetchImageByLandmarkTitle" will later include an API call to fetch image by title
export const getAlternativeImageSource = (title?: string): ImageSourcePropType => {
    const alternativeImageUrl = fetchImageByLandmarkTitle(title);
    return alternativeImageUrl
        ? { uri: alternativeImageUrl }
        : defaultImage;
};

// Returns an image URL from an external API by title
// TODO: fetch image from API 
const fetchImageByLandmarkTitle = (title?: string): string => {
    // TODO: Implement image fetching logic from an external API using the title
    return "";
};
