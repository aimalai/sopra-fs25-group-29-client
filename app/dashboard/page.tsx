"use client"; // Ensures the component uses React hooks and browser APIs

import { useRouter } from "next/navigation"; // For navigation

const Dashboard: React.FC = () => {
  const router = useRouter();

  // Logout function to clear the session
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token to end the session
    alert("You have successfully logged out!"); // Feedback message
    router.push("/login"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to your Dashboard</h1>
      <p>This is a placeholder for your dashboard features.</p>
      {/* Logout button */}
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
