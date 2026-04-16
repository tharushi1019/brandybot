import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 4.99,
    popular: false,
    features: ['50 logo generations', 'Full brand guidelines', 'Mockup generation', 'Download in PNG'],
    color: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 150,
    price: 9.99,
    popular: true,
    features: ['150 logo generations', 'Everything in Starter', 'Priority AI generation', 'High-res downloads', 'All mockup templates'],
    color: 'from-purple-600 to-blue-500'
  },
  {
    id: 'unlimited',
    name: 'Unlimited Pack',
    credits: 500,
    price: 24.99,
    popular: false,
    features: ['500 logo generations', 'Everything in Pro', 'First access to new features', 'Commercial usage rights'],
    color: 'from-pink-600 to-purple-600'
  }
];

const PurchasePage = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(null);
  const [purchasing, setPurchasing] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const getToken = async () => user?.getIdToken ? await user.getIdToken() : null;

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API}/credits`, { headers: { Authorization: `Bearer ${token}` } });
        setCredits(res.data.data?.balance);
      } catch (e) { /* silent */ }
    };
    fetch();
  }, []);

  const handlePurchase = async (pkg) => {
    setPurchasing(pkg.id);
    try {
      const token = await getToken();
      await axios.post(`${API}/credits/purchase`, { packageId: pkg.id }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccessMsg(`🎉 ${pkg.name} selected! PayPal integration is coming soon. We'll notify you when it's ready.`);
    } catch (e) {
      alert(e.response?.data?.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl hover:bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-secondary)]">←</button>
          <h1 className="font-bold text-lg">Credits & Billing</h1>
        </div>
        <div className="flex items-center gap-3">
          {credits !== null && (
            <div className="px-4 py-2 rounded-xl glass-card text-sm font-semibold">
              💎 {credits} credits remaining
            </div>
          )}
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] text-sm transition-colors">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 brand-gradient-text">Power Up Your Branding</h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Generate stunning logos, brand guidelines, and mockups with AI credits</p>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-8 p-4 rounded-2xl text-center" style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', color: 'var(--text-primary)' }}>
            {successMsg}
          </div>
        )}

        {/* PayPal Notice */}
        <div className="mb-10 p-5 rounded-2xl text-center glass-card">
          <p className="text-2xl mb-2">🔗</p>
          <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>PayPal Integration Coming Soon</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We're setting up secure PayPal payments. Select a package below to express interest — you'll be notified when payments go live.</p>
        </div>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-6">
          {PACKAGES.map(pkg => (
            <div key={pkg.id} className={`relative rounded-3xl overflow-hidden transition-transform hover:-translate-y-1 ${pkg.popular ? 'scale-105 shadow-2xl' : ''}`}
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold text-white brand-gradient">
                  ⭐ MOST POPULAR
                </div>
              )}
              <div className={`p-6 ${pkg.popular ? 'pt-10' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg`}>
                  {pkg.credits >= 500 ? '∞' : pkg.credits}
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{pkg.name}</h3>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{pkg.credits} logo credits</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>${pkg.price}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>one-time</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full py-3 rounded-2xl font-bold text-sm cursor-not-allowed opacity-60 border border-[var(--border-color)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  🔒 Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Back */}
        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>All credit packs are one-time purchases. Credits never expire. Questions?{' '}
            <a href="mailto:support@brandybot.com" className="text-purple-400 hover:underline">Contact Support</a>
          </p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm text-purple-400 hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
