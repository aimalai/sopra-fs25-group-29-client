"use client";
import "@ant-design/v5-patch-for-react-19";
import 'antd/dist/reset.css';

import React, { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "antd";

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage: "url('/BabaBild2.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const boxStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const logoContainerStyle: CSSProperties = { marginBottom: "24px" };

const logoStyle: CSSProperties = { width: "200px", height: "auto" };

const headingStyle: CSSProperties = {
  color: "#000",
  marginBottom: "16px",
  fontWeight: "bold",
  fontSize: "1.25rem",
  textAlign: "center",
};

const fullWidthBtn: CSSProperties = {
  width: "100%",
  marginBottom: "8px",
  backgroundColor: "#007BFF",
  borderColor: "#007BFF",
  color: "#ffffff",
};

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <div style={logoContainerStyle}>
          <Image src="/NiroLogo.png" alt="App Logo" width={200} height={200} style={logoStyle} />
        </div>

        <div style={headingStyle}>Welcome to Flicks & Friends</div>
        <p style={{ color: "black" }}>
          Your ultimate hub to discover, rate, and share movies & TV shows together.<br /><br />
          Create watchlists, plan virtual watch parties, and connect with friends to enjoy entertainment like never before!<br />
          Let&apos;s watch together – anytime, anywhere. 🍿✨
        </p>
        <br />
        <p style={{ color: "black" }}>Join The Party 👇</p>

        <Button type="primary" style={fullWidthBtn} onClick={() => router.push("/register")}>Register</Button>
        <p style={{ color: "black", margin: 0 }}>Already have an account?</p>
        <Button type="primary" style={fullWidthBtn} onClick={() => router.push("/login")}>Login</Button>
      </div>
    </div>
  );
}
