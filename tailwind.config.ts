import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fondo: "#F9FAFB",
        texto: "#111827",
        marca: {
          DEFAULT: "#D946EF",
          hover: "#C026D3",
        },
        oscuro: "#09090B",
      },
    },
  },
  plugins: [],
};
export default config;