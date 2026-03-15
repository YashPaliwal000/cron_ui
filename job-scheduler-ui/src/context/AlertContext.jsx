import { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info"); // 'success' | 'error' | 'warning' | 'info'

  const showAlert = (newMessage, newSeverity = "info") => {
    setMessage(newMessage);
    setSeverity(newSeverity);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
