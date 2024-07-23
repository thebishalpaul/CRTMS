import { createContext, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("info");

  const showToast = (message, severity = "info") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToastOpen(false);
  };

  const toast = {
    error: (message) => showToast(message, "error"),
    success: (message) => showToast(message, "success"),
    warning: (message) => showToast(message, "warning"),
    info: (message) => showToast(message, "info"),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={toastOpen}
        autoHideDuration={2000}
        onClose={handleCloseToast}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{ width: "500px" }} // Adjusted width based on screen size
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
