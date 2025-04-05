"use client"; // Ensures the component uses React hooks and browser APIs

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
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

  const handleLogin = async (values: LoginFormProps) => {
    try {
      // Call the login API and ensure response is explicitly typed
      const response: Response = await apiService.post("/users/login", values);

      // Debug: Log the raw API response
      console.log("Login API Raw Response:", response);

      // Extract the token and save it in localStorage
      const token = await response.text(); // Parse the response as plain text
      if (token) {
        localStorage.setItem("token", token); // Save the token directly
        console.log("Token saved to localStorage:", token);
      } else {
        console.warn("No token found in the login response!");
      }

      // Redirect to user dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);

      if (error instanceof Error) {
        const errorMessage =
          error.message || "An unknown error occurred during login.";

        // Handle lockout error (403 Forbidden)
        if (errorMessage.includes("Account locked")) {
          form.setFields([
            {
              name: "username",
              errors: [errorMessage], // Display lockout message inline
            },
            {
              name: "password",
              errors: [""], // Clear password error
            },
          ]);
          return;
        }

        // Handle invalid credentials
        form.setFields([
          { name: "username", errors: ["Invalid username or password"] },
          { name: "password", errors: ["Invalid username or password"] },
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
