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
      pattern: /^(text|bg|border)-\[color:hsl\(.*\)\]/,
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
      fontFamily: {
        sans: ['Neue Haas Unica', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        imaki: ['Imaki', 'cursive'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '1': `${baseUnit / (goldenRatio * 2)}px`,
        '2': `${baseUnit / goldenRatio}px`,
        '3': `${baseUnit}px`,
        '4': `${baseUnit * goldenRatio}px`,
        '6': `${baseUnit * goldenRatio * 1.5}px`,
      },
      fontSize: {
        // Base text size scaling
        'xs': `calc(${baseUnit}px / ${goldenRatio})`,
        'sm': `calc(${baseUnit}px * ${1/goldenRatio})`,
        'base': `${baseUnit}px`,
        'lg': `calc(${baseUnit}px * ${goldenRatio})`,
        'xl': `calc(${baseUnit}px * ${goldenRatio} * ${goldenRatio})`,
        '2xl': `calc(${baseUnit}px * ${goldenRatio} * ${goldenRatio} * ${goldenRatio})`,
        '3xl': `calc(${baseUnit}px * ${goldenRatio} * ${goldenRatio} * ${goldenRatio} * ${goldenRatio})`,
        
        // Fluid typography for responsive scaling
        'fluid-xs': fluidSize(12/goldenRatio, 14/goldenRatio),
        'fluid-sm': fluidSize(14/goldenRatio, 16/goldenRatio),
        'fluid-base': fluidSize(16, 18),
        'fluid-lg': fluidSize(16 * goldenRatio/1.2, 18 * goldenRatio),
        'fluid-xl': fluidSize(16 * goldenRatio, 20 * goldenRatio),
        'fluid-2xl': fluidSize(16 * goldenRatio * 1.2, 24 * goldenRatio),
        'fluid-3xl': fluidSize(16 * goldenRatio * 1.5, 30 * goldenRatio),
      },
      fontWeight: {
        'ultralight': 200,
        'light': 300,
        'regular': 400,
        'medium': 500,
        'bold': 700,
        'heavy': 800,
        'black': 900,
      },
      lineHeight: {
        'tight': '1.2',
        'normal': String(goldenRatio),
        'relaxed': String(goldenRatio * 1.2),
        'display': String(goldenRatio * 0.8), // For headings
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