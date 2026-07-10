import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface YearCardProps {
  title: string;
  subtitle?: string;
  gradient: string;
  icon: ReactNode;
  onClick?: () => void;
  index?: number;
}

export default function YearCard({
  title,
  subtitle,
  gradient,
  icon,
  onClick,
  index = 0,
}: YearCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={onClick}
      className="group relative h-[280px] w-full cursor-pointer overflow-hidden rounded-2xl"
      style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end p-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
          <div className="text-white">{icon}</div>
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-1 text-sm font-medium text-white/70">{subtitle}</p>
        )}

        <div className="absolute bottom-6 right-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
