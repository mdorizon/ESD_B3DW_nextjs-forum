"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
      <div className="px-6 py-4">
        {/* Bouton retour */}
        <div className="mb-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux conversations
            </Button>
          </Link>
        </div>

        {/* Titre et auteur */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {conversation?.title || "Sans titre"}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/20 text-primary text-xs">
                {conversation.author?.image ? (
                  <Image
                    src={conversation.author.image}
                    alt={`Photo de profil de ${conversation.author.name}`}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                ) : (
                  getInitials(conversation.author?.name || "User")
                )}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {conversation.author?.name || "Utilisateur inconnu"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
