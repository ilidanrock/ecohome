'use client';

import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export type ConfirmDialogProps = {
  /** Controla si el diálogo está abierto */
  open: boolean;
  /** Se llama cuando el estado de apertura cambia (ej. al cerrar) */
  onOpenChange: (open: boolean) => void;
  /** Título del diálogo */
  title: string;
  /** Descripción o mensaje (puede ser texto o ReactNode para contenido dinámico) */
  description: React.ReactNode;
  /** Etiqueta del botón de confirmar (ej. "Aceptar", "Eliminar") */
  confirmLabel?: string;
  /** Etiqueta del botón de cancelar */
  cancelLabel?: string;
  /** Callback al confirmar. Cerrar el diálogo es responsabilidad del padre si lo desea. */
  onConfirm: () => void;
  /** Muestra estado de carga en el botón confirmar y lo deshabilita */
  loading?: boolean;
  /** Variante del botón confirmar: destructive para acciones irreversibles (rojo) */
  variant?: 'default' | 'destructive';
  /** Clases adicionales para el contenido */
  className?: string;
};

/**
 * Diálogo de confirmación reutilizable para toda la app.
 * Usa AlertDialog de Radix con estilo consistente (tema, accesibilidad).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  onConfirm,
  loading = false,
  variant = 'default',
  className,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              variant === 'destructive' &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {loading ? '…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
