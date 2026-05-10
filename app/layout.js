import "./globals.css";

export const metadata = {
  title: "Lumière — Your Personal AI Makeup Studio",
  description:
    "Build optimized makeup looks using only the products you already own. Generate full routines, fix makeup issues, get AI-scored feedback, and discover smart product pairings.",
  keywords:
    "makeup assistant, makeup looks, foundation guide, skin tone makeup, makeup routine generator, AI makeup, beauty app",
  openGraph: {
    title: "Lumière — AI Makeup Studio",
    description: "Your personal AI makeup assistant in the browser.",
    type: "website",
  },
};

// Inline script prevents flash of wrong theme on load
const darkModeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('mis_dark_mode');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = stored !== null ? stored === 'true' : prefersDark;
      if (isDark) document.documentElement.classList.add('dark');
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Anti-flash dark mode — runs before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
