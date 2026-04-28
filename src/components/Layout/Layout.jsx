import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./Layout.css";

function Layout() {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="layout-content">
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;
