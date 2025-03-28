"use client"; // To disable SSR for React hooks and browser APIs
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Application Branding */}
        <h1 className={styles.groupName}>Group Number 29</h1>
        <p>Welcome! Please log in or register to get started.</p>

        {/* Login and Register Actions */}
        <div className={styles.ctas}>
          <Button
            type="primary"
            variant="solid"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
          <Button
            type="default"
            variant="solid"
            onClick={() => router.push("/register")}
          >
            Register
          </Button>
        </div>
      </main>

      {/* Footer Links */}
      <footer className={styles.footer}>
        <p>
          Powered by <strong>Next.js</strong> and <strong>Ant Design</strong>.
        </p>
      </footer>
    </div>
  );
}
