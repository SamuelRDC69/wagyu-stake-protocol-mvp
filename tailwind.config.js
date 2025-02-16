/** @type {import('tailwindcss').Config} */
const goldenRatio = 1.618;
const baseUnit = 16;
// Helper function for fluid typography
const fluidSize = (min, max) => `clamp(${min}px, ${min/16}rem + 1vw, ${max}px)`;

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
  {
    pattern: /^(text|bg|border)-\[hsl\(.*\)\]/,
    variants: ['hover', 'focus', 'active'],
  }
],

  theme: {
    container: {
      center: true,
      padding: `${baseUnit * goldenRatio}px`,
      screens: {
        "sm": "640px",
        "md": "768px",
        "lg": `${1024 / goldenRatio}px`,
        "xl": "1280px",
        "2xl": `${1618}px`, // Based on golden ratio
      },
    },
    extend: {
      spacing: {
        '1': `${baseUnit / (goldenRatio * 2)}px`,
        '2': `${baseUnit / goldenRatio}px`,
        '3': `${baseUnit}px`,
        '4': `${baseUnit * goldenRatio}px`,
        '6': `${baseUnit * goldenRatio * 1.5}px`, // Fixed syntax error here
      },
      fontSize: {
        'xs': fluidSize(12/goldenRatio, 14/goldenRatio),
        'sm': fluidSize(14/goldenRatio, 16/goldenRatio),
        'base': fluidSize(16, 18),
        'lg': fluidSize(16 * goldenRatio/1.2, 18 * goldenRatio),
        'xl': fluidSize(16 * goldenRatio, 20 * goldenRatio),
        '2xl': fluidSize(16 * goldenRatio * 1.2, 24 * goldenRatio),
        '3xl': fluidSize(16 * goldenRatio * 1.5, 30 * goldenRatio),
      },
      lineHeight: {
        'tight': '1.2',
        'normal': String(goldenRatio),
        'relaxed': String(goldenRatio * 1.2),
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}