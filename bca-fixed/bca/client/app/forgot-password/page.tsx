'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import GoldParticles from '@/components/beast/GoldParticles';
import FireSparkles from '@/components/beast/FireSparkles';
import BeastLogo from '@/components/beast/BeastLogo';
import { useBackButton } from '@/hooks/useBackButton';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState:{ errors } } = useForm<{ email: string }>();
  const { goBack } = useBackButton('/login');

  const onSubmit = async (d: { email: string }) => {
    setLoading(true);
    try {
      console.log('📧 Sending password reset email...');
      await api.post('/auth/forgot-password', { email: d.email });
      console.log('✅ Password reset email sent');
      setSent(true);
    } catch (e: any) {
      console.error('❌ Failed to send reset email:', e);
      setSent(true);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage:"url('/stadium-bg.jpg')" }}/>\n      <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse at center, transparent 20%, hsl(222 47% 6% / 0.95) 70%)' }}/>\n      <GoldParticles/><FireSparkles/>\n      <div className="relative z-10 w-full max-w-md mx-4">\n        <div className="flex justify-between items-center mb-6">\n          <BeastLogo size={80} glow href=\"/\"/>\n          <button onClick={goBack} className="px-3 py-2 rounded-lg text-xs font-heading uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border/40">\n            ← Back\n          </button>\n        </div>\n        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}\n          className="bg-glass-premium rounded-xl p-8 gold-edge border-gold-subtle">\n          {sent ? (\n            <div className="text-center">\n              <div className="text-5xl mb-4">📧</div>\n              <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-3\">Check Your <span className="text-gradient-gold\">Inbox</span></h2>\n              <p className="font-display text-muted-foreground text-sm mb-6 leading-relaxed\">If that email is registered, a reset link has been sent. Check your spam folder too.</p>\n              <Link href=\"/login\" className=\"block w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm text-center glow-gold\">Back to Login</Link>\n            </div>\n          ) : (\n            <>\n              <h2 className=\"font-heading text-2xl uppercase tracking-wider text-center text-foreground mb-1\">Reset <span className=\"text-gradient-gold\">Password</span></h2>\n              <p className=\"text-center font-display text-muted-foreground text-sm mb-6\">Enter your email to receive a reset link</p>\n              <form onSubmit={handleSubmit(onSubmit)} className=\"space-y-4\">\n                <div>\n                  <label className=\"block text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1.5\">Email Address</label>\n                  <input {...register('email',{ required:'Email required', pattern:{ value:/^\\S+@\\S+\\.\\S+$/, message:'Invalid email' } })}\n                    type=\"email\" placeholder=\"you@email.com\" className=\"input-beast\"/>\n                  {errors.email && <p className=\"text-destructive text-xs mt-1\">{errors.email.message}</p>}\n                </div>\n                <button type=\"submit\" disabled={loading}\n                  className=\"w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm glow-gold hover:scale-[1.02] transition-all disabled:opacity-50\">\n                  {loading ? 'Sending...' : 'Send Reset Link'}\n                </button>\n              </form>\n              <p className=\"text-center text-sm text-muted-foreground mt-5\">\n                Remember it? <Link href=\"/login\" className=\"text-primary hover:underline\">Sign in</Link>\n              </p>\n            </>\n          )}\n        </motion.div>\n      </div>\n    </div>\n  );\n}
