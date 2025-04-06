import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student 23-703-648",
  description: "sopra-fs25-template-client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: "#22426b",
              borderRadius: 8,
              // Statt "#fff" => "#000" (damit Text schwarz ist)
              colorText: "#000",
              fontSize: 16,

              // Statt "#16181D" => helleres Grau, z.B. "#f2f2f2"
              colorBgContainer: "#f2f2f2",
            },
            components: {
              Button: {
                // Alle Buttons sind weiterhin grün (#75bd9d),
                // falls ihr es hier überschreiben wollt,
                // lasst es oder ändert es ggf. auf #007BFF
                colorPrimary: "#75bd9d",
                algorithm: true,
                controlHeight: 38,
              },
              Input: {
                colorBorder: "gray",
                colorTextPlaceholder: "#888888",
                algorithm: false,
              },
              Form: {
                labelColor: "#000", // statt #fff
                algorithm: theme.defaultAlgorithm,
              },
              // Falls ihr den Table-Hintergrund zusätzlich überschreiben wollt:
              Table: {
                // Farbe für Tabellencontainer
                colorBgContainer: "#e0e0e0",
                colorText: "#000",
              },
            },
          }}
        >
          <AntdRegistry>{children}</AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
