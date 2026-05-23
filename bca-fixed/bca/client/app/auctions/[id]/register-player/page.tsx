'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { fmt, roleColors, categoryColors, roleIcons } from '@/lib/utils';
import { imgUrl } from '@/lib/api';
import toast from 'react-hot-toast';

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export default function RegisterPlayerPage() {
  const { id } = useParams<{ id: string }>();

  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredPlayer, setRegisteredPlayer] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    role: 'Batsman',
    category: 'Gold',
    nationality: 'Indian',
    age: '',
    basePrice: '1000000',
    matches: '0',
    runs: '0',
    wickets: '0',
    average: '0',
    strikeRate: '0',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const LBL = 'block text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1.5';
  const INP = 'input-beast';

  // ── Load auction info ──────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`${BASE}/api/auctions/${id}/register-player`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAuction(data.auction);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Validate ───────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    const price = parseInt(form.basePrice);
    if (!price || price <= 0) e.basePrice = 'Base price must be greater than 0';
    if (photo && photo.size > 5 * 1024 * 1024) e.photo = 'Photo must be under 5MB';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('image', photo);

      const res = await fetch(`${BASE}/api/auctions/${id}/register-player`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setRegisteredPlayer(data.player);
      setSuccess(true);
      toast.success('🏏 Registered successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset for another registration ────────────────────────────
  const handleRegisterAnother = () => {
    setSuccess(false);
    setRegisteredPlayer(null);
    setForm({
      name: '',
      role: 'Batsman',
      category: 'Gold',
      nationality: 'Indian',
      age: '',
      basePrice: '1000000',
      matches: '0',
      runs: '0',
      wickets: '0',
      average: '0',
      strikeRate: '0',
    });
    setPhoto(null);
    setPhotoPreview('');
    setErrors({});
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏏</div>
          <div className="font-heading text-lg uppercase tracking-wider text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-2">Auction Not Found</h1>
          <p className="font-display text-muted-foreground text-sm mb-6">This registration link is invalid or the auction no longer exists.</p>
          <Link href="/" className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-xs glow-gold">Go Home</Link>
        </div>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────
  if (success && registeredPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/bg-auction.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-sm"
        >
          <div className="bg-glass-premium rounded-2xl overflow-hidden border-gold-subtle gold-edge text-center">
            <div className="h-1" style={{ background: 'linear-gradient(90deg,hsl(45 100% 51%),hsl(40 100% 38%))' }} />
            <div className="p-8">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="font-heading text-2xl uppercase tracking-[0.12em] text-gradient-gold mb-1">Registered!</h2>
              <p className="font-display text-muted-foreground text-sm mb-6">You've been added to <span className="text-foreground font-semibold">{auction?.name}</span></p>

              {/* Player preview card */}
              <div className="bg-glass-navy rounded-xl overflow-hidden border-gold-subtle mb-6 text-left">
                <div className="relative overflow-hidden" style={{ height: 160, background: 'hsl(222 40% 10%)' }}>
                  {registeredPlayer.imageUrl ? (
                    <img
                      src={imgUrl(registeredPlayer.imageUrl)}
                      alt={registeredPlayer.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {roleIcons?.[registeredPlayer.role] || '🏏'}
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.85),transparent 50%)' }} />
                  <div className="absolute bottom-2 left-3 right-3">
                    <div className="text-white font-heading text-lg uppercase tracking-wider truncate">{registeredPlayer.name}</div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-heading uppercase ${roleColors?.[registeredPlayer.role] || 'border-muted text-muted-foreground'}`}>{registeredPlayer.role}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-heading uppercase ${categoryColors?.[registeredPlayer.category] || 'border-muted text-muted-foreground'}`}>{registeredPlayer.category}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded border font-heading uppercase border-muted text-muted-foreground">{registeredPlayer.nationality}</span>
                  </div>
                  <div className="text-gradient-gold font-heading font-bold text-base">Base: {fmt(registeredPlayer.basePrice)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleRegisterAnother}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-xs glow-gold hover:scale-[1.02] transition-all"
                >
                  + Register Another Player
                </button>
                <p className="text-[10px] text-muted-foreground font-display">The organizer will be notified instantly</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/bg-auction.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg,hsl(222 47% 6% / 0.5) 0%,hsl(222 47% 5% / 0.7) 100%)' }} />

      <div className="relative max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/beast-logo.png" alt="Beast Cricket" className="w-12 h-12 object-contain mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 10px hsla(45,100%,51%,0.5))' }} />
          </Link>
          <h1 className="font-heading text-3xl uppercase tracking-[0.12em] text-foreground">
            Player <span className="text-gradient-gold">Registration</span>
          </h1>
          {auction && (
            <p className="font-display text-muted-foreground text-sm mt-1">
              Registering for <span className="text-foreground font-semibold">{auction.name}</span>
            </p>
          )}
        </div>

        {/* Form */}
        <div className="bg-glass-premium rounded-2xl p-6 gold-edge border-gold-subtle">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className={LBL}>Player Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={`${INP} ${errors.name ? 'border-red-500/50' : ''}`}
                placeholder="Enter your full name"
                required
              />
              {errors.name && <p className="text-red-400 text-[10px] mt-1 font-display">{errors.name}</p>}
            </div>

            {/* Role + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LBL}>Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className={INP}
                  style={{ background: 'hsl(222 30% 16%)' }}
                >
                  {['Batsman', 'Bowler', 'AllRounder', 'WicketKeeper', 'Other'].map(r => (
                    <option key={r} value={r} style={{ background: 'hsl(222 30% 16%)' }}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className={INP}
                  style={{ background: 'hsl(222 30% 16%)' }}
                >
                  {['Elite', 'Gold', 'Silver', 'Emerging'].map(c => (
                    <option key={c} value={c} style={{ background: 'hsl(222 30% 16%)' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nationality + Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LBL}>Nationality</label>
                <input
                  value={form.nationality}
                  onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))}
                  className={INP}
                  placeholder="Indian"
                />
              </div>
              <div>
                <label className={LBL}>Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                  className={INP}
                  placeholder="24"
                  min="10"
                  max="60"
                />
              </div>
            </div>

            {/* Base Price */}
            <div>
              <label className={LBL}>Base Price (₹) *</label>
              <input
                type="number"
                value={form.basePrice}
                onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                className={`${INP} ${errors.basePrice ? 'border-red-500/50' : ''}`}
                placeholder="1000000"
                min="1"
                required
              />
              {errors.basePrice && <p className="text-red-400 text-[10px] mt-1 font-display">{errors.basePrice}</p>}
              {form.basePrice && parseInt(form.basePrice) > 0 && (
                <p className="text-primary text-[10px] mt-1 font-display">{fmt(parseInt(form.basePrice))}</p>
              )}
            </div>

            {/* Stats */}
            <div>
              <div className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-2">Stats (optional)</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'matches', label: 'Matches' },
                  { key: 'runs', label: 'Runs' },
                  { key: 'wickets', label: 'Wickets' },
                  { key: 'average', label: 'Average' },
                  { key: 'strikeRate', label: 'Strike Rate' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={LBL}>{label}</label>
                    <input
                      type="number"
                      step={key === 'average' || key === 'strikeRate' ? '0.01' : '1'}
                      value={(form as any)[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className={INP}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Photo */}
            <div>
              <label className={LBL}>Photo (optional, max 5MB)</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 5 * 1024 * 1024) {
                    setErrors(p => ({ ...p, photo: 'Photo must be under 5MB' }));
                    return;
                  }
                  setPhoto(file);
                  setErrors(p => { const n = { ...p }; delete n.photo; return n; });
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setPhotoPreview('');
                  }
                }}
                className="w-full text-muted-foreground text-xs file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-heading file:text-xs cursor-pointer hover:file:bg-primary/20"
              />
              {errors.photo && <p className="text-red-400 text-[10px] mt-1 font-display">{errors.photo}</p>}
              <AnimatePresence>
                {photoPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex items-center gap-3"
                  >
                    <div className="rounded-xl overflow-hidden border border-primary/20 flex-shrink-0" style={{ width: 80, height: 80 }}>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-display text-foreground">{photo?.name}</div>
                      <div className="text-[10px] text-muted-foreground font-display">{photo ? (photo.size / 1024).toFixed(1) + ' KB' : ''}</div>
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                        className="text-[10px] text-red-400 font-heading uppercase tracking-wider mt-1 hover:text-red-300 transition-colors"
                      >✕ Remove</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm glow-gold hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Registering…
                </span>
              ) : '+ Add Player'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground font-display mt-4">
          No account required · Your details will be reviewed by the organizer
        </p>
      </div>
    </div>
  );
}
