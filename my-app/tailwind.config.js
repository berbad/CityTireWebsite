module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tire: {
          red: "#DC2626",
          "red-dark": "#B91C1C",
          "red-light": "#EF4444",
          black: "#0A0A0A",
          "gray-dark": "#1A1A1A",
          "gray-mid": "#2A2A2A",
          "gray-light": "#3A3A3A",
        },
      },
      fontFamily: {
        heading: ['"Oswald"', "sans-serif"],
        body: ['"Source Sans 3"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
