import { createContext, useContext, useState } from "react";

const LogoContext = createContext();

export const LogoProvider = ({ children }) => {
  const [logoData, setLogoData] = useState({
    logoUrl: null, 
    brandName: "",
    primaryColors: [], 
    secondaryColors: [], 
    accentColors: [], 
    font: "Inter", 
    mockups: [], 
  });

  return (
    <LogoContext.Provider value={{ logoData, setLogoData }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => useContext(LogoContext);
