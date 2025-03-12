
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Check if we're on GitHub Pages with a 404
    // This helps handle direct navigation to routes in GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io') || 
                          window.location.hostname.includes('healthapp.zone');
    
    if (isGitHubPages && location.pathname !== '/') {
      // For GitHub Pages, try to navigate to the route via the SPA router
      const path = location.pathname;
      
      // Reset to base route first
      window.history.replaceState(null, '', '/');
      
      // Then use React Router to navigate
      setTimeout(() => {
        navigate(path, { replace: true });
      }, 100);
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
