import {Button} from "@mui/material";
import {useEffect} from "react";
import {useLocation} from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#6EE7B7]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-3xl text-gray-700 mb-4">Oops! Page not found</p>
        <a href="/">
          <Button>Return to Home</Button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
