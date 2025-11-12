"use client";

import { Message } from "@/generated/prisma";
import DeleteButton from "../common/DeleteButton";
import MessageService from "@/services/message.service";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import EditMessageDialog from "./EditMessageDialog";
import { useQueryClient } from "@tanstack/react-query";

interface MessageItemProps {
  message: Message & {
    author?: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  };
}

export default function MessageItem({ message }: MessageItemProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isOwner = session?.user?.id === message.authorId;
  const isEdited =
    message.updatedAt &&
    new Date(message.updatedAt).getTime() >
      new Date(message.createdAt).getTime() + 1000; // 1 seconde de marge

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["messages"] });
  };

  return (
    <div className="border shadow-sm rounded-md p-4 relative">
      {isOwner && (
        <div className="absolute top-2 right-2 flex gap-1">
          <EditMessageDialog
            messageId={message.id}
            currentContent={message.content}
            onSuccess={handleEditSuccess}
          />
          <DeleteButton
            entityName="Message"
            queryKey="messages"
            onDelete={MessageService.deleteById}
            id={message.id}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="rounded-lg">
            {message.author?.image ? (
              <Image
                src={message.author.image}
                alt="Profile-picture"
                width={32}
                height={32}
              />
            ) : (
              getInitials(message.author?.name || "User")
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {message.author?.name || "Utilisateur inconnu"}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.createdAt).toLocaleDateString("fr-FR")}
            </span>
            {isEdited && (
              <span className="text-xs text-muted-foreground italic">
                (modifié)
              </span>
            )}
          </div>
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
