import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function RoleRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/login" />;
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === "USER") return <Navigate to="/user" />;
  if (user.role === "MENTOR") return <Navigate to="/mentor" />;
  if (user.role === "ADMIN") return <Navigate to="/admin" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<RoleRoute role="USER"><UserDashboard /></RoleRoute>} />
          <Route path="/mentor" element={<RoleRoute role="MENTOR"><MentorDashboard /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute role="ADMIN"><AdminDashboard /></RoleRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}   