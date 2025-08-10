import * as Location from "expo-location";

export const getReadableLocation = async (lat: number, lon: number): Promise<string> => {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const place = places[0];
    if (place?.city) return `${place.city}, ${place.country}`;
    if (place?.district) return `${place.district}, ${place.country}`;
    return place?.country || "Unknown location";
  } catch {
    return "Unknown location";
  }
};