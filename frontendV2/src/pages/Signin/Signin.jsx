import PropTypes from "prop-types";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { setToken, setUser } from "../../slices/userSlice";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AppAppBar from "../Home/components/AppBar";

import getLPTheme from "../Home/getLPTheme";
import { useEffect } from "react";
import { useThemeProvider } from "../../utils/ThemeContext";

export default function Signin() {
  const location = useLocation();
  const { currentTheme: mode, changeCurrentTheme: setMode } =
    useThemeProvider();
  const [showCustomTheme, setShowCustomTheme] = useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const user = {
      email,
      password,
    };

    try {
      const response = await axios.post(`/api/v1/auth/signin`, user);
      if (response.status === 200) {
        // console.log(response.data);
        const { user: newUser, token } = response.data;
        // Dispatch actions to update Redux store
        // console.log(newUser);
        dispatch(setUser(newUser));
        dispatch(setToken(token));

        let fetchedRole = response?.data?.user?.role;
        navigate(`/${fetchedRole}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Login Unsuccessful");
    }
    setLoading(false);
  };

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "400px",
            width: "100%",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor: (theme) => theme.palette.background.paper,
            "& .MuiFormControl-root": {
              width: "100%",
            },
            "& .MuiButton-root": {
              width: "100%",
            },
          }}
        >
          <TextField
            id="email"
            name="email"
            label="Email"
            type="email"
            variant="standard"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            id="password"
            name="password"
            label="Password"
            type="password"
            variant="standard"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={24} color="secondary" /> : null
            }
          >
            {loading ? "Signing in...." : "Signin"}
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
