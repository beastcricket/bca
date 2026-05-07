'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api, { saveToken } from '@/lib/api';
import GoldParticles from '@/components/beast/GoldParticles';
import FireSparkles from '@/components/beast/FireSparkles';
import BeastLogo from '@/components/beast/BeastLogo';

type F = { email: string; password: string };

const ROLES = [
  { id:'organizer',  icon:'🎬', label:'Organizer',  color:'from-amber-500/30 to-yellow-600/10', tagline:'Command Center Access' },
  { id:'team_owner', icon:'🏆', label:'Team Owner', color:'from-blue-500/30 to-cyan-600/10',   tagline:'War Room Access' },
  { id:'viewer',     icon:'👁️', label:'Viewer',     color:'from-emerald-500/30 to-green-600/10',tagline:'Live Arena Access' },
];

function mapError(msg: string, data?: any) {
  if (msg.includes('No account') || msg.includes('not found'))
    return { text:'No account with this email.', hint:'Check spelling or register first.', link:{ label:'Register →', href:'/register' } };
  if (data?.notVerified || msg.includes('not verified') || msg.includes('verify'))
    return { text:'Email not verified.', hint:'Check your inbox and click the verification link.', link:{ label:'Resend verification →', href:'/register' } };
  if (msg.includes('Incorrect') || msg.includes('password') || msg.includes('Wrong'))
    return { text:'Wrong password.', hint:'Check caps lock or reset below.', link:{ label:'Forgot password →', href:'/forgot-password' } };
  return { text: msg || 'Login failed.', hint:'' };
}

export default function LoginPage() {
  const [loading,      setLoading]      = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formError,    setFormError]    = useState<any>(null);
  const { register, handleSubmit, formState:{ errors } } = useForm<F>();

  const onSubmit = async (d: F) => {
    if (!selectedRole) {
      setFormError({ text:'Please select your role first.' });
      return;
    }

    setFormError(null);
    setLoading(true);

    try {
      console.log('🔐 Logging in with email:', d.email);
      const res = await api.post('/auth/login', {
        email: d.email.trim().toLowerCase(),
        password: d.password,
        role: selectedRole
      });

      console.log('✅ Login successful');
      if (res.data.token) {
        saveToken(res.data.token);
        localStorage.setItem('role', res.data.user.role);
      }

      const actualRole = res.data.user?.role;

      if (actualRole === 'organizer' || actualRole === 'admin') {
        window.location.href = '/dashboard/organizer';
      } else if (actualRole === 'team_owner') {
        window.location.href = '/dashboard/team-owner';
      } else {
        window.location.href = '/auctions';
      }

    } catch (e: any) {
      console.error('❌ Login error:', e);
      setFormError(mapError(e.response?.data?.error || '', e.response?.data));
      setLoading(false);
    }
  };

  const chosen = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage:"url('/stadium-bg.jpg')" }}/>\n      <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse at center,transparent 20%,hsl(222 47% 6% / 0.95) 70%)' }}/>\n      {[{ left:'10%', rotate:'-12deg' },{ left:'90%', rotate:'12deg' }].map((b,i)=>(\n        <div key={i} className="absolute top-0 pointer-events-none"\n          style={{ left:b.left,width:120,height:'60vh',\n            background:'linear-gradient(180deg,hsla(45,100%,90%,0.8) 0%,transparent 100%)',\n            transform:`rotate(${b.rotate})`,\n            transformOrigin:'top center',\n            filter:'blur(25px)',\n            opacity:0.06 }}/>\n      ))}\n      <GoldParticles/>\n      <FireSparkles/>\n\n      <div className="relative z-10 w-full max-w-md mx-4">\n        <div className="flex justify-center mb-5 opacity-0 animate-slide-up">\n          <BeastLogo size={100} glow float3d href=\"/\"/>\n        </div>\n\n        {chosen && (\n          <div className="flex justify-center mb-4 opacity-0 animate-slide-up">\n            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${chosen.color} border-gold-subtle`}>\n              <span className="text-lg">{chosen.icon}</span>\n              <span className="font-heading text-sm uppercase tracking-[0.15em] text-primary">{chosen.label}</span>\n              <span className="text-muted-foreground text-xs font-display\">— {chosen.tagline}</span>\n            </div>\n          </div>\n        )}\n\n        <div className="bg-glass-premium rounded-xl p-7 gold-edge opacity-0 animate-slide-up">\n          <h2 className="font-heading text-2xl uppercase tracking-wider text-center mb-1 text-foreground">\n            Welcome Back\n          </h2>\n\n          <p className="text-center text-muted-foreground text-sm mb-5 font-display">\n            Select your role to continue\n          </p>\n\n          <div className="grid grid-cols-3 gap-2 mb-5">\n            {ROLES.map(r => (\n              <button\n                key={r.id}\n                type="button"\n                onClick={() => { setSelectedRole(r.id); setFormError(null); }}\n                className={`relative rounded-lg p-3 text-center transition-all duration-300 ${\n                  selectedRole===r.id ? 'border-gold glow-gold' : 'border-gold-subtle'\n                }`}\n              >\n                <div className="text-2xl mb-1">{r.icon}</div>\n                <div className="font-heading text-[10px] uppercase tracking-wider">\n                  {r.label}\n                </div>\n              </button>\n            ))}\n          </div>\n\n          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">\n            <div>\n              <input {...register('email', { required: 'Email is required' })} type="email" placeholder="Email" className="input-beast"/>\n              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}\n            </div>\n            \n            <div>\n              <input {...register('password', { required: 'Password is required' })} type="password" placeholder="Password" className="input-beast"/>\n              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}\n            </div>\n\n            <button type="submit" disabled={loading} className="w-full py-3 bg-primary rounded font-heading uppercase tracking-wider text-sm disabled:opacity-50">\n              {loading ? 'Signing In...' : 'Login'}\n            </button>\n\n            {formError && (\n              <div className="text-destructive text-xs font-heading bg-destructive/10 rounded-lg px-3 py-2 space-y-1">\n                <p>{formError.text}</p>\n                {formError.hint && <p className="text-muted-foreground font-display">{formError.hint}</p>}\n                {formError.link && (\n                  <Link href={formError.link.href} className="text-primary underline font-heading">\n                    {formError.link.label}\n                  </Link>\n                )}\n              </div>\n            )}\n          </form>\n\n          {/* FORGOT PASSWORD & REGISTER LINKS */}\n          <div className="mt-6 space-y-3 
