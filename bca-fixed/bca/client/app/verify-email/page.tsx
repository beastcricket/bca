'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import GoldParticles from '@/components/beast/GoldParticles';
import FireSparkles from '@/components/beast/FireSparkles';
import BeastLogo from '@/components/beast/BeastLogo';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        console.log('🔐 Verifying email...');
        await api.post('/auth/verify-email', { token });
        console.log('✅ Email verified successfully');
        setSuccess(true);
      } catch (e: any) {
        console.error('❌ Verification failed:', e);
        setError(e.response?.data?.error || 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/stadium-bg.jpg')" }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center,transparent 20%,hsl(222 47% 6% / 0.95) 70%)' }} />
      <GoldParticles />
      <FireSparkles />
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="flex justify-center mb-6">
          <BeastLogo size={80} glow href="/" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass-premium rounded-xl p-8 gold-edge border-gold-subtle text-center"
        >
          {loading ? (
            <>
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-2">
                Verifying Email
              </h2>
              <p className="font-display text-muted-foreground text-sm">Please wait...</p>
            </>
          ) : success ? (
            <>
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <h2 className="font-heading text-2xl uppercase tracking-wider text-foreground mb-3">
                Email <span className="text-gradient-gold">Verified!</span>
              </h2>
              <p className="font-display text-muted-foreground text-sm mb-6">
                Your account is now active. You can log in and start bidding!
              </p>
              <Link
                href="/login"
                className="block w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm text-center glow-gold hover:scale-[1.02] transition-all"
              >
                Go to Login
              </Link>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="font-heading text-2xl uppercase tracking-wider text-destructive mb-3">
                Verification Failed
              </h2>
              <p className="font-display text-muted-foreground text-sm mb-6">{error}</p>
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="block w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm text-center glow-gold hover:scale-[1.02] transition-all"
                >
                  Back to Register
                </Link>
                <Link
                  href="/login"
                  className="block w-full py-3.5 rounded-lg border border-primary/30 text-primary font-heading uppercase tracking-wider text-sm text-center hover:bg-primary/10 transition-all"
                >
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
