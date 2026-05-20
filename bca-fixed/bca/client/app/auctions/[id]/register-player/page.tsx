'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const ROLES    = ['Batsman', 'Bowler', 'AllRounder', 'WicketKeeper', 'Other'];
const CATS     = ['Elite', 'Gold', 'Silver', 'Emerging'];
const ROLE_LABELS: Record<string, string> = {
  Batsman: 'Batsman', Bowler: 'Bowler', AllRounder: 'All-rounder',
  WicketKeeper: 'Wicket-keeper', Other: 'Other',
};
const CAT_LABELS: Record<string, string> = {
  Elite: 'Elite', Gold: 'Gold', Silver: 'Silver', Emerging: 'Emerging',
};

const INP = 'w-full px-4 py-2.5 rounded-lg text-sm font-display text-foreground placeholder-muted-foreground/50 border border-border/60 bg-[hsl(222_30%_14%)] focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all';
const LBL = 'block text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1.5';
const SEL = `${INP} cursor-pointer`;

interface FormState {
  name: string; role: string; category: string; nationality: string;
  age: string; basePrice: string; matches: string; runs: string;
  wickets: string; average: string; strikeRate: string;
}

const defaultForm: FormState = {
  name: '', role: 'Batsman', category: 'Gold', nationality: 'Indian',
  age: '', basePrice: '1000000', matches: '0', runs: '0',
  wickets: '0', average: '0', strikeRate: '0',
};

