import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../AppContext";
import LandingPage from "../LandingPage/LandingPage";
import { useState } from "react";
const Home = () => {
  const { isAuth, user } = useAppContext();
  const navigate = useNavigate();
  const [firstTime, setFirstTime] = useState(true);
//   useEffect(() => {
//     // Redirect authenticated users to dashboard
//     if (isAuth && user && firstTime) {
//       setFirstTime(false);
//       navigate("/dashboard");
//     }
//   }, [isAuth, user, navigate]);

  // Show LandingPage for guests, redirect will handle authenticated users
  return <LandingPage />;
};

export default Home;
