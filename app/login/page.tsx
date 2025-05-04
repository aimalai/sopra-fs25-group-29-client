"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";
import { CSSProperties, useState } from "react";

interface FormFieldProps {
  label: string;
  value: string;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
};

const logoContainerStyle: CSSProperties = {
  marginBottom: "24px",
};

const logoStyle: CSSProperties = {
  width: "200px",
  height: "auto",
};

const formBoxStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  width: "320px",
};

const headingStyle: CSSProperties = {
  color: "#000",
  marginBottom: "16px",
  fontWeight: "bold",
  fontSize: "1.25rem",
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%",
};

const inputStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  border: "1px solid #ccc",
  color: "#000",
};

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<number>("userId", 0);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: FormFieldProps) => {
    setLoading(true);
    try {
      const response = await apiService.post<User>("/users/login", values);
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(Number(response.id));
      }
      message.success("You can now proceed to OTP Verification.");
      router.push("/otpVerification");
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 500) {
        message.error("An internal server error occurred. Please try again.");
      } else {
        message.error("Invalid username or password.");
      }
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={logoContainerStyle}>
        <Image
          src="/NiroLogo.png"
          alt="App Logo"
          style={logoStyle}
          width={200}
          height={200}
        />
      </div>
      <div style={formBoxStyle}>
        <div style={headingStyle}>Login below!</div>
        {loading && <div className="spinner"></div>}
        <Form
          form={form}
          name="login"
          size="large"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            label={<span style={{ color: "#000" }}>Enter your Username</span>}
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input style={inputStyle} placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#000" }}>Enter your Password</span>}
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password style={inputStyle} placeholder="Enter password" />
          </Form.Item>
          <Form.Item>
            <Button
              style={buttonStyle}
              htmlType="submit"
              disabled={loading}
            >
              Login
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              style={buttonStyle}
              onClick={() => router.push("/register")}
              disabled={loading}
            >
              Not registered yet? Register now!
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              style={buttonStyle}
              onClick={() => router.push("/")}
              disabled={loading}
            >
              Back
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
