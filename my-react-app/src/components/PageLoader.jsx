import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function PageLoader({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Trigger the loading state on route change
    setLoading(true);

    // Keep the loading screen visible for exactly 3 seconds (3000ms)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Clean up the timeout execution if the user clicks away fast
    return () => clearTimeout(timer);
  }, [location.pathname]); // Fires every time the URL path changes

  if (loading) {
    return (
      <div 
        className="d-flex flex-column align-items-center justify-content-center w-100" 
        style={{ 
          minHeight: "100vh", 
          backgroundColor: "#ffffff", 
          position: "fixed", 
          top: 0, 
          left: 0, 
          zIndex: 9999 
        }}
      >
        <div 
          className="spinner-border text-success" 
          style={{ width: "3.5rem", height: "3.5rem", borderWidth: "5px" }} 
          role="status"
        />
        <h4 className="mt-4 fw-bold text-dark tracking-wide">Loading GroupBuy...</h4>
        <p className="text-secondary small">Fetching the latest group deals for you</p>
      </div>
    );
  }

  return children;
}

export default PageLoader;