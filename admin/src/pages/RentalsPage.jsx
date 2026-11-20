import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getAdminRentals, updateRentalStatus } from '../services/api';

const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchRentals = () => {
    setLoading(true);
    getAdminRentals({ status: statusFilter !== 'All' ? statusFilter : undefined })
      .then((res) => {
        setRentals(res.data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);

  const handleStatusChange = async (rentalId, newStatus) => {
    await updateRentalStatus(rentalId, { status: newStatus });
    fetchRentals();
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Rental Chains Tracker</h1>
          <p className="text-xs text-stone-500 mt-1">
            Track rented wedding sets, upcoming return dates, and manage security deposits
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {['All', 'Booked', 'Active/Picked Up', 'Overdue', 'Returned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                statusFilter === st
                  ? 'bg-purple-700 text-white font-bold border-purple-700 shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-purple-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Chain Name & Code</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Rental Duration</th>
                <th className="p-4">Security Deposit</th>
                <th className="p-4">Rental Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rentals.map((r) => (
                <tr key={r._id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-stone-900">{r.productName}</p>
                    <p className="text-[10px] text-stone-400 font-mono">Code: {r.productCode} • #{r.orderId}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-stone-900">{r.customerName}</p>
                    <p className="text-[11px] text-stone-500">{r.customerPhone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-stone-800 font-semibold">
                      {new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}
                    </p>
                    {r.status === 'Overdue' && (
                      <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Return Overdue!
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-stone-900">₹{r.depositAmount}</span>
                    <span className="block text-[10px] text-purple-700 font-semibold">{r.depositStatus}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'Overdue' ? 'bg-rose-100 text-rose-700' :
                      r.status === 'Returned' ? 'bg-teal-100 text-teal-800' :
                      r.status === 'Active/Picked Up' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {r.status !== 'Returned' && (
                      <button
                        onClick={() => handleStatusChange(r._id, 'Returned')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg"
                      >
                        Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No active rental bookings. When customers checkout rental chains, they appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RentalsPage;

