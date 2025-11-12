"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import MessageService from "@/services/message.service";
import { Textarea } from "@/components/ui/textarea";

interface EditMessageDialogProps {
  messageId: string;
  currentContent: string;
  onSuccess?: () => void;
}

export default function EditMessageDialog({
  messageId,
  currentContent,
  onSuccess,
}: EditMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(currentContent);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await MessageService.updateMessage(messageId, { content });
      toast.success("Message modifié avec succès");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Erreur lors de la modification du message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Modifier le message"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="content">Contenu du message</FieldLabel>
            <Textarea
              id="content"
              placeholder="Entrez votre message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isLoading}
              rows={4}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
