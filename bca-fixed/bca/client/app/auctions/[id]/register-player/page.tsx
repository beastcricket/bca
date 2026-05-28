'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PlayerRegistration() {
  const params = useParams();
  const auctionId = params?.id as string;
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredPlayer, setRegisteredPlayer] = useState<any>(null);
  const [pImg, setPImg] = useState<File | null>(null);
  const [pImgPreview, setPImgPreview] = useState<string>('');

  const [form, setForm] = useState({
    name: '',
    role: 'Batsman',
    category: 'Gold',
    nationality: 'Indian',
    age: '24',
    basePrice: '1000000',
    matches: '0',
    runs: '0',
    wickets: '0',
    average: '0',
    strikeRate: '0',
  });

  useEffect(() => {
    if (auctionId) {
      fetchAuction();
    }
  }, [auctionId]);

  const fetchAuction = async () => {
    try {
      const r = await api.get(`/auctions/${auctionId}`);
      setAuction(r.data.auction);
    } catch (err: any) {
      console.error('Failed to load auction:', err);
      toast.error('Failed to load auction details');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setPImg(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPImgPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error('Player name is required');
      return;
    }
    if (!form.basePrice || parseInt(form.basePrice) <= 0) {
      toast.error('Base price must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (pImg) fd.append('image', pImg);

      const r = await api.post(`/auctions/${auctionId}/players/public-register`, fd);
      
      setRegisteredPlayer(r.data.player);
      setSuccess(true);
      toast.success('🏏 Player registered successfully!');
      
      setForm({
        name: '',
        role: 'Batsman',
        category: 'Gold',
        nationality: 'Indian',
        age: '24',
        basePrice: '1000000',
        matches: '0',
        runs: '0',
        wickets: '0',
        average: '0',
        strikeRate: '0',
      });
      setPImg(null);
      setPImgPreview('');
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.error || 'Failed to register player');
    } finally {
      setLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    'Batsman': 'border-blue-500/40 bg-blue-500/20 text-blue-400',
    'Bowler': 'border-red-500/40 bg-red-500/20 text-red-400',
    'AllRounder': 'border-purple-500/40 bg-purple-500/20 text-purple-400',
    'WicketKeeper': 'border-green-500/40 bg-green-500/20 text-green-400',
    'Other': 'border-yellow-500/40 bg-yellow-500/20 text-yellow-400',
  };

  const categoryColors: Record<string, string> = {
    'Elite': 'border-amber-500/40 bg-amber-500/20 text-amber-400',
    'Gold': 'border-yellow-500/40 bg-yellow-500/20 text-yellow-300',
    'Silver': 'border-gray-400/40 bg-gray-400/20 text-gray-300',
    'Emerging': 'border-green-500/40 bg-green-500/20 text-green-400',
  };

  const INP = "w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all";
  const LBL = "block text-sm font-medium text-gray-300 mb-2";

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{ backgroundImage: "url('/pattern.png')", backgroundSize: 'cover' }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.05) 0%, transparent 70%)' }} />

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 pt-4 sm:pt-8">
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <div className="text-4xl">🏏</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Beast <span className="text-yellow-400">Cricket</span></h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">Auction: {auction.name}</p>
        </motion.div>

        {/* Success Screen */}
        {success && registeredPlayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-6 sm:p-8 mb-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Player Registered!</h2>
              <p className="text-gray-400">🎉 Congratulations! Your registration is complete.</p>
            </div>

            {/* Player Preview Card */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl p-6 mb-8 border border-yellow-500/20">
              <div className="flex items-start gap-6 flex-col sm:flex-row">
                {pImgPreview ? (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-yellow-500/30 flex-shrink-0">
                    <img src={pImgPreview} alt={registeredPlayer.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-700/50 flex items-center justify-center text-4xl border border-yellow-500/20 flex-shrink-0">
                    🏏
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{registeredPlayer.name}</h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${roleColors[registeredPlayer.role] || 'border-gray-600 bg-gray-700 text-gray-300'}`}>
                      {registeredPlayer.role}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${categoryColors[registeredPlayer.category] || 'border-gray-600 bg-gray-700 text-gray-300'}`}>
                      {registeredPlayer.category}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full border border-gray-600 bg-gray-700 text-gray-300 font-semibold">
                      {registeredPlayer.nationality}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    ₹{parseInt(registeredPlayer.basePrice).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={() => {
                  setSuccess(false);
                  setRegisteredPlayer(null);
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition-all active:scale-95"
              >
                + Register Another Player
              </button>
              <Link
                href={`/auctions/${auctionId}`}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-yellow-500 text-yellow-400 font-semibold text-center hover:bg-yellow-500/10 transition-all"
              >
                👁️ View Auction
              </Link>
            </div>
          </motion.div>
        )}

        {/* Registration Form */}
        {!success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-6 sm:p-8 shadow-2xl"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">🏏 Player Registration</h2>
            <p className="text-gray-400 text-sm mb-6">Fill in your details to register for {auction.name}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Player Name */}
              <div>
                <label className={LBL}>Player Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter player name"
                  className={INP}
                  required
                />
              </div>

              {/* Role & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LBL}>Role *</label>
                  <select name="role" value={form.role} onChange={handleInputChange} className={INP}>
                    {['Batsman', 'Bowler', 'AllRounder', 'WicketKeeper', 'Other'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LBL}>Category *</label>
                  <select name="category" value={form.category} onChange={handleInputChange} className={INP}>
                    {['Elite', 'Gold', 'Silver', 'Emerging'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nationality, Age, Base Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={LBL}>Nationality</label>
                  <input type="text" name="nationality" value={form.nationality} onChange={handleInputChange} placeholder="Indian" className={INP} />
                </div>
                <div>
                  <label className={LBL}>Age</label>
                  <input type="number" name="age" value={form.age} onChange={handleInputChange} className={INP} />
                </div>
                <div>
                  <label className={LBL}>Base Price (₹) *</label>
                  <input type="number" name="basePrice" value={form.basePrice} onChange={handleInputChange} placeholder="1000000" className={INP} required />
                </div>
              </div>

              {/* Career Statistics */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Career Statistics (Optional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'matches', label: 'Matches' },
                    { key: 'runs', label: 'Runs' },
                    { key: 'wickets', label: 'Wickets' },
                    { key: 'average', label: 'Average' },
                    { key: 'strikeRate', label: 'Strike Rate' },
                  ].map(stat => (
                    <div key={stat.key}>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">{stat.label}</label>
                      <input
                        type="number"
                        step={stat.key === 'average' || stat.key === 'strikeRate' ? '0.01' : '1'}
                        name={stat.key}
                        value={form[stat.key as keyof typeof form]}
                        onChange={handleInputChange}
                        className={INP + ' text-sm'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className={LBL}>Player Photo (Optional · Max 5MB)</label>
                <div className="border-2 border-dashed border-yellow-500/30 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="photo-input"
                  />
                  <label htmlFor="photo-input" className="cursor-pointer block">
                    {pImgPreview ? (
                      <div>
                        <div className="text-sm text-yellow-400 font-semibold mb-3">✅ Photo selected</div>
                        <div className="relative w-20 h-20 mx-auto rounded-lg overflow-hidden border border-yellow-500/30 mb-3">
                          <img src={pImgPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs text-gray-400">Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📸</div>
                        <div className="text-sm text-gray-400">Click to upload or drag and drop</div>
                        <div className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (Max 5MB)</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3 rounded-lg bg-yellow-500 text-gray-900 font-bold hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-6 text-lg"
              >
                {loading ? '⏳ Registering...' : '+ Add Player'}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Questions? Contact the organizer
              </p>
              <Link href="/auctions" className="text-yellow-400 hover:text-yellow-300 text-xs mt-2 inline-block">
                ← Back to Auctions
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
