import {ExploreOutlined} from "@mui/icons-material";
import {AppBar, Box, Toolbar, Typography, useMediaQuery, useTheme} from "@mui/material";
import React from "react";

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar position="static">
      <Toolbar>
        <Box className="flex items-center">
          <ExploreOutlined sx={{color: "#030303"}} fontSize={isMobile ? "medium" : "large"} />
          <Typography variant={isMobile ? "h6" : "h5"} component="h1" className="font-bold px-2">
            TravelGenie.AI
          </Typography>
        </Box>
        {!isMobile && (
          <Typography variant="subtitle1" component="div" className="ml-4 opacity-90">
            Your AI Travel Planning Assistant
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
