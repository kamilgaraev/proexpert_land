import { useEffect, useState } from 'react';
import type { AiAssistantAttachment } from '@/types/aiAssistant';
import { aiAssistantService } from '@/services/aiAssistantService';

export default function AiAssistantAttachmentImage({ attachment, preview, onRemove, progress, error }: { attachment?: AiAssistantAttachment; preview?: string; onRemove?: () => void; progress?: number; error?: string }) {
  const attachmentId = attachment?.id;
  const imageKey = preview ?? attachmentId ?? '';
  const [image, setImage] = useState<{ key: string; src: string; unavailable: boolean }>({ key: imageKey, src: preview ?? '', unavailable: false });
  useEffect(() => {
    if (preview) { setImage({ key: imageKey, src: preview, unavailable: false }); return; }
    if (!attachmentId) { setImage({ key: imageKey, src: '', unavailable: false }); return; }
    setImage({ key: imageKey, src: '', unavailable: false });
    const controller = new AbortController(); let url = '';
    void aiAssistantService.getAttachmentContent(attachmentId, controller.signal).then((blob) => { if (!controller.signal.aborted) { url = URL.createObjectURL(blob); setImage({ key: imageKey, src: url, unavailable: false }); } }).catch(() => { if (!controller.signal.aborted) setImage({ key: imageKey, src: '', unavailable: true }); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [attachmentId, imageKey, preview]);
  const visibleImage = image.key === imageKey ? image : null;
  return <div className="relative inline-flex max-w-48 flex-col gap-1 rounded-md border p-1">{visibleImage?.src && <img src={visibleImage.src} alt={attachment?.name ?? 'Прикреплённое изображение'} className="max-h-36 max-w-48 rounded object-contain" />}{visibleImage?.unavailable && <span className="text-xs text-muted-foreground">Изображение недоступно</span>}{progress !== undefined && progress < 100 && <span className="text-xs">Загрузка: {progress}%</span>}{error && <span role="alert" className="text-xs text-destructive">{error}</span>}{onRemove && <button type="button" onClick={onRemove} aria-label="Удалить изображение" className="absolute right-1 top-1 rounded-full bg-background p-1"><span aria-hidden="true">×</span></button>}</div>;
}
