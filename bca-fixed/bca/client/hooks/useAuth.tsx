'use client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useBackButton = (fallbackPath: string = '/') => {
  const router = useRouter();

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  }, [router, fallbackPath]);

  return { goBack };
};
