import React, { useState, useEffect } from 'react';
import { Package, CalendarClock, ShoppingBag, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        setStats(res.data?.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-stone-500">Loading store telemetry...</div>;
  }

  const statCards = [
    { title: 'Total Active Chains', value: stats?.totalProducts || 0, icon: Package, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Bridal Rental Inventory', value: stats?.rentalProducts || 0, icon: CalendarClock, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Orders Placed Today', value: stats?.ordersToday || 0, icon: ShoppingBag, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Pending WhatsApp Orders', value: stats?.pendingOrders || 0, icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Dashboard Overview</h1>
        <p className="text-xs text-stone-500 mt-1">Real-time stats from customer orders and rental returns</p>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500 font-medium">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-stone-900 mt-1 font-serif">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Trend Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Orders Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Order Volume & Sales (Last 7 Days)
            </h3>
            <span className="text-[11px] text-stone-400">Auto-updated via WhatsApp checkouts</span>
          </div>

          <div className="h-64 w-full">
            {stats?.dailyOrders?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Orders" fill="#D97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                No orders recorded yet in past 7 days. Once a customer places an order, the chart renders live.
              </div>
            )}
          </div>
        </div>

        {/* Low-stock & Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Low Stock Alerts
          </h3>

          <div className="space-y-2.5 text-xs">
            {stats?.lowStockProducts?.length > 0 ? (
              stats.lowStockProducts.map((p) => (
                <div key={p._id} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-900 truncate max-w-[160px]">{p.name}</p>
                    <p className="text-[10px] text-stone-500 font-mono">{p.productCode}</p>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-white px-2 py-1 rounded-md border border-rose-200">
                    {p.stock} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-stone-400 text-xs py-4 text-center">
                All chain items have healthy stock levels (&gt; 3 units).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

