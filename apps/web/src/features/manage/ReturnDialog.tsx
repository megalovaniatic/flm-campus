import { CornerUpLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Dialog, TextArea } from '@/design';

/** «Devolver con comentario»: el comentario es obligatorio y lo verá la persona autora. */
export function ReturnDialog({ open, title, onClose, onConfirm }: { open: boolean; title: string; onClose: () => void; onConfirm: (comment: string) => void }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | undefined>();
  useEffect(() => {
    if (open) {
      setComment('');
      setError(undefined);
    }
  }, [open]);
  const submit = () => {
    if (!comment.trim()) {
      setError('Escribe un comentario que explique qué hay que corregir antes de devolver el contenido.');
      return;
    }
    onConfirm(comment.trim());
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Devolver con comentario"
      description={<>Vuelve a borrador «{title}». La persona autora verá tu comentario al abrirlo.</>}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={<CornerUpLeft />} onClick={submit}>
            Devolver
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <TextArea
          label="Comentario para la autoría"
          required
          rows={4}
          maxLength={500}
          value={comment}
          error={error}
          onChange={(e) => {
            setComment(e.target.value);
            if (error) setError(undefined);
          }}
          hint="Concreto y amable: qué falta y qué hay que cambiar. Por ejemplo: «Añade el enlace oficial a la fuente»."
        />
      </form>
    </Dialog>
  );
}
