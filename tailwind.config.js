import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1738px",

        "lg-md": "1406px",
        "lg-sm": "948px",
        "sm-lg": "934px",
        "sm-md": "458px",

        "sm-sm": "200px",
      },
      colors: {
        customGray: "#2A2A2A",
        customBlue: "#3B82F6",
        customBlueLight: "#2E5698",
      },
      fontFamily: {
        readex: ["Readex Pro", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        cairo: ["Cairo", "sans-serif"],
        almarai: ["Almarai", "sans-serif"],
        arabic: ["Cairo", "Almarai", "Arabic Typesetting", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
