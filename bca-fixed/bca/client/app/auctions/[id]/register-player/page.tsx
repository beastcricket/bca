'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api, { imgUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BeastLogo from '@/components/beast/BeastLogo';
import GoldParticles from '@/components/beast/GoldParticles';
import { fmt, roleColors, categoryColors, roleIcons } from '@/lib/utils';

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
    if (auctionId) fetchAuction();
  }, [auctionId]);

  const fetchAuction = async () => {
    try {
      const r = await api.get(`/auctions/${auctionId}`);
      setAuction(r.data.auction);
    } catch {
      toast.error('Failed to load auction details');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setPImg(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPImgPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
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
      toast.error(err.response?.data?.error || 'Failed to register player');
    } finally {
      setLoading(false);
    }
  };

  const INP = 'input-beast';
  const LBL = 'block text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1.5';

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-5xl">⏳</motion.div>
      </div>
    );
  }

  const playerPhoto = registeredPlayer?.imageUrl ? imgUrl(registeredPlayer.imageUrl) : pImgPreview;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <GoldParticles />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/bg-organizer.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg,hsl(222 47% 6% / 0.5) 0%,hsl(222 47% 5% / 0.85) 100%)' }} />

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BeastLogo size={72} glow float3d href="/" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-[0.12em] text-foreground">
            Player <span className="text-gradient-gold">Registration</span>
          </h1>
          <p className="font-display text-muted-foreground text-sm mt-2">{auction.name}</p>
        </motion.div>

        {success && registeredPlayer && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-glass-premium rounded-xl p-6 sm:p-8 gold-edge border-gold-subtle mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground">Registered!</h2>
              <p className="text-muted-foreground text-sm font-display mt-1">Your details were sent to the organizer.</p>
            </div>
            <div className="flex items-start gap-5 flex-col sm:flex-row bg-secondary/20 rounded-xl p-5 border border-primary/20">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-primary/30 flex-shrink-0 bg-secondary/40">
                {playerPhoto ? (
                  <img src={playerPhoto} alt={registeredPlayer.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">{roleIcons?.[registeredPlayer.role] || '🏏'}</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-xl uppercase tracking-wider text-foreground mb-2">{registeredPlayer.name}</h3>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-heading uppercase ${roleColors?.[registeredPlayer.role] || ''}`}>{registeredPlayer.role}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-heading uppercase ${categoryColors?.[registeredPlayer.category] || ''}`}>{registeredPlayer.category}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded border border-muted text-muted-foreground font-heading uppercase">{registeredPlayer.nationality}</span>
                </div>
                <div className="text-gradient-gold font-heading font-bold text-lg">{fmt(registeredPlayer.basePrice)}</div>
              </div>
            </div>
            <div className="flex gap-3 flex-col sm:flex-row mt-6">
              <button
                type="button"
                onClick={() => { setSuccess(false); setRegisteredPlayer(null); }}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-xs glow-gold hover:scale-[1.02] transition-all"
              >
                + Register Another
              </button>
              <Link href={`/auctions/${auctionId}`} className="flex-1 px-6 py-3 rounded-lg border border-primary/30 text-primary font-heading uppercase tracking-wider text-xs text-center hover:bg-primary/10 transition-all">
                View Auction
              </Link>
            </div>
          </motion.div>
        )}

        {!success && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-glass-premium rounded-xl p-6 sm:p-8 gold-edge border-gold-subtle">
            <h2 className="font-heading text-xl uppercase tracking-wider text-foreground mb-1">🏏 Register as Player</h2>
            <p className="text-muted-foreground text-sm font-display mb-6">Fill in all details below</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={LBL}>Player Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Player name" className={INP} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LBL}>Role *</label>
                  <select name="role" value={form.role} onChange={handleInputChange} className={INP} style={{ background: 'hsl(222 30% 16%)' }}>
                    {['Batsman', 'Bowler', 'AllRounder', 'WicketKeeper', 'Other'].map(r => (
                      <option key={r} value={r} style={{ background: 'hsl(222 30% 16%)' }}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LBL}>Category *</label>
                  <select name="category" value={form.category} onChange={handleInputChange} className={INP} style={{ background: 'hsl(222 30% 16%)' }}>
                    {['Elite', 'Gold', 'Silver', 'Emerging'].map(c => (
                      <option key={c} value={c} style={{ background: 'hsl(222 30% 16%)' }}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={LBL}>Nationality</label>
                  <input type="text" name="nationality" value={form.nationality} onChange={handleInputChange} className={INP} placeholder="Indian" />
                </div>
                <div>
                  <label className={LBL}>Age</label>
                  <input type="number" name="age" value={form.age} onChange={handleInputChange} className={INP} />
                </div>
                <div>
                  <label className={LBL}>Base Price (₹) *</label>
                  <input type="number" name="basePrice" value={form.basePrice} onChange={handleInputChange} className={INP} required />
                </div>
              </div>

              <div>
                <label className={LBL}>Career Statistics (optional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'matches', label: 'Matches' },
                    { key: 'runs', label: 'Runs' },
                    { key: 'wickets', label: 'Wickets' },
                    { key: 'average', label: 'Average' },
                    { key: 'strikeRate', label: 'Strike Rate' },
                  ].map(stat => (
                    <div key={stat.key}>
                      <label className="text-[9px] text-muted-foreground font-heading uppercase mb-1 block">{stat.label}</label>
                      <input
                        type="number"
                        step={stat.key === 'average' || stat.key === 'strikeRate' ? '0.01' : '1'}
                        name={stat.key}
                        value={form[stat.key as keyof typeof form]}
                        onChange={handleInputChange}
                        className={INP}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={LBL}>Photo (optional · max 5MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-muted-foreground text-xs file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-heading file:text-xs cursor-pointer hover:file:bg-primary/20"
                />
                {pImgPreview && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-primary/20" style={{ width: 96, height: 96 }}>
                    <img src={pImgPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm glow-gold hover:scale-[1.02] transition-all disabled:opacity-50 mt-2"
              >
                {loading ? '⏳ Registering...' : '+ Add Player'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
