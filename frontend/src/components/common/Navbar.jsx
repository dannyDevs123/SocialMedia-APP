import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import BrandWordmark from './BrandWordmark';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close the dropdown when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktopMenu = desktopMenuRef.current && desktopMenuRef.current.contains(event.target);
      const clickedMobileMenu = mobileMenuRef.current && mobileMenuRef.current.contains(event.target);
      if (!clickedDesktopMenu && !clickedMobileMenu) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    console.log('[Navbar] handleLogout() — user clicked "Log out". user:', user?.name);
    setMenuOpen(false);
    console.log('[Navbar] handleLogout() — calling AuthContext.logout()...');
    // Delegates to AuthContext.logout() which performs:
    //   1. localStorage.clear()
    //   2. delete api.defaults.headers.common['Authorization']
    //   3. setUser(null)
    //   4. navigate('/login', { replace: true })
    await logout();
    console.log('[Navbar] handleLogout() — logout() returned. About to toast.');
    toast.success('Logged out');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { path: '/', label: 'Home', icon: (
          <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive('/') ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ) },
        { path: `/profile/${user._id}`, label: 'Profile', icon: (
          <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill={isActive(`/profile/${user._id}`) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive(`/profile/${user._id}`) ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) },
      ]
    : [];

  return (
    <>
      {/* ── Desktop Left Sidebar ── */}
      <aside className="hidden xl:flex flex-col w-[275px] h-screen sticky top-0 px-3 py-2">
        {/* ZiZU Logo */}
        <div className="px-3 py-2 mb-2">
          <Link to="/" className="inline-flex items-center justify-center w-[50px] h-[50px] rounded-full hover:bg-[#1d9bf0]/10 transition-colors">
            <BrandWordmark as="span" className="text-[28px]" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-0.5 mb-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.icon}
              <span className="text-xl">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Post Button (desktop) */}
        {user && (
          <button
            onClick={() => {
              const textarea = document.querySelector('[data-composer]');
              textarea?.focus();
            }}
            className="bg-[#1d9bf0] text-white rounded-full py-3.5 px-8 font-bold text-lg
              hover:bg-[#1a8cd8] transition-all duration-200 active:scale-[0.97]
              shadow-md hover:shadow-lg w-[90%] mt-2"
          >
            Post
          </button>
        )}

        {/* User Menu Area (bottom of sidebar) */}
        <div className="mt-auto">
          {loading ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-[#cfd9de] animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-[#cfd9de] rounded animate-pulse w-24" />
                <div className="h-3 bg-[#cfd9de] rounded animate-pulse w-16" />
              </div>
            </div>
          ) : user ? (
            <div className="relative" ref={desktopMenuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-full hover:bg-[#e8e8e8]/60 transition-all duration-200"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-bold text-[#0f1419] truncate">{user.name}</p>
                  <p className="text-sm text-[#536471] truncate">@{user.name?.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
                <svg className="w-5 h-5 text-[#536471]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-[#eff3f4] py-3 animate-scale-in z-50">
                  <div className="px-4 pb-3 border-b border-[#eff3f4] mb-1">
                    <p className="text-sm font-bold text-[#0f1419] truncate">{user.name}</p>
                    <p className="text-sm text-[#536471] truncate">{user.email}</p>
                  </div>
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={() => {
                      console.log('[Navbar] DESKTOP popover — "View Profile" clicked. user._id:', user._id, 'navigating to:', `/profile/${user._id}`);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0f1419] hover:bg-[#f7f9f9] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </Link>
                  <Link
                    to="/edit-profile"
                    onClick={() => {
                      console.log('[Navbar] DESKTOP popover — "Edit Profile" clicked. Navigating to /edit-profile');
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0f1419] hover:bg-[#f7f9f9] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </Link>
                  <div className="my-1 border-t border-[#eff3f4]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#f4212e] hover:bg-[#f4212e]/5 transition-colors text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out @{user.name?.toLowerCase().replace(/\s+/g, '')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 flex flex-col gap-2">
              <Link to="/login" className="btn-outline-white text-center text-sm py-2.5 w-full">
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-center text-sm py-2.5 w-full">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#eff3f4] z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-[52px] max-w-lg mx-auto">
          <Link to="/" className={`flex items-center justify-center w-full h-full ${isActive('/') ? 'text-[#0f1419]' : 'text-[#536471]'}`}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive('/') ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          {user && (
            <Link to={`/profile/${user._id}`} className={`flex items-center justify-center w-full h-full ${isActive(`/profile/${user._id}`) ? 'text-[#0f1419]' : 'text-[#536471]'}`}>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isActive(`/profile/${user._id}`) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive(`/profile/${user._id}`) ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
          {!user && (
            <>
              <Link to="/login" className="flex items-center justify-center w-full h-full text-[#536471]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile header (top) */}
      <header className="xl:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#eff3f4] z-40">
        <div className="flex justify-between items-center h-[52px] px-4 max-w-lg mx-auto">
          <Link to="/" className="flex items-center">
            <BrandWordmark as="span" className="text-xl" />
          </Link>
          {user ? (
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar src={user.avatar} name={user.name} size="xs" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-[#eff3f4] py-3 animate-scale-in z-50">
                  <div className="px-4 pb-3 border-b border-[#eff3f4] mb-1">
                    <p className="text-sm font-bold text-[#0f1419] truncate">{user.name}</p>
                    <p className="text-sm text-[#536471] truncate">{user.email}</p>
                  </div>
                  <Link to={`/profile/${user._id}`} onClick={() => { console.log('[Navbar] MOBILE popover — "View Profile" clicked. user._id:', user._id); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0f1419] hover:bg-[#f7f9f9] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    View Profile
                  </Link>
                  <Link to="/edit-profile" onClick={() => { console.log('[Navbar] MOBILE popover — "Edit Profile" clicked.'); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0f1419] hover:bg-[#f7f9f9] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Profile
                  </Link>
                  <div className="my-1 border-t border-[#eff3f4]" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#f4212e] hover:bg-[#f4212e]/5 transition-colors text-left">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Log out @{user.name?.toLowerCase().replace(/\s+/g, '')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline-white text-xs py-1.5 px-4">Log in</Link>
              <Link to="/register" className="btn-primary text-xs py-1.5 px-4">Sign up</Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
