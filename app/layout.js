import "./globals.css";

export const metadata = {
  title: "Makeup Intelligence Studio — Your Personal Makeup Assistant",
  description:
    "Build optimized makeup looks using only the products you already own. Generate full routines, fix makeup issues, and discover smart product pairings.",
  keywords:
    "makeup assistant, makeup looks, foundation guide, skin tone makeup, makeup routine generator",
  openGraph: {
    title: "Makeup Intelligence Studio",
    description: "Your personal makeup assistant in the browser.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
