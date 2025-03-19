import {createTheme} from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#10B981",
      light: "#6EE7B7",
      dark: "#059669"
    }
  },

  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
        color: "primary"
      },
      styleOverrides: {
        root: {
          borderRadius: "6px",
          letterSpacing: "1px",
          textTransform: "none"
        },
        outlined: {
          borderColor: "#0F766E",
          color: "#0F766E",
          "&:hover": {
            backgroundColor: "#E0F2F1"
          }
        }
      }
    },

    // Apply Primary Color to Icons
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "#0F766E"
        }
      }
    }
  }
});
