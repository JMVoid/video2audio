/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  // 可选：daisyui 主题配置
  daisyui: {
    themes: ["light", "dark", "cupcake"], // 你可以根据需要选择或添加主题
  },
} 