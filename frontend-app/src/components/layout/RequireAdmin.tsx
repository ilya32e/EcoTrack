import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export const RequireAdmin = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user || user.role !== "admin") {
        // Redirect them to the home page if they are not an admin
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};
