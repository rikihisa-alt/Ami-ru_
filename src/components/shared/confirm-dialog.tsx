"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrismButton } from "@/components/ui/prism-button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  isPending?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "削除する",
  cancelLabel = "キャンセル",
  variant = "danger",
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <PrismButton
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </PrismButton>
          <PrismButton
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            {isPending ? "処理中..." : confirmLabel}
          </PrismButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
