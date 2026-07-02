import { useRef, useState } from 'react';
import { Camera, Loader } from 'lucide-react';
import { getAvatarUrl, uploadAvatar } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
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
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const displayUrl = preview || getAvatarUrl(url);
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const path = await uploadAvatar(userId, file);
      onUpdate?.(path);
    } catch {
      toast(t('errors.save_error', lang, "de l'avatar"), 'error');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      {displayUrl ? (
        <img src={displayUrl} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
      ) : (
        <div className="flex items-center justify-center rounded-full bg-primary text-white font-bold text-sm" style={{ width: size, height: size, fontSize: size * 0.35 }}>
          {initials}
        </div>
      )}
      {uploading && (
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
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
