import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  CalendarClock, 
  Layers, 
  Sliders, 
  Image as ImageIcon,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, admin } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products Management', path: '/products', icon: Package },
    { name: 'Orders (WhatsApp)', path: '/orders', icon: ShoppingBag },
    { name: 'Rental Bookings', path: '/rentals', icon: CalendarClock },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Hero Banners', path: '/banners', icon: ImageIcon },
    { name: 'Store Settings', path: '/settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-stone-800">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-400 font-serif font-extrabold text-xl">
            <span>⚜️</span>
            <span>CHIDAMBARAM</span>
          </div>
          <span className="text-[10px] text-stone-400 tracking-widest uppercase block mt-0.5">
            Admin Management Console
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5 text-xs font-medium">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-amber-600 text-white font-bold shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-stone-800 space-y-3">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-800/60 text-xs text-amber-400 hover:text-amber-300"
        >
          <span>View Live User Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center justify-between px-2 pt-2">
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{admin?.name || 'Store Admin'}</p>
            <p className="text-[10px] text-stone-400 truncate">{admin?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

