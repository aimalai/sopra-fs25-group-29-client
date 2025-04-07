"use client";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";
import { CSSProperties } from "react";

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
  backgroundColor: "#f2f2f2"
};

const logoContainerStyle: CSSProperties = {
  marginBottom: "24px"
};

const logoStyle: CSSProperties = {
  width: "200px",
  height: "auto"
};

const formBoxStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  width: "320px"
};

const headingStyle: CSSProperties = {
  color: "#000",
  marginBottom: "16px",
  fontWeight: "bold",
  fontSize: "1.25rem"
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#007BFF",
  color: "#ffffff",
  width: "100%"
};

const inputStyle: CSSProperties = {
  backgroundColor: "#e0e0e0",
  border: "1px solid #ccc",
  color: "#000"
};

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<number>("userId", 0);

  const handleLogin = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<User>("/users/login", values);
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(Number(response.id));
      }
      message.success("Login Successful.");
      router.push("/users");
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error("Login Failed: " + (error.message || "An error occurred."));
      } else {
        message.error("Login Failed: An unknown error occurred.");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={logoContainerStyle}>
        <img src="/NiroLogo.png" alt="App Logo" style={logoStyle} />
      </div>
      <div style={formBoxStyle}>
        <div style={headingStyle}>Login below!</div>
        <Form
          form={form}
          name="login"
          size="large"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            label={<span style={{ color: "#000" }}>Choose your Username</span>}
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input style={inputStyle} placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#000" }}>Choose your Password</span>}
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input
              type="password"
              style={inputStyle}
              placeholder="Enter password"
            />
          </Form.Item>
          <Form.Item>
            <Button style={buttonStyle} htmlType="submit">
              Login
            </Button>
          </Form.Item>
          <Form.Item>
            <Button style={buttonStyle} onClick={() => router.push("/register")}>
              Not registered yet? Register now!
            </Button>
          </Form.Item>
          <Form.Item>
            <Button style={buttonStyle} onClick={() => router.push("/")}>
              Back
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;