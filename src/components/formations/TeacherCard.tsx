import { motion } from 'framer-motion';
import { Star, Users, Award, ArrowRight } from 'lucide-react';

interface TeacherCardProps {
  id: string;
  photoUrl?: string;
  firstName: string;
  lastName: string;
  specialty: string;
  yearsOfExperience: number;
  rating: number;
  studentsCount: number;
  biography?: string;
  onClick?: () => void;
  index?: number;
}

export default function TeacherCard({
  photoUrl,
  firstName,
  lastName,
  specialty,
  yearsOfExperience,
  rating,
  studentsCount,
  biography,
  onClick,
  index = 0,
}: TeacherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="relative h-56 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
            <span className="text-6xl font-bold text-white/80">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>
            {firstName} {lastName}
          </h3>
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
            {specialty}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--fg-muted)' }}>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
            <span>{yearsOfExperience} ans</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
            <span>{studentsCount}</span>
          </div>
        </div>

        {biography && (
          <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            {biography}
          </p>
        )}

        <button
          onClick={onClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200"
          style={{
            backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)`,
            color: 'var(--primary)',
          }}
        >
          Voir le profil
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
