import React from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/posts/Feed';
import UserProfile from './components/profile/UserProfile';
import EditProfile from './components/profile/EditProfile';
import ProtectedRoute from './components/common/ProtectedRoute';
import RightWidgets from './components/common/RightWidgets';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useAuth } from './hooks/useAuth';

function App() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (user && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  // Auth pages: centered layout without sidebars
  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Twitter-style 3-Column Layout ── */}
      <div className="flex justify-center min-h-screen">
        {/* ── Left Sidebar (desktop) ── */}
        <div className="hidden xl:flex justify-end flex-grow">
          <Navbar />
        </div>

        {/* ── Center Timeline ── */}
        <main className="w-full max-w-[600px] xl:max-w-[600px] border-x border-gray-100 min-h-screen
          pt-[52px] xl:pt-0 pb-[52px] xl:pb-0">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          </Routes>
        </main>

        {/* ── Right Widgets (desktop) ── */}
        <div className="hidden xl:block w-[350px] flex-shrink-0">
          <div className="sticky top-0 pt-3 px-4">
            <RightWidgets />
          </div>
        </div>
      </div>

      {/* Mobile Navbar (bottom nav + top header) */}
      <Navbar />
    </div>
  );
}

export default App;
