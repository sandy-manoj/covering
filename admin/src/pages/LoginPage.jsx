import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@goldcoveringshop.com');
  const [password, setPassword] = useState('admin123@Password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-extrabold text-white">Chidambaram Covering</h2>
          <p className="text-xs text-stone-400">Store Management & WhatsApp Order Console</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-stone-300 font-semibold block mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-stone-800/80 border border-stone-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-stone-300 font-semibold block mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-stone-800/80 border border-stone-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>

        <div className="p-3 bg-stone-800/40 rounded-xl text-[11px] text-stone-400 text-center border border-stone-800">
          Demo Admin: <strong>admin@goldcoveringshop.com</strong><br />
          Password: <strong>admin123@Password</strong>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

