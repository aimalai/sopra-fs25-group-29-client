// app/layout.tsx
import type { Metadata } from "next";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Suspense } from "react";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import NotificationProvider from "@/components/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flicks & Friends",
  description: "sopra-fs25-template-client",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Suspense>
          <ConfigProvider
            theme={{
              algorithm: theme.defaultAlgorithm,
              token: {
                colorPrimary: "#22426b",
                borderRadius: 8,
                colorText: "#000",
                fontSize: 16,
                colorBgContainer: "#f2f2f2",
              },
              components: {
                Button: {
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
                  labelColor: "#000",
                  algorithm: theme.defaultAlgorithm,
                },
                Table: {
                  colorBgContainer: "#e0e0e0",
                  colorText: "#000",
                },
              },
            }}
          >
            <AntdRegistry>
              <Navbar />
              <NotificationProvider>
                {children}
                <ToastContainer
                  position="top-right"
                  autoClose={10000}
                  newestOnTop
                  closeButton
                  style={{ top: "80px" }}
                />
              </NotificationProvider>
            </AntdRegistry>
          </ConfigProvider>
        </Suspense>
      </body>
    </html>
  );
}
