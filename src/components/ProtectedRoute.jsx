import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, role, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "ADMIN" ? "/admin/tickets" : "/author/books"} replace />;
  }
  return children;
};

export default ProtectedRoute;