export default function RegisterPlayerPage() {
  const { id } = useParams<{ id: string }>();

  const [auction,     setAuction]     = useState<any>(null);
  const [auctionErr,  setAuctionErr]  = useState('');
  const [form,        setForm]        = useState<FormState>(defaultForm);
  const [photo,       setPhoto]       = useState<File | null>(null);
  const [photoPreview,setPhotoPreview]= useState('');
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');
  const [addAnother,  setAddAnother]  = useState(false);

  // Fetch auction info to confirm it exists
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/auctions/${id}/register-player`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setAuction(d.auction);
        else setAuctionErr(d.error || 'Auction not found');
      })
      .catch(() => setAuctionErr('Could not load auction details'));
  }, [id]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fd = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('image', photo);

      const res = await fetch(`${API_BASE}/api/auctions/${id}/register-player`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.');
      } else {
        setSuccess(true);
        setAddAnother(false);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setForm(defaultForm);
    setPhoto(null);
    setPhotoPreview('');
    setError('');
    setSuccess(false);
    setAddAnother(true);
  };

  // ── Auction not found ──────────────────────────────────────────────────────
  if (auctionErr) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 5%)' }}>
        <div className="text-center px-6">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-2">Auction Not Found</h2>
          <p className="text-muted-foreground font-display text-sm mb-6">{auctionErr}</p>
          <Link href="/auctions" className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-xs">
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading auction ────────────────────────────────────────────────────────
  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 5%)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-display text-sm">Loading auction...</p>
        </div>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success && !addAnother) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(222 47% 5%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-[hsl(222_40%_10%)] rounded-2xl p-10 border border-green-500/30"
            style={{ boxShadow: '0 0 60px hsla(142,70%,45%,0.15)' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="text-6xl mb-5"
            >
              ✅
            </motion.div>
            <h2 className="font-heading text-3xl uppercase tracking-wider text-foreground mb-2">
              Registered!
            </h2>
            <p className="text-muted-foreground font-display text-sm mb-1">
              You've been added to
            </p>
            <p className="text-primary font-heading text-lg uppercase tracking-wider mb-6">
              {auction.name}
            </p>
            <p className="text-muted-foreground/70 font-display text-xs mb-8">
              The organizer will review your registration. You'll be included in the auction pool.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddAnother}
                className="w-full py-3 rounded-xl font-heading uppercase tracking-wider text-sm text-primary-foreground"
                style={{ background: 'linear-gradient(135deg, hsl(45,100%,51%), hsl(40,100%,38%))' }}
              >
                + Register Another Player
              </button>
              <Link
                href={`/auctions/${id}`}
                className="w-full py-3 rounded-xl font-heading uppercase tracking-wider text-sm text-center text-muted-foreground border border-border/40 hover:text-foreground hover:border-border transition-all"
              >
                View Auction
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'hsl(222 47% 5%)' }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, hsla(45,100%,51%,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-2xl mx-auto relative">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/beast-logo.png" alt="Beast Cricket" className="w-12 h-12 object-contain mx-auto"
              style={{ filter: 'drop-shadow(0 0 12px hsla(45,100%,51%,0.5))' }} />
          </Link>
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-heading uppercase tracking-widest mb-3"
            style={{ background: 'hsla(45,100%,51%,0.1)', border: '1px solid hsla(45,100%,51%,0.3)', color: 'hsl(45 100% 51%)' }}>
            Player Registration
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-[0.12em] text-foreground mb-1">
            Join the <span style={{ color: 'hsl(45 100% 51%)' }}>Auction</span>
          </h1>
          <p className="text-muted-foreground font-display text-sm">
            {auction.name}
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: 'hsl(222 40% 10%)',
            border: '1px solid hsla(45,100%,51%,0.2)',
            boxShadow: '0 0 0 1px hsla(45,100%,51%,0.08), 0 24px 80px hsl(222 47% 3%)',
          }}
        >
          {/* Gold top edge */}
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(45,100%,51%), transparent)' }} />

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Row 1: Name ── */}
            <div>
              <label className={LBL}>Player Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={INP}
                placeholder="e.g. Virat Kohli"
                required
              />
            </div>

            {/* ── Row 2: Role + Category ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className={SEL}
                  style={{ background: 'hsl(222 30% 14%)' }}
                  required
                >
                  {ROLES.map(r => (
                    <option key={r} value={r} style={{ background: 'hsl(222 30% 14%)' }}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className={SEL}
                  style={{ background: 'hsl(222 30% 14%)' }}
                  required
                >
                  {CATS.map(c => (
                    <option key={c} value={c} style={{ background: 'hsl(222 30% 14%)' }}>
                      {CAT_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Row 3: Nationality + Age ── */}
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="0"
                  min="0"
                  max="60"
                />
              </div>
            </div>

            {/* ── Row 4: Base Price ── */}
            <div>
              <label className={LBL}>Base Price (₹) *</label>
              <input
                type="number"
                value={form.basePrice}
                onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                className={INP}
                placeholder="1000000"
                min="0"
                required
              />
              {form.basePrice && Number(form.basePrice) > 0 && (
                <p className="text-[10px] text-muted-foreground/60 mt-1 font-display">
                  ≈ ₹{Number(form.basePrice) >= 10000000
                    ? `${(Number(form.basePrice) / 10000000).toFixed(2)} Cr`
                    : Number(form.basePrice) >= 100000
                    ? `${(Number(form.basePrice) / 100000).toFixed(2)} L`
                    : Number(form.basePrice).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* ── Stats section ── */}
            <div>
              <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground/60 mb-3 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/40" />
                Career Statistics (optional)
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={LBL}>Matches</label>
                  <input type="number" value={form.matches} onChange={e => setForm(p => ({ ...p, matches: e.target.value }))} className={INP} placeholder="0" min="0" />
                </div>
                <div>
                  <label className={LBL}>Runs</label>
                  <input type="number" value={form.runs} onChange={e => setForm(p => ({ ...p, runs: e.target.value }))} className={INP} placeholder="0" min="0" />
                </div>
                <div>
                  <label className={LBL}>Wickets</label>
                  <input type="number" value={form.wickets} onChange={e => setForm(p => ({ ...p, wickets: e.target.value }))} className={INP} placeholder="0" min="0" />
                </div>
                <div>
                  <label className={LBL}>Average</label>
                  <input type="number" step="0.01" value={form.average} onChange={e => setForm(p => ({ ...p, average: e.target.value }))} className={INP} placeholder="0.00" min="0" />
                </div>
                <div>
                  <label className={LBL}>Strike Rate</label>
                  <input type="number" step="0.01" value={form.strikeRate} onChange={e => setForm(p => ({ ...p, strikeRate: e.target.value }))} className={INP} placeholder="0.00" min="0" />
                </div>
              </div>
            </div>

            {/* ── Photo upload ── */}
            <div>
              <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground/60 mb-3 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/40" />
                Player Photo (optional)
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div
                  className="flex-shrink-0 rounded-xl overflow-hidden border border-border/40 flex items-center justify-center"
                  style={{ width: 80, height: 96, background: 'hsl(222 35% 12%)' }}
                >
                  {photoPreview
                    ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover object-top" />
                    : <span className="text-3xl">📷</span>
                  }
                </div>
                <div className="flex-1">
                  <label className="block w-full cursor-pointer">
                    <div className="px-4 py-3 rounded-xl border border-dashed border-border/60 hover:border-primary/40 transition-all text-center"
                      style={{ background: 'hsla(222,30%,12%,0.5)' }}>
                      <div className="text-muted-foreground text-xs font-display mb-1">
                        {photo ? photo.name : 'Click to upload photo'}
                      </div>
                      <div className="text-muted-foreground/50 text-[10px] font-display">
                        JPG, PNG, WebP · Max 5MB
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhoto}
                      className="hidden"
                    />
                  </label>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                      className="mt-2 text-[10px] text-muted-foreground/60 hover:text-destructive transition-colors font-display"
                    >
                      ✕ Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Error message ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 rounded-xl text-sm font-display text-red-400"
                    style={{ background: 'hsla(0,84%,60%,0.1)', border: '1px solid hsla(0,84%,60%,0.3)' }}>
                    ⚠️ {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-heading uppercase tracking-wider text-base text-black transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: loading
                  ? 'hsl(222 30% 22%)'
                  : 'linear-gradient(135deg, hsl(45,100%,51%), hsl(40,100%,38%))',
                color: loading ? 'hsl(222 15% 55%)' : '#000',
                boxShadow: loading ? 'none' : '0 0 30px hsla(45,100%,51%,0.3)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                '+ Add Player'
              )}
            </button>

          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-muted-foreground/40 text-xs font-display mt-6">
          Powered by Beast Cricket Auction · {auction.name}
        </p>
      </div>
    </div>
  );
}
