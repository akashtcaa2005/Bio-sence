
import { useEffect } from "react";
import UserDashboard from "./UserDashboard";

const Index = () => {
  useEffect(() => {
    document.title = "Bio Sense - Health Monitoring Dashboard";
  }, []);

  // For now, we'll render the UserDashboard component directly
  // In a real app, we might have a landing page or login screen
  return <UserDashboard />;
};

export default Index;
