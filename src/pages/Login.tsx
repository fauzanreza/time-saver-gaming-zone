
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is trying to access admin mode
    const userMode = localStorage.getItem("userMode");
    
    if (!userMode || userMode !== "admin") {
      // If not explicitly in admin mode, redirect to customer dashboard
      localStorage.setItem("userMode", "customer");
      localStorage.setItem("isCustomer", "true");
      navigate("/");
    }
  }, [navigate]);

  return <LoginForm />;
};

export default Login;
