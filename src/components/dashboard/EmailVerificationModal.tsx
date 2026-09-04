import { useRef } from 'react';
import { Mail, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEmailVerification } from '@/hooks/useEmailVerification';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email?: string;
  onClose?: () => void;
}

export const EmailVerificationModal = ({ isOpen, email, onClose }: EmailVerificationModalProps) => {
  const { canResend, resendCooldown, resendVerificationEmail, loading, error } = useEmailVerification();
  const returnFocus = useRef<HTMLElement | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose?.(); }}>
      <DialogContent
        className="most-workspace w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl p-6 sm:p-8 shadow-none"
        onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
        onCloseAutoFocus={event => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault();
            returnFocus.current.focus();
          }
        }}
      >
        <DialogHeader className="pr-8 text-left">
          <Mail className="mb-3 h-8 w-8 text-primary" aria-hidden="true" />
          <DialogTitle className="text-2xl leading-tight">Подтвердите почту</DialogTitle>
          <DialogDescription className="pt-2 text-base leading-relaxed">
            Откройте письмо от МОСТ и перейдите по ссылке, чтобы продолжить вход.
          </DialogDescription>
        </DialogHeader>
        {email && <p className="break-all font-medium">{email}</p>}
        <p className="border-t pt-4 text-muted-foreground">
          Если письма нет во входящих, проверьте папки «Спам» и «Промоакции». Можно запросить новое письмо.
        </p>
        {error && <p role="alert" className="text-destructive">Не удалось отправить письмо. Попробуйте ещё раз позже.</p>}
        <div className="flex flex-col gap-3 pt-2">
          <Button onClick={resendVerificationEmail} disabled={!canResend || loading} className="min-h-12 h-auto whitespace-normal py-3">
            {loading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" /> : !canResend ? <RefreshCw className="h-5 w-5 shrink-0" aria-hidden="true" /> : <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />}
            {loading ? 'Отправка…' : !canResend ? `Повторить через ${resendCooldown} с` : 'Отправить письмо повторно'}
          </Button>
          {onClose && <Button onClick={onClose} variant="outline" className="min-h-12">Вернуться ко входу</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
