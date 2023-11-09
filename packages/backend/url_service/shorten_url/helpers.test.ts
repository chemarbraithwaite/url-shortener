import axios from "axios";
import { isValidUrl } from "./helpers";

jest.mock("axios");

describe("Helpers", () => {
  it("Returns true if url is valid", () => {
    (axios.head as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
      })
    );
    const url = "https://www.google.com";
    expect(isValidUrl(url)).resolves.toBeTruthy();
  });

  it("Returns false if url is invalid", () => {
    (axios.head as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        status: 404,
      })
    );
    const url = "https://www.google.com/invalid";
    expect(isValidUrl(url)).resolves.toBeFalsy();
  });
});
