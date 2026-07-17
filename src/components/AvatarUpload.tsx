import { useRef, useState } from 'react';
import { Camera, Loader, Trash2 } from 'lucide-react';
import { getAvatarUrl, uploadAvatar, deleteAvatar } from '@/lib/storage';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

interface Props {
  userId: string;
  url: string | null | undefined;
  name: string;
  size?: number;
  onUpdate?: (url: string | null) => void;
}

export default function AvatarUpload({ userId, url, name, size = 64, onUpdate }: Props) {
  const { lang } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const displayUrl = preview || getAvatarUrl(url);
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hasImage = !!displayUrl;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const path = await uploadAvatar(userId, file);
      onUpdate?.(path);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      toast(err instanceof Error ? err.message : t('errors.save_error', lang, "de l'avatar"), 'error');
      setPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAvatar(userId, url);
      setPreview(null);
      onUpdate?.(null);
      toast(t('success.updated', lang, 'Avatar'), 'success');
    } catch (err) {
      console.error('Avatar delete failed:', err);
      toast(err instanceof Error ? err.message : t('errors.save_error', lang, "de l'avatar"), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative inline-flex group" style={{ width: size, height: size }}>
      {displayUrl ? (
        <img src={displayUrl} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
      ) : (
        <div className="flex items-center justify-center rounded-full bg-primary text-white font-bold text-sm" style={{ width: size, height: size, fontSize: size * 0.35 }}>
          {initials}
        </div>
      )}
      {(uploading || deleting) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
          <Loader className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-white shadow-sm transition-all hover:scale-105"
        style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--bg-card)' }}
      >
        <Camera className="h-3.5 w-3.5" />
      </button>
      {hasImage && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-destructive text-white shadow-sm transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
          style={{ borderColor: 'var(--bg-card)' }}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
