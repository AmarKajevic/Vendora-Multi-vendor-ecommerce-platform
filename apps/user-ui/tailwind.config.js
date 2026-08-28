/** @type {import('tailwindcss').Config} */
module.exports = {
  // Omogućava dark varijante putem klase .dark na html elementu
  darkMode: 'class',

  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    "./src/**/*{ts,tsx,js,jsx}",
    // Ako želite da izuzmete test/story fajlove, ovaj pattern verovatno treba da bude:
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    // ...createGlobPatternsForDependencies(__dirname) – ako koristite Nx, ovo je već zakomentarisano
  ],

  theme: {
    extend: {
      // Proširenje fontova (čuvamo postojeće Roboto i Poppins, dodajemo display i sans)
      fontFamily: {
        Roboto: ["var(--font-roboto)"],
        Poppins: ["var(--font-poppins)"],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
      },

      // Proširenje boja – mapiranje CSS varijabli iz :root
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        deal: 'var(--deal)',
        'deal-foreground': 'var(--deal-foreground)',
        choice: 'var(--choice)',
        'choice-foreground': 'var(--choice-foreground)',
        ink: 'var(--ink)',
        'ink-foreground': 'var(--ink-foreground)',
        surface: 'var(--surface)',
        star: 'var(--star)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },

      // Proširenje radijusa (border-radius)
      borderRadius: {
        sm: 'calc(var(--radius) - 2px)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        xl: 'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 10px)',
      },
    },
  },

  plugins: [],
};