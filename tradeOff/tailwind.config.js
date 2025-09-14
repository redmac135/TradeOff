/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'Light-Blue': '#E6F3FF',  // Light blue background
        'Blue': '#005DAA',        // RBC Blue
        'Yellow': '#FFD200',      // RBC Yellow
        '50': '#F8FAFC',          // Very light gray
        '300': '#D1D5DB',         // Light gray
        '400': '#9CA3AF',         // Medium gray
        '600': '#4B5563',         // Medium dark gray
        '700': '#374151',         // Dark gray
        '800': '#1F2937',         // Darker gray
        '900': '#111827',         // Almost black
      },
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
