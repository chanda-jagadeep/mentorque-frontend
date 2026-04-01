import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <span className="text-xl font-bold text-indigo-600">MentorQue</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.name}</span>
        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
          {user?.role}
        </span>
        <button onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium">
          Logout
        </button>
      </div>
    </nav>
  );
}