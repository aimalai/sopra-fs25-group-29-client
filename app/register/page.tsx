"use client"; // For components that need React hooks and browser APIs, SSR (server-side rendering) has to be disabled.

import { useRouter } from "next/navigation"; // For navigation
import { useApi } from "@/hooks/useApi"; // Custom API service
import { Button, Form, Input } from "antd"; // Ant Design components
import useLocalStorage from "@/hooks/useLocalStorage";
import "../styles/globals.css";

interface RegisterFormProps {
  username: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", ""); // Hook for managing localStorage

  const handleRegister = async (values: RegisterFormProps) => {
    try {
      // Call the API service's /users/register endpoint
      const token = await apiService.post<string>("/users/register", values);

      // Use the localStorage setter function to save the token if available
      if (token) {
        setToken(token);
      }

      // Navigate to the users overview page
      router.push("/users");
    } catch (error) {
      if (error instanceof Error) {
        const backendErrorMessage =
          error.message || "Registration failed due to server error.";
        // Map errors to specific form fields with inline messages
        if (backendErrorMessage.includes("Username is already taken")) {
          form.setFields([
            { name: "username", errors: ["Username is already taken."] },
          ]);
        } else if (backendErrorMessage.includes("Passwords do not match")) {
          form.setFields([
            { name: "confirmPassword", errors: ["Passwords do not match."] },
          ]);
        } else if (
          backendErrorMessage.includes(
            "Password must be at least 8 characters long"
          )
        ) {
          form.setFields([
            {
              name: "password",
              errors: ["Password must meet the minimum requirements."],
            },
          ]);
        } else {
          form.setFields([{ name: "username", errors: [backendErrorMessage] }]);
        }
      } else {
        console.error("An unknown error occurred during registration.");
      }
    }
  };

  return (
    <div className="register-container">
      <Form
        form={form}
        name="register"
        size="large"
        layout="vertical"
        onFinish={handleRegister}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 8, message: "Password must be at least 8 characters long!" },
            {
              pattern:
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message:
                "Password must include letters, numbers, and special characters!",
            },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="register-button">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
