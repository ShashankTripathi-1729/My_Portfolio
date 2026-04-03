/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void:   '#02000a',
        ember:  '#ff4400',
        flame:  '#ff8800',
        gold:   '#ffcc00',
        lava:   '#ff2200',
        ash:    '#1a0a00',
        ice:    '#88ccff',
        soul:   '#cc44ff',
      },
    },
  },
  plugins: [],
}
