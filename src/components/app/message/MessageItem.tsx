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
    <div className={`flex ${isOwner ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`flex gap-2 max-w-[70%] ${isOwner ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <Avatar className="size-8 rounded-full shrink-0">
          <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs">
            {message.author?.image ? (
              <Image
                src={message.author.image}
                alt={`Photo de profil de ${message.author.name}`}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              getInitials(message.author?.name || "User")
            )}
          </AvatarFallback>
        </Avatar>

        {/* Bulle de message */}
        <div className="flex flex-col group/message">
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwner
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <p className="text-sm leading-relaxed wrap-break-word">
              {message.content}
            </p>
          </div>

          {/* Métadonnées et actions sous le message */}
          <div className={`flex items-center gap-2 mt-0.5 px-1 ${isOwner ? "flex-row-reverse" : "flex-row"}`}>
            <span className="text-[11px] text-muted-foreground">
              {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isEdited && (
              <span className="text-[11px] text-muted-foreground italic">
                modifié
              </span>
            )}

            {/* Boutons d'action style Instagram - visible au hover */}
            {isOwner && (
              <div className="flex gap-0.5 opacity-0 group-hover/message:opacity-100 transition-opacity">
                <div className="scale-75">
                  <EditMessageDialog
                    messageId={message.id}
                    currentContent={message.content}
                    onSuccess={handleEditSuccess}
                  />
                </div>
                <div className="scale-75">
                  <DeleteButton
                    entityName="Message"
                    queryKey="messages"
                    onDelete={MessageService.deleteById}
                    id={message.id}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
