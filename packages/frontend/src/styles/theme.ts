import { createTheme } from "@mui/material/styles";
import { PRIMARY_COLOR } from ".";

export const lightTheme = createTheme({
  typography: {
    fontFamily: "Montserrat, sans-serif",
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
        },
      },
    },
  },
});
