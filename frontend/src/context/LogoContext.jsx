import { createContext, useContext, useState } from "react";

const LogoContext = createContext();

export const LogoProvider = ({ children }) => {
  const [logoData, setLogoData] = useState({
    logoUrl: "/src/assets/logos/selected_logo.png", // URL of generated logo
    primaryColors: ["#FFD54F"], // main primary color
    secondaryColors: ["#4FC3F7"], // secondary color(s)
    accentColors: ["#FF8A65", "#81C784", "#BA68C8"], // accent colors
    font: "Poppins Rounded", // font selected/generated
    mockups: [
      { type: "T-Shirt", imageUrl: "/src/assets/mockups/tshirt_mockup.png" },
      { type: "Business Card", imageUrl: "/src/assets/mockups/businesscard_mockup.png" },
      { type: "Instagram Post", imageUrl: "/src/assets/mockups/instagram_mockup.png" },
      { type: "Merchandise / Mug", imageUrl: "/src/assets/mockups/mug_mockup.png" },
    ], // array of mockup objects { type, imageUrl }
  });

  return (
    <LogoContext.Provider value={{ logoData, setLogoData }}>
      {children}
    </LogoContext.Provider>
  );
};

// Custom hook for easy access
export const useLogo = () => useContext(LogoContext);
