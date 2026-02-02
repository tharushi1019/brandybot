import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { LogoProvider } from "./context/LogoContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <LogoProvider>
        <App />
      </LogoProvider>
    </AuthProvider>
  </StrictMode>
);
