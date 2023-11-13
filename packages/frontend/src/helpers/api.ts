import axios from "axios";
const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";

export const shortenUrl = async (url: string) => {
  try {
    const response = await axios.post(`${baseUrl}/url`, { url });

    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error((error as any)?.response?.data ?? "Failed to shorten URL");
  }
};
