import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
    const location = useLocation();

    // Check both storages because of "Keep me signed in"
    const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

    if (!token) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
}