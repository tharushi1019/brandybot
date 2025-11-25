import { createContext, useContext, useState } from "react";

const LogoContext = createContext();

export const LogoProvider = ({ children }) => {
  const [logoData, setLogoData] = useState({
    logoUrl: "",          // URL of generated logo
    primaryColors: [],    // array of colors extracted from logo
    font: "",             // font selected/generated
    mockups: [],          // array of mockup objects { type, imageUrl }
  });

  return (
    <LogoContext.Provider value={{ logoData, setLogoData }}>
      {children}
    </LogoContext.Provider>
  );
};

// Custom hook for easy access
export const useLogo = () => useContext(LogoContext);
