import axios from "axios";
import * as urlApi from "./api";

jest.mock("axios");

describe("API Helper", () => {
  const OLD_ENV = process.env;
  const baseUrl = "baseURL";

  beforeAll(() => {
    process.env = {
      ...OLD_ENV,
      VITE_API_BASE_URL: baseUrl,
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe("shortenUrl", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("Handles request failed", async () => {
      const errorMessage = "error message";
      (axios.post as jest.Mock).mockRejectedValue({
        response: {
          data: errorMessage,
        },
      });

      await expect(urlApi.shortenUrl("")).rejects.toThrow(errorMessage);
    });

    it("Handled request succeeded", async () => {
      const data = "data";
      (axios.post as jest.Mock).mockReturnValueOnce({
        status: 200,
        data: data,
      });

      await expect(urlApi.shortenUrl("Any valid url")).resolves.toEqual(data);
    });
  });
});
