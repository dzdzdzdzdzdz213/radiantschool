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
      whileHover={{ scale: 1.04, y: -6 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border bg-card p-8 text-left transition-all duration-300 hover:shadow-xl hover:border-primary/30"
      data-reveal="scale"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-15`} />
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-br from-amber-500/10 to-rose-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150 delay-75" />
      <div className="relative z-10">
        <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:shadow-xl group-hover:scale-125 group-hover:rotate-3 transition-all duration-300`}>
          {icon}
        </div>
        <h3 className="mb-1 text-xl font-bold group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="mb-3 text-sm text-muted-foreground">{subtitle}</p>
        <p className="text-sm text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-3">{hoverDescription}</p>
        <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full" />
      </div>
    </motion.button>
  );
}
