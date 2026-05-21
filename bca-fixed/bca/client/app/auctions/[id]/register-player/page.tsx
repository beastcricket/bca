'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fmt } from '@/lib/utils';
import { imgUrl } from '@/lib/api';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const ROLES = ['Batsman', 'Bowler', 'AllRounder', 'WicketKeeper', 'Other'] as const;
const CATEGORIES = ['Elite', 'Gold', 'Silver', 'Emerging'] as const;

const ROLE_LABELS: Record<string, string> = {
  Batsman: '🏏 Batsman',
  Bowler: '🎯 Bowler',
  AllRounder: '⭐ All-Rounder',
  WicketKeeper: '🧤 Wicket-Keeper',
  Other: '🏅 Other',
};

const CATEGORY_LABELS: Record<string, string> = {
  Elite: '👑 Elite',
  Gold: '🥇 Gold',
  Silver: '🥈 Silver',
  Emerging: '🌱 Emerging',
};

const INP =
  'w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-yellow-500/50 border border-white/10 focus:border-yellow-500/40';
const INP_BG = { background: 'hsl(222 35% 13%)' };
const LBL = 'block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5';

interface Auction {
  _id: string;
  name: string;
  description?: string;
  date?: string;
  status: string;
}

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
  matches: '',
  runs: '',
  wickets: '',
  average: '',
  strikeRate: '',
};

