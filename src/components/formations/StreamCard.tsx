import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StreamCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  gradient: string;
  onClick?: () => void;
  index?: number;
}

export default function StreamCard({
  title,
  description,
  icon,
  gradient,
  onClick,
  index = 0,
}: StreamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="group relative h-[220px] w-full cursor-pointer overflow-hidden rounded-2xl"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      <div className="absolute inset-0 opacity-15">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
          <div className="text-white">{icon}</div>
        </div>

        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-white/75">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
