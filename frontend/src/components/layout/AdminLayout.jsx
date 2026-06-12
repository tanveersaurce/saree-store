// AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Image,
  Menu, X, LogOut, ChevronRight, Bell, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../context/store';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/users', icon: Users, label: 'Customers' },
  { href: '/admin/banners', icon: Image, label: 'Banners' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (href, exact) => exact ? location.pathname === href : location.pathname.startsWith(href);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-saree-charcoal text-white ${mobile ? '' : 'w-64'}`}>
      <div className="p-5 border-b border-white/10">
        <Link to="/admin" className="flex flex-col">
          <span className="font-display text-xl font-bold text-saree-crimson">Saaj Admin</span>
          <span className="text-white/40 text-xs tracking-widest uppercase mt-0.5">Dashboard</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => (
          <Link key={href} to={href}
            onClick={() => mobile && setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(href, exact) ? 'bg-saree-rose text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
            <Icon size={17} />
            {label}
            {isActive(href, exact) && <ChevronRight size={14} className="ml-auto opacity-60" />}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link to="/" target="_blank" className="flex items-center gap-2 text-white/50 text-xs hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
          <ExternalLink size={13} /> View Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-white/50 text-xs hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-white/10">
          <LogOut size={13} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ width: 0 }} animate={{ width: 256 }} exit={{ width: 0 }} className="hidden lg:flex flex-shrink-0 overflow-hidden">
            <Sidebar />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="lg:hidden fixed left-0 top-0 h-full w-64 z-50">
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-saree-rose rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saree-rose to-saree-crimson flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-saree-charcoal leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
