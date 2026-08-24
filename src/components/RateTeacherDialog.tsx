import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const CRITERIA = [
  { key: 'teaching_quality', label: 'Qualité de l\'enseignement' },
  { key: 'communication', label: 'Communication' },
  { key: 'punctuality', label: 'Ponctualité' },
  { key: 'organization', label: 'Organisation' },
] as const;

interface RateTeacherDialogProps {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  teacherName: string;
  courseName: string;
}

export default function RateTeacherDialog({ open, onClose, teacherId, teacherName, courseName }: RateTeacherDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open || !profile?.id || !teacherId) return;
    // prefill existing evaluation if any
    (async () => {
      const { data } = await supabase
        .from('evaluations')
        .select('teaching_quality, communication, punctuality, organization, comment')
        .eq('student_id', profile.id)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setScores({
          teaching_quality: data.teaching_quality,
          communication: data.communication,
          punctuality: data.punctuality,
          organization: data.organization,
        });
        setComment(data.comment ?? '');
      }
    })();
  }, [open, profile?.id, teacherId]);

  if (!open) return null;

  const allRated = CRITERIA.every((c) => (scores[c.key] ?? 0) >= 1);
  const average = allRated
    ? (CRITERIA.reduce((s, c) => s + (scores[c.key] ?? 0), 0) / CRITERIA.length).toFixed(1)
    : null;

  const submit = async () => {
    if (!profile?.id || !allRated) return;
    setSaving(true);
    try {
      const payload = {
        student_id: profile.id,
        teacher_id: teacherId,
        teaching_quality: scores.teaching_quality,
        communication: scores.communication,
        punctuality: scores.punctuality,
        organization: scores.organization,
        comment: comment.trim() || null,
      };
      // one evaluation per student/teacher: update if exists, else insert
      const { data: existing } = await supabase
        .from('evaluations')
        .select('id')
        .eq('student_id', profile.id)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const { error } = existing
        ? await supabase.from('evaluations').update(payload).eq('id', existing.id)
        : await supabase.from('evaluations').insert(payload);
      if (error) throw error;
      toast('Merci ! Votre évaluation a été enregistrée ⭐', 'success');
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erreur lors de l\'envoi', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Évaluer {teacherName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Cours : {courseName}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {CRITERIA.map((c) => (
          <div key={c.key}>
            <p className="text-sm font-medium mb-1.5">{c.label}</p>
            <div className="flex gap-1.5" onMouseLeave={() => setHovered((h) => ({ ...h, [c.key]: 0 }))}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hovered[c.key] || scores[c.key] || 0) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHovered((h) => ({ ...h, [c.key]: n }))}
                    onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`h-7 w-7 ${active ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="text-sm font-medium mb-1.5">Commentaire (optionnel)</p>
          <Textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ce que vous avez apprécié…"
            maxLength={500}
          />
        </div>

        {average && (
          <p className="text-sm text-muted-foreground">
            Note moyenne : <span className="font-bold text-foreground">{average}/5</span>
          </p>
        )}

        <Button className="w-full" disabled={!allRated || saving} onClick={submit}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {saving ? 'Envoi…' : 'Envoyer mon évaluation'}
        </Button>
      </motion.div>
    </div>
  );
}
