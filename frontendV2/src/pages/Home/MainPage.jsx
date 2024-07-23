import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AppBar from "./components/AppBar";
import Hero from "./components/Hero";
import LogoCollection from "./components/LogoCollection";
import Highlights from "./components/Highlights";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import getLPTheme from "./getLPTheme";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useThemeProvider } from "../../utils/ThemeContext";

export default function MainPage() {
  const { currentTheme: mode, changeCurrentTheme } = useThemeProvider();
  const location = useLocation();
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  // ! changed the mode state variable since we have an currentTheme from ThemeContextProvider
  const toggleColorMode = () => {
    changeCurrentTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <CssBaseline />
      <AppBar />
      <Box sx={{ bgcolor: "background.default" }}>
        <Hero />
        <LogoCollection />
        <Features />
        <Divider />
        <Highlights mode={mode} />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
