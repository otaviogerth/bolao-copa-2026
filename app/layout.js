export const metadata = {
  title: "BetLube",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BetLube",
  },
};

export const viewport = {
  themeColor: "#D8091B",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#f9f9f9", minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
