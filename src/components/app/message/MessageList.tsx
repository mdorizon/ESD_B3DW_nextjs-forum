"use client";

import MessageService from "@/services/message.service";

import MessageItem from "./MessageItem";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";

interface MessageListProps {
  conversationId?: string;
}

export default function MessageList({ conversationId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      return await MessageService.fetchMessages({ conversationId });
    },
  });

  // Scroll vers le bas quand les messages sont chargés ou mis à jour
  useEffect(() => {
    if (data && data.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erreur lors du chargement des messages.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Aucun message pour le moment.</p>
        <p className="text-sm mt-2">Soyez le premier à participer à cette conversation !</p>
      </div>
    );
  }

  // Trier les messages du plus ancien au plus récent (haut vers bas)
  const sortedMessages = [...data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedMessages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {/* Élément invisible pour le scroll automatique */}
      <div ref={messagesEndRef} />
    </div>
  );
}
