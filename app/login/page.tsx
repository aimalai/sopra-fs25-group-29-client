"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";

// AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

interface FormFieldProps {
  label: string;
  value: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken} = useLocalStorage<string>("token", "");
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
      message.success("Login Successful: You have been successfully logged in.");
      router.push("/users");
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error("Login Failed: " + (error.message || "An error occurred during login."));
      } else {
        message.error("Login Failed: An unknown error occurred during login.");
      }
    }
  };
  

  return (
    <div className="auth-container">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
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
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input type="password" placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="auth-button">
            Login
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" className="auth-button" onClick={() => router.push("/")}>
            Back
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            className="auth-button"
            onClick={() => router.push("/register")}
          >
            Not registered yet? Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;