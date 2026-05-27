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

  const INP = "input-beast";
  const LBL = "block text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1.5";

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 6%)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(222 47% 6%)' }}>
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "url('/bg-organizer.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg,hsl(222 47% 6% / 0.4) 0%,hsl(222 47% 5% / 0.6) 100%)' }} />

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/beast-logo.png" alt="Beast" className="w-10 h-10 object-contain" style={{ filter: 'drop-shadow(0 0 8px hsla(45,100%,51%,0.5))' }} />
            <h1 className="font-heading text-4xl uppercase tracking-[0.12em] text-foreground">Beast <span className="text-gradient-gold">Cricket</span></h1>
          </div>
          <p className="font-display text-muted-foreground text-sm">🏏 {auction.name}</p>
        </motion.div>

        {/* Success Screen */}
        {success && registeredPlayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-glass-premium rounded-xl p-8 gold-edge border-gold-subtle mb-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-2">Player Registered!</h2>
              <p className="font-display text-muted-foreground">🎉 Congratulations! Your registration is complete.</p>
            </div>

            {/* Player Preview Card */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 mb-8 border border-primary/20">
              <div className="flex items-start gap-6">
                {pImgPreview ? (
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-primary/30">
                    <img src={pImgPreview} alt={registeredPlayer.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-secondary/50 flex items-center justify-center text-3xl border border-primary/20">
                    🏏
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-heading text-xl uppercase tracking-wider text-foreground mb-3">{registeredPlayer.name}</h3>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-heading uppercase ${roleColors[registeredPlayer.role] || ''}`}>
                      {registeredPlayer.role}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-heading uppercase ${categoryColors[registeredPlayer.category] || ''}`}>
                      {registeredPlayer.category}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded border border-muted text-muted-foreground font-heading uppercase">
                      {registeredPlayer.nationality}
                    </span>
                  </div>
                  <div className="text-gradient-gold font-heading font-bold text-lg">
                    ₹{parseInt(registeredPlayer.basePrice).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setRegisteredPlayer(null);
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm glow-gold hover:scale-[1.02] transition-all"
              >
                + Register Another Player
              </button>
              <Link
                href={`/auctions/${auctionId}`}
                className="flex-1 px-6 py-3 rounded-lg border border-primary/30 text-primary font-heading uppercase tracking-wider text-sm text-center hover:bg-primary/10 transition-all"
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
            className="bg-glass-premium rounded-xl p-8 gold-edge border-gold-subtle"
          >
            <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-2">🏏 Player Registration</h2>
            <p className="font-display text-muted-foreground text-sm mb-6">Fill in your details to register for {auction.name}</p>

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LBL}>Role *</label>
                  <select name="role" value={form.role} onChange={handleInputChange} className={INP} style={{ background: 'hsl(222 30% 16%)' }}>
                    {['Batsman', 'Bowler', 'AllRounder', 'WicketKeeper', 'Other'].map(r => (
                      <option key={r} value={r} style={{ background: 'hsl(222 30% 16%)' }}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LBL}>Category *</label>
                  <select name="category" value={form.category} onChange={handleInputChange} className={INP} style={{ background: 'hsl(222 30% 16%)' }}>
                    {['Elite', 'Gold', 'Silver', 'Emerging'].map(c => (
                      <option key={c} value={c} style={{ background: 'hsl(222 30% 16%)' }}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nationality, Age, Base Price Row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LBL}>Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={form.nationality}
                    onChange={handleInputChange}
                    placeholder="Indian"
                    className={INP}
                  />
                </div>
                <div>
                  <label className={LBL}>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleInputChange}
                    className={INP}
                  />
                </div>
                <div>
                  <label className={LBL}>Base Price (₹) *</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={form.basePrice}
                    onChange={handleInputChange}
                    placeholder="1000000"
                    className={INP}
                    required
                  />
                </div>
              </div>

              {/* Career Statistics */}
              <div>
                <label className="block text-[11px] font-heading uppercase tracking-wider text-muted-foreground mb-2.5">Career Statistics (Optional)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: 'matches', label: 'Matches', value: form.matches },
                    { key: 'runs', label: 'Runs', value: form.runs },
                    { key: 'wickets', label: 'Wickets', value: form.wickets },
                    { key: 'average', label: 'Average', value: form.average },
                    { key: 'strikeRate', label: 'Strike Rate', value: form.strikeRate },
                  ].map(stat => (
                    <div key={stat.key}>
                      <label className="text-[9px] text-muted-foreground font-heading uppercase mb-1 block">{stat.label}</label>
                      <input
                        type="number"
                        step={stat.key === 'average' || stat.key === 'strikeRate' ? '0.01' : '1'}
                        name={stat.key}
                        value={stat.value}
                        onChange={handleInputChange}
                        className={INP + ' text-xs'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className={LBL}>Player Photo (Optional · Max 5MB)</label>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="photo-input"
                  />
                  <label htmlFor="photo-input" className="cursor-pointer">
                    {pImgPreview ? (
                      <div>
                        <div className="text-sm font-display text-primary mb-3">✅ Photo selected</div>
                        <div className="relative w-20 h-20 mx-auto rounded-lg overflow-hidden border border-primary/30 mb-3">
                          <img src={pImgPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs font-display text-muted-foreground">Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl mb-2">📸</div>
                        <div className="text-sm font-display text-muted-foreground">Click to upload or drag and drop</div>
                        <div className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WebP (Max 5MB)</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm glow-gold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? '⏳ Registering...' : '+ Add Player'}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-primary/10">
              <p className="font-display text-xs text-muted-foreground">
                Questions? Contact the organizer
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}