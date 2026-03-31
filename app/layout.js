import "./globals.css";

export const metadata = {
  title: "Two Words",
  description: "Enter two words. Get a ridiculous story.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
