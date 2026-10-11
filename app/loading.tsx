import React from 'react';
import { JarLoader } from '@/components/JarLoader';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <JarLoader text="ONEWISHES" subtext="Unsealing memories..." size="lg" />
    </div>
  );
}