export default function RegisterPlayerPage() {
  const { id } = useParams<{ id: string }>();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [auctionError, setAuctionError] = useState('');
  const [auctionLoading, setAuctionLoading] = useState(true);

  const [form, setForm] = useState<FormState>(defaultForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successPlayer, setSuccessPlayer] = useState<any>(null);

  // Load auction info
  useEffect(() => {
    if (!id) return;
    setAuctionLoading(true);
    fetch(`${API_BASE}/api/auctions/${id}/register-player`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAuction(data.auction);
        } else {
          setAuctionError(data.error || 'Auction not found');
        }
      })
      .catch(() => setAuctionError('Failed to load auction. Please check the link.'))
      .finally(() => setAuctionLoading(false));
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
      fd.append('name', form.name.trim());
      fd.append('role', form.role);
      fd.append('category', form.category);
      fd.append('nationality', form.nationality || 'Indian');
      if (form.age) fd.append('age', form.age);
      fd.append('basePrice', form.basePrice);
      if (form.matches) fd.append('matches', form.matches);
      if (form.runs) fd.append('runs', form.runs);
      if (form.wickets) fd.append('wickets', form.wickets);
      if (form.average) fd.append('average', form.average);
      if (form.strikeRate) fd.append('strikeRate', form.strikeRate);
      if (photo) fd.append('image', photo);

      const res = await fetch(`${API_BASE}/api/auctions/${id}/register-player`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error || 'Registration failed. Please try again.');
        return;
      }
      setSuccessPlayer(data.player);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setSuccessPlayer(null);
    setForm(defaultForm);
    setPhoto(null);
    setPhotoPreview('');
    setSubmitError('');
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (auctionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 5%)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🏏</div>
          <p className="text-gray-400 font-semibold tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Loading auction...
          </p>
        </div>
      </div>
    );
  }

  // ── Auction not found ──────────────────────────────────────────────────────
  if (auctionError || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(222 47% 5%)' }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Auction Not Found
          </h2>
          <p className="text-gray-400 mb-6">{auctionError || 'This registration link is invalid or the auction no longer exists.'}</p>
          <Link href="/auctions" className="inline-block px-6 py-3 rounded-lg text-black font-bold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, hsl(45,100%,51%), hsl(40,100%,38%))' }}>
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (successPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(222 47% 5%)' }}>
        <div className="w-full max-w-md text-center">
          {/* Success card */}
          <div className="rounded-2xl overflow-hidden mb-6"
            style={{ background: 'hsl(222 35% 10%)', border: '2px solid hsla(45,100%,51%,0.4)', boxShadow: '0 0 60px hsla(45,100%,51%,0.15)' }}>
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg, hsl(45,100%,51%), hsl(40,100%,38%))' }} />
            <div className="p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '2px' }}>
                REGISTERED!
              </h2>
              <p className="text-gray-400 text-sm mb-6">You've been added to the auction pool</p>

              {/* Player preview card */}
              <div className="rounded-xl overflow-hidden mx-auto mb-6" style={{ maxWidth: 200 }}>
                <div className="relative" style={{ height: 200, background: 'hsl(222 40% 8%)' }}>
                  {successPlayer.imageUrl ? (
                    <img
                      src={imgUrl(successPlayer.imageUrl)}
                      alt={successPlayer.name}
                      className="w-full h-full object-cover object-top"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  {!successPlayer.imageUrl && (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {successPlayer.role === 'Batsman' ? '🏏' : successPlayer.role === 'Bowler' ? '🎯' : successPlayer.role === 'AllRounder' ? '⭐' : successPlayer.role === 'WicketKeeper' ? '🧤' : '🏅'}
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <div className="text-white font-bold text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>{successPlayer.name}</div>
                    <div className="text-gray-400 text-xs">{successPlayer.role} · {successPlayer.category}</div>
                  </div>
                </div>
                <div className="p-3 text-center" style={{ background: 'hsl(222 35% 12%)' }}>
                  <div className="text-yellow-400 font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {fmt(successPlayer.basePrice)}
                  </div>
                  <div className="text-gray-500 text-xs">Base Price</div>
                </div>
              </div>

              <div className="rounded-lg p-3 mb-6 text-sm text-gray-300" style={{ background: 'hsla(45,100%,51%,0.08)', border: '1px solid hsla(45,100%,51%,0.2)' }}>
                🏏 <strong className="text-yellow-400">{auction.name}</strong> — your registration is confirmed. The organizer will be notified.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRegisterAnother}
              className="flex-1 py-3 rounded-xl font-bold text-black transition-all hover:scale-[1.02]"
              style={{ fontFamily: 'Oswald, sans-serif', background: 'linear-gradient(135deg, hsl(45,100%,51%), hsl(40,100%,38%))' }}
            >
              + Register Another Player
            </button>
            <Link
              href={`/auctions/${id}`}
              className="flex-1 py-3 rounded-xl font-bold text-center transition-all hover:scale-[1.02]"
              style={{ fontFamily: 'Oswald, sans-serif', background: 'hsla(222,35%,16%,0.8)', border: '1px solid hsla(255,255,255,0.1)', color: 'white' }}
            >
              View Auction →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'hsl(222 47% 5%)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/beast-logo.png" alt="Beast Cricket" className="w-14 h-14 object-contain mx-auto"
              style={{ filter: 'drop-shadow(0 0 12px hsla(45,100%,51%,0.6))' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'hsla(45,100%,51%,0.12)', border: '1px solid hsla(45,100%,51%,0.3)', color: 'hsl(45,100%,65%)' }}>
            🏏 PLAYER REGISTRATION
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '2px' }}>
            {auction.name}
          </h1>
          {auction.description && (
            <p className="text-gray-400 text-sm max-w-md mx-auto">{auction.description}</p>
          )}
        </div>

        {/* Form card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'hsl(222 35% 10%)', border: '1px solid hsla(45,100%,51%,0.2)', boxShadow: '0 0 40px hsla(45,100%,51%,0.08)' }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg, hsl(45,100%,51%), hsl(40,100%,38%))' }} />
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '1px' }}>
              Player Details
            </h2>

            {submitError && (
              <div className="mb-5 px-4 py-3 rounded-lg text-sm text-red-300 border border-red-500/30"
                style={{ background: 'hsla(0,84%,60%,0.1)' }}>
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Row 1: Name */}
              <div>
                <label className={LBL}>Player Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={INP}
                  style={INP_BG}
                  placeholder="e.g. Virat Kohli"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              {/* Row 2: Role + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LBL}>Role *</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className={INP}
                    style={INP_BG}
                    required
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r} style={{ background: 'hsl(222 35% 13%)' }}>
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
                    className={INP}
                    style={INP_BG}
                    required
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} style={{ background: 'hsl(222 35% 13%)' }}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Nationality + Age + Base Price */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={LBL}>Nationality</label>
                  <input
                    value={form.nationality}
                    onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))}
                    className={INP}
                    style={INP_BG}
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
                    style={INP_BG}
                    placeholder="24"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className={LBL}>Base Price (₹) *</label>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                    className={INP}
                    style={INP_BG}
                    placeholder="1000000"
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Row 4: Stats */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Career Statistics (optional)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: 'matches', label: 'Matches' },
                    { key: 'runs', label: 'Runs' },
                    { key: 'wickets', label: 'Wickets' },
                    { key: 'average', label: 'Average', step: '0.01' },
                    { key: 'strikeRate', label: 'Strike Rate', step: '0.01' },
                  ].map(({ key, label, step }) => (
                    <div key={key}>
                      <label className={LBL}>{label}</label>
                      <input
                        type="number"
                        value={(form as any)[key]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        className={INP}
                        style={INP_BG}
                        placeholder="0"
                        min={0}
                        step={step || '1'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Photo */}
              <div>
                <label className={LBL}>Player Photo (optional · max 5MB)</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg cursor-pointer transition-all hover:border-yellow-500/40"
                      style={{ background: 'hsl(222 35% 13%)', border: '2px dashed hsla(255,255,255,0.12)' }}>
                      <div className="text-center">
                        <div className="text-2xl mb-1">📸</div>
                        <div className="text-xs text-gray-400">Click to upload photo</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">JPG, PNG, WebP</div>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {photoPreview && (
                    <div className="relative flex-shrink-0">
                      <div className="rounded-xl overflow-hidden border-2 border-yellow-500/30"
                        style={{ width: 96, height: 96 }}>
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover object-top" />
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {!photoPreview && (
                    <div className="flex-shrink-0 rounded-xl flex items-center justify-center text-4xl border-2 border-dashed border-white/10"
                      style={{ width: 96, height: 96, background: 'hsl(222 35% 13%)' }}>
                      {form.role === 'Batsman' ? '🏏' : form.role === 'Bowler' ? '🎯' : form.role === 'AllRounder' ? '⭐' : form.role === 'WicketKeeper' ? '🧤' : '🏅'}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl font-bold text-black text-lg transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 relative overflow-hidden"
                  style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '2px', background: 'linear-gradient(135deg, hsl(45,100%,51%), hsl(40,100%,38%))' }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Registering...
                    </span>
                  ) : (
                    '+ Add Player'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
          <Link href={`/auctions/${id}`} className="hover:text-yellow-400 transition-colors">
            View Auction →
          </Link>
          <span>·</span>
          <Link href="/auctions" className="hover:text-yellow-400 transition-colors">
            All Auctions
          </Link>
        </div>

      </div>
    </div>
  );
}
