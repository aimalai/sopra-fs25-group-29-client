"use client"; // Disables SSR for components using React hooks

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";
import "../styles/globals.css";

interface LoginFormProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");

  const handleLogin = async (values: LoginFormProps) => {
    try {
      // Call the login API with corrected endpoint
      const response = await apiService.post<{ token: string }>(
        "/users/login", // Corrected endpoint
        values
      );

      // Store the token in local storage
      if (response.token) {
        setToken(response.token);
      }

      // Redirect to user dashboard or homepage
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        // Set form fields with inline error messages
        form.setFields([
          { name: "username", errors: ["Please check your username"] },
          { name: "password", errors: ["Please check your password"] },
        ]);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="login"
        size="large"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter your username!" }]}
        >
          <Input placeholder="Enter your username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please enter your password!" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
