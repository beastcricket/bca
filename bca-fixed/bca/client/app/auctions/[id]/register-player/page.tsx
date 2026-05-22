'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { fmt, roleColors, categoryColors, roleIcons } from '@/lib/utils';
import { imgUrl } from '@/lib/api';

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const LBL = 'block text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1.5';
const INP = 'input-beast';

const ROLES = ['Batsman', 'Bowler', 'AllRounder', 'WicketKeeper', 'Other'];
const CATEGORIES = ['Elite', 'Gold', 'Silver', 'Emerging'];

interface FormState {
  name: string;
  role: string;
  category: string;
  nationality: string;
  age: string;
  basePrice: string;
  matches: string;
  runs: string;
  wickets: string;
  average: string;
  strikeRate: string;
}

const defaultForm: FormState = {
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
};

export default function RegisterPlayerPage() {
  const { id } = useParams<{ id: string }>();

  const [auction, setAuction] = useState<any>(null);
  const [loadingAuction, setLoadingAuction] = useState(true);
  const [auctionError, setAuctionError] = useState('');

  const [form, setForm] = useState<FormState>(defaultForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [registeredPlayer, setRegisteredPlayer] = useState<any>(null);

  // Load auction info on mount
  useEffect(() => {
    if (!id) return;
    setLoadingAuction(true);
    fetch(`${BASE}/api/auctions/${id}/register-player`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAuction(data.auction);
        } else {
          setAuctionError(data.error || 'Auction not found');
        }
      })
      .catch(() => setAuctionError('Failed to load auction. Please check the link and try again.'))
      .finally(() => setLoadingAuction(false));
  }, [id]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Photo must be under 5MB');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = ev => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhoto(null);
      setPhotoPreview('');
    }
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Client-side validation
    if (!form.name.trim() || form.name.trim().length < 2) {
      setSubmitError('Player name must be at least 2 characters');
      return;
    }
    if (!form.basePrice || parseInt(form.basePrice) <= 0) {
      setSubmitError('Base price must be greater than 0');
      return;
    }

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

      if (data.success) {
        setRegisteredPlayer(data.player);
      } else {
        setSubmitError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setRegisteredPlayer(null);
    setForm(defaultForm);
    setPhoto(null);
    setPhotoPreview('');
    setSubmitError('');
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingAuction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏏</div>
          <p className="font-heading text-muted-foreground uppercase tracking-wider text-sm">Loading auction…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (auctionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-3">Link Invalid</h2>
          <p className="font-display text-muted-foreground text-sm mb-6">{auctionError}</p>
          <Link href="/" className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-xs">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (registeredPlayer) {
    const p = registeredPlayer;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/bg-organizer.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-sm w-full"
        >
          {/* Success card */}
          <div className="bg-glass-premium rounded-2xl overflow-hidden border-gold-subtle gold-edge text-center">
            <div className="h-1" style={{ background: 'linear-gradient(90deg,hsl(45 100% 51%),hsl(40 100% 38%))' }} />

            {/* Player photo */}
            <div className="relative mx-auto mt-8 mb-4" style={{ width: 120, height: 120 }}>
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary/40" style={{ background: 'hsl(222 40% 10%)' }}>
                {p.imageUrl ? (
                  <img
                    src={imgUrl(p.imageUrl)}
                    alt={p.name}
                    className="w-full h-full object-cover object-top"
                    onError={e => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex'); }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center text-5xl"
                  style={{ display: p.imageUrl ? 'none' : 'flex' }}
                >
                  {roleIcons[p.role] || '🏏'}
                </div>
              </div>
              {/* Green checkmark badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold border-2 border-background">
                ✓
              </div>
            </div>

            <div className="px-6 pb-8">
              <div className="text-green-400 font-heading text-xs uppercase tracking-widest mb-1">Registered Successfully!</div>
              <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-1">{p.name}</h2>
              <p className="font-display text-muted-foreground text-xs mb-4">{auction?.name}</p>

              <div className="flex gap-2 justify-center mb-4">
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-heading uppercase ${roleColors[p.role] || 'border-muted text-muted-foreground'}`}>
                  {p.role}
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-heading uppercase ${categoryColors[p.category] || 'border-muted text-muted-foreground'}`}>
                  {p.category}
                </span>
              </div>

              <div className="rounded-lg px-4 py-3 mb-6" style={{ background: 'hsla(45,100%,51%,0.08)', border: '1px solid hsla(45,100%,51%,0.2)' }}>
                <div className="text-primary text-[9px] font-heading uppercase tracking-widest mb-0.5">Base Price</div>
                <div className="text-gradient-gold font-heading font-bold text-xl">{fmt(p.basePrice)}</div>
              </div>

              <p className="font-display text-muted-foreground text-xs mb-6">
                🎉 Your registration has been submitted! The organizer will see you in the auction dashboard.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRegisterAnother}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-xs glow-gold hover:scale-[1.02] transition-all"
                >
                  + Register Another Player
                </button>
                <Link
                  href="/"
                  className="w-full py-3 rounded-lg border border-primary/30 text-primary font-heading uppercase tracking-wider text-xs text-center hover:bg-primary/10 transition-all"
                >
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/bg-organizer.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
      <div className="relative max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/beast-logo.png" alt="Beast Cricket" className="w-14 h-14 object-contain mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 12px hsla(45,100%,51%,0.5))' }} />
          </Link>
          <h1 className="font-heading text-3xl uppercase tracking-[0.12em] text-foreground mb-1">
            Player <span className="text-gradient-gold">Registration</span>
          </h1>
          <p className="font-display text-muted-foreground text-sm">
            {auction?.name}
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass-premium rounded-2xl p-6 md:p-8 gold-edge border-gold-subtle"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">

              {/* Name */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className={LBL}>Player Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={INP}
                  placeholder="e.g. Virat Kohli"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              {/* Role */}
              <div>
                <label className={LBL}>Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className={INP}
                  style={{ background: 'hsl(222 30% 16%)' }}
                  required
                >
                  {ROLES.map(r => (
                    <option key={r} value={r} style={{ background: 'hsl(222 30% 16%)' }}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className={LBL}>Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className={INP}
                  style={{ background: 'hsl(222 30% 16%)' }}
                  required
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} style={{ background: 'hsl(222 30% 16%)' }}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Nationality */}
              <div>
                <label className={LBL}>Nationality</label>
                <input
                  value={form.nationality}
                  onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))}
                  className={INP}
                  placeholder="Indian"
                />
              </div>

              {/* Age */}
              <div>
                <label className={LBL}>Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                  className={INP}
                  placeholder="24"
                  min="1"
                  max="100"
                />
              </div>

              {/* Base Price */}
              <div>
                <label className={LBL}>Base Price (₹) *</label>
                <input
                  type="number"
                  value={form.basePrice}
                  onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                  className={INP}
                  placeholder="1000000"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Career Stats */}
            <div className="mb-6">
              <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <span>Career Stats</span>
                <span className="text-[9px] opacity-60">(optional)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div>
                  <label className={LBL}>Matches</label>
                  <input type="number" value={form.matches} onChange={e => setForm(p => ({ ...p, matches: e.target.value }))} className={INP} min="0" />
                </div>
                <div>
                  <label className={LBL}>Runs</label>
                  <input type="number" value={form.runs} onChange={e => setForm(p => ({ ...p, runs: e.target.value }))} className={INP} min="0" />
                </div>
                <div>
                  <label className={LBL}>Wickets</label>
                  <input type="number" value={form.wickets} onChange={e => setForm(p => ({ ...p, wickets: e.target.value }))} className={INP} min="0" />
                </div>
                <div>
                  <label className={LBL}>Average</label>
                  <input type="number" step="0.01" value={form.average} onChange={e => setForm(p => ({ ...p, average: e.target.value }))} className={INP} min="0" />
                </div>
                <div>
                  <label className={LBL}>Strike Rate</label>
                  <input type="number" step="0.01" value={form.strikeRate} onChange={e => setForm(p => ({ ...p, strikeRate: e.target.value }))} className={INP} min="0" />
                </div>
              </div>
            </div>

            {/* Photo upload */}
            <div className="mb-6">
              <label className={LBL}>Photo <span className="opacity-60">(optional, max 5MB)</span></label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="w-full text-muted-foreground text-xs file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-heading file:text-xs cursor-pointer hover:file:bg-primary/20"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5">Accepted: JPG, PNG, WebP</p>
                </div>
                <AnimatePresence>
                  {photoPreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex-shrink-0 rounded-xl overflow-hidden border border-primary/30"
                      style={{ width: 80, height: 80 }}
                    >
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover object-top" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="rounded-lg px-4 py-3 text-sm font-display text-red-400" style={{ background: 'hsla(0,84%,60%,0.1)', border: '1px solid hsla(0,84%,60%,0.3)' }}>
                    ⚠️ {submitError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm glow-gold hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Registering…
                </span>
              ) : (
                '+ Add Player'
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-[10px] text-muted-foreground font-display mt-6">
          Powered by <span className="text-gradient-gold font-heading">Beast Cricket Auction</span>
        </p>
      </div>
    </div>
  );
}
