import generator from "generate-password-ts";
import axios from "axios";

/**
 * Returns the shortened url for the provided string
 */
export const getShortUrl = () => {
  const shortUrl = generator.generate({
    length: 8,
    numbers: true,
  });

  return shortUrl;
};

/**
 * Validates the provided url
 */
export const isValidUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    console.log(error);
    return false;
  }
};
