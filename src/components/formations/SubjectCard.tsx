import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SubjectCardProps {
  name: string;
  icon: ReactNode;
  color?: string;
  onClick?: () => void;
  index?: number;
}

export default function SubjectCard({
  name,
  icon,
  color = '#4f46e5',
  onClick,
  index = 0,
}: SubjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold" style={{ color: 'var(--fg)' }}>
          {name}
        </p>
      </div>

      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:bg-[var(--primary-light)]"
        style={{ color: 'var(--fg-muted)' }}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </motion.div>
  );
}
