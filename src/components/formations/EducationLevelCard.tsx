import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EducationLevelCardProps {
  title: string;
  subtitle: string;
  hoverDescription: string;
  icon: ReactNode;
  gradient: string;
  image?: string;
  onClick?: () => void;
}

export default function EducationLevelCard({
  title,
  subtitle,
  hoverDescription,
  icon,
  gradient,
  image,
  onClick,
}: EducationLevelCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="group relative h-[360px] w-full cursor-pointer overflow-hidden rounded-3xl"
      style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.1)' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
        {image && (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      {!image && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col justify-end p-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/30">
          <div className="text-white">{icon}</div>
        </div>

        <h3 className="mb-1 text-3xl font-bold tracking-tight text-white">
          {title}
        </h3>

        <p className="text-sm font-medium text-white/70">{subtitle}</p>

        <div className="mt-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            whileHover={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none"
          >
            <div className="h-px w-12 bg-white/40" />
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              {hoverDescription}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-8 right-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
