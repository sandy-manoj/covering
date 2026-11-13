import React, { useState, useEffect } from 'react';
import { Search, Printer, CheckCircle, Clock, Truck, RefreshCw, XCircle } from 'lucide-react';
import { getAdminOrders, updateOrderStatus } from '../services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    getAdminOrders({ status: statusFilter !== 'All' ? statusFilter : undefined, search })
      .then((res) => {
        setOrders(res.data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, { status: newStatus });
    fetchOrders();
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Dispatched': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Rented': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Returned': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">WhatsApp Orders</h1>
          <p className="text-xs text-stone-500 mt-1">Manage orders submitted by customers via WhatsApp checkout</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {['All', 'Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                statusFilter === st
                  ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Current Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-4">
                    <p className="font-mono font-bold text-amber-900">{o.orderId}</p>
                    <p className="text-[10px] text-stone-400">{new Date(o.createdAt).toLocaleString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-stone-900">{o.customer?.fullName}</p>
                    <p className="text-[11px] text-stone-500">{o.customer?.phone} • {o.customer?.city}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-stone-800">{o.items?.length} item(s)</p>
                    <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
                      {o.items?.map((i) => i.name).join(', ')}
                    </p>
                  </td>
                  <td className="p-4 font-bold text-stone-900 font-serif">
                    ₹{o.financials?.grandTotal}
                  </td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-hidden ${getStatusBadge(o.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No orders found for this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Invoice Printable Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Order Receipt</span>
                <h3 className="font-serif font-bold text-xl text-stone-900 mt-0.5">Order #{selectedOrder.orderId}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-stone-600 hover:text-black rounded-lg bg-stone-100"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-stone-400 hover:text-black rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="text-stone-400 block font-semibold">Customer:</span>
                <p className="font-bold text-stone-900 mt-0.5">{selectedOrder.customer.fullName}</p>
                <p className="text-stone-600">{selectedOrder.customer.phone}</p>
                <p className="text-stone-600">{selectedOrder.customer.email}</p>
              </div>
              <div>
                <span className="text-stone-400 block font-semibold">Delivery Address:</span>
                <p className="text-stone-800 mt-0.5">{selectedOrder.customer.address}</p>
                <p className="text-stone-800">{selectedOrder.customer.city} - {selectedOrder.customer.pincode}</p>
                <p className="text-stone-600 mt-1 font-semibold">{selectedOrder.customer.deliveryType} • {selectedOrder.customer.paymentPreference}</p>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Items Ordered:</h4>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white">
                  <div>
                    <p className="font-bold text-stone-900">{item.name} ({item.productCode})</p>
                    <p className="text-[11px] text-stone-500">
                      Type: {item.orderType} | Qty: {item.quantity} | ₹{item.unitPrice} each
                    </p>
                    {item.customization?.text && (
                      <p className="text-[11px] text-amber-700 font-medium">Custom Name: "{item.customization.text}"</p>
                    )}
                    {item.rentalDates?.startDate && (
                      <p className="text-[11px] text-purple-700 font-medium">
                        Rental: {new Date(item.rentalDates.startDate).toLocaleDateString()} to {new Date(item.rentalDates.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-stone-900 font-serif">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.financials.subtotal}</span>
              </div>
              {selectedOrder.financials.depositTotal > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>Refundable Deposit:</span>
                  <span>₹{selectedOrder.financials.depositTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold font-serif pt-2 border-t border-stone-800">
                <span>Grand Total:</span>
                <span className="text-amber-400">₹{selectedOrder.financials.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

