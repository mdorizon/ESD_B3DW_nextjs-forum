"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import MessageService from "@/services/message.service";
import { MessageDTO } from "@/types/message.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface MessageFormProps {
  conversationId: string;
}

export default function MessageForm({ conversationId }: MessageFormProps) {
  const { data: session } = useSession();
  const { register, handleSubmit, watch, reset } = useForm<MessageDTO>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: MessageDTO) => {
      await MessageService.createMessage({
        ...data,
        conversationId,
      });
    },
    onSuccess: () => {
      reset();
      toast.success("Message sent successfully!");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const onSubmit = async (data: MessageDTO) => {
    mutation.mutate(data);
  };

  const contentWatch = watch("content");

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!session?.user) {
    return (
      <div className="relative my-5 p-4 border border-muted rounded-md bg-muted/50">
        <p className="text-center text-muted-foreground">
          Vous devez être connecté pour envoyer un message.
        </p>
      </div>
    );
  }

  return (
    <form className="relative my-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="text"
        placeholder="Type your message..."
        className="py-6"
        {...register("content")}
      />
      <Button
        type="submit"
        className="absolute top-1/2 right-0 -translate-y-1/2 mr-2"
        disabled={
          !contentWatch || contentWatch.trim() === "" || mutation.isPending
        }
      >
        {mutation.isPending && <Spinner className="mr-2" />}
        Send
      </Button>
    </form>
  );
}
