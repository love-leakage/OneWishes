'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JarLoader } from '@/components/JarLoader';
import { sounds } from '@/lib/sounds';

export function InitialPageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if session has already shown splash in this tab
    const hasLoaded = sessionStorage.getItem('onewishes_initial_loaded');

    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('onewishes_initial_loaded', 'true');
      sounds.playChime();
    }, hasLoaded ? 450 : 850);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="initial-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0c120f] flex items-center justify-center pointer-events-auto"
        >
          <JarLoader text="ONEWISHES" subtext="Unsealing memories..." size="lg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
