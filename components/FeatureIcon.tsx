import React from 'react';
import { Volume2 } from 'lucide-react';
import { IPAFeature } from '../types';

export const FeatureIcon: React.FC<{ feature: IPAFeature; className?: string }> = ({ feature, className = '' }) => {
  switch (feature) {
    case IPAFeature.SYMBOL: return <span className={`font-black ${className}`}>Ω</span>;
    case IPAFeature.LABEL: return <span className={`font-black ${className}`}>abc</span>;
    case IPAFeature.EXAMPLES: return <span className={`font-black ${className}`}>“”</span>;
    case IPAFeature.SOUND: return <Volume2 className={className || 'h-5 w-5'} />;
    default: return null;
  }
};

export const featureStyles: Record<IPAFeature, { text: string; background: string; border: string }> = {
  [IPAFeature.SYMBOL]: { text: 'text-slate-700', background: 'bg-slate-50', border: 'border-slate-200' },
  [IPAFeature.LABEL]: { text: 'text-secondary', background: 'bg-secondary/10', border: 'border-secondary/20' },
  [IPAFeature.EXAMPLES]: { text: 'text-amber-600', background: 'bg-amber-50', border: 'border-amber-200' },
  [IPAFeature.SOUND]: { text: 'text-primary', background: 'bg-primary/10', border: 'border-primary/20' },
};
