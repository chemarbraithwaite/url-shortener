import { createTheme } from "@mui/material/styles";
import { PRIMARY_COLOR, FONT_FAMILY } from ".";

export const lightTheme = createTheme({
  typography: {
    fontFamily: FONT_FAMILY,
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              border: `1px solid ${PRIMARY_COLOR}`,
            },
          },
          "&.MuiOutlinedInput-root": {
            borderRadius: "0px",
          },
        },
      },
    },
  },
});
