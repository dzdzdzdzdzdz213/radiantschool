import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle: string;
  hoverDescription: string;
  icon: ReactNode;
  gradient: string;
  onClick: () => void;
}

export default function EducationLevelCard({ title, subtitle, hoverDescription, icon, gradient, onClick }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border bg-card p-8 text-left transition-shadow hover:shadow-xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />
      <div className="relative z-10">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <h3 className="mb-1 text-xl font-bold">{title}</h3>
        <p className="mb-3 text-sm text-muted-foreground">{subtitle}</p>
        <p className="text-sm text-muted-foreground/80 transition-opacity duration-300 group-hover:opacity-100">{hoverDescription}</p>
      </div>
    </motion.button>
  );
}
