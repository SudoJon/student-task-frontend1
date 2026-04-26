import { useEffect } from "react";
import { useLoading } from "../../context/LoadingContext";

import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const { setGlobalLoading } = useLoading();

  useEffect(() => {
    // ⭐ Auth has navigated into the protected app shell.
    // This means the system is ready → hide the full-screen loading overlay.
    setGlobalLoading(false);
  }, []);

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
}

export default Layout;
