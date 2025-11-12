"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import ConversationDeleteButton from "./ConversationDeleteButton";

interface ConversationHeaderProps {
  conversation: {
    id: string;
    title: string | null;
    authorId: string;
    author?: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  };
}

export default function ConversationHeader({
  conversation,
}: ConversationHeaderProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === conversation.authorId;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-amber-100 p-4 rounded-md mb-4 relative">
      {isOwner && (
        <ConversationDeleteButton
          id={conversation.id}
          className="absolute top-2 right-2"
        />
      )}

      <div className="flex items-center gap-3 mb-2">
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="rounded-lg">
            {conversation.author?.image ? (
              <Image
                src={conversation.author.image}
                alt="Profile-picture"
                width={32}
                height={32}
              />
            ) : (
              getInitials(conversation.author?.name || "User")
            )}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">
            {conversation.author?.name || "Utilisateur inconnu"}
          </p>
          <p className="text-xs text-muted-foreground">Auteur</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xl">
        <span className="font-semibold">Sujet:</span>
        <h1>{conversation?.title}</h1>
      </div>
    </div>
  );
}
