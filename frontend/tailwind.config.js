/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  mode: "jit",
  purge: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#007456",
        primary: {
          50: '#e6fff8',
          100: '#b3ffeb',
          200: '#80ffde',
          300: '#4dffd1',
          400: '#1affc4',
          500: '#00e6ac',
          600: '#00b386',
          700: '#008060',
          800: '#004d39',
          900: '#001a13',
          DEFAULT: '#29C098',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          DEFAULT: '#8B5CF6',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f1729',
          DEFAULT: '#0F1729',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "dark",
      {
        night: {
          ...require("daisyui/src/theming/themes")["night"],
          "base-100": "#0f1729",
          neutral: "#ffffff",
          "base-content": "#ffffff",
        },
      },
    ],
    logs: false
  },
};
