import { motion } from 'framer-motion';

interface SelectionHeroProps {
  title: string;
  subtitle: string;
  gradient?: string;
}

export default function SelectionHero({
  title,
  subtitle,
  gradient = 'from-[var(--primary)] to-[var(--accent)]',
}: SelectionHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-6 py-24`}>
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/5 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-white/3 blur-3xl animate-spin-slow" />
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
