"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getRelativeTime } from "@/lib/date";
import { ConversationWithExtend } from "@/types/conversation.type";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useUserRole } from "@/hooks/useUserRole";
import { canDeleteAnyConversation } from "@/lib/permissions";
import ConversationDeleteButton from "./ConversationDeleteButton";

interface ConversationCardProps {
  conversation: ConversationWithExtend & {
    author?: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  };
}

export default function ConversationCard({
  conversation,
}: ConversationCardProps) {
  const { data: session } = useSession();
  const { role } = useUserRole();
  const isOwner = session?.user?.id === conversation.authorId;
  const canDelete = isOwner || (role ? canDeleteAnyConversation(role) : false);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-all group/card relative">
      <Link href={`/conversations/${conversation.id}`}>
        <div className="flex flex-col h-min mb-6">
          <CardHeader className="">{conversation?.title}</CardHeader>
          <CardContent className="flex items-center gap-2">
            <Avatar className="size-6 rounded-lg">
              <AvatarFallback className="rounded-lg text-xs">
                {conversation.author?.image ? (
                  <Image
                    src={conversation.author.image}
                    alt="Profile-picture"
                    width={24}
                    height={24}
                  />
                ) : (
                  getInitials(conversation.author?.name || "User")
                )}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {conversation.author?.name || "Utilisateur inconnu"}
            </span>
          </CardContent>
        </div>
        <CardFooter className="w-full flex justify-between ">
          <p className="text-sm italic text-zinc-500">
            {getRelativeTime(conversation.createdAt)}
          </p>
          <p className="text-sm italic text-zinc-500">
            {conversation?.messages.length > 0
              ? `Nombre de réponses : ${conversation?.messages.length}`
              : "Aucune réponse"}
          </p>
        </CardFooter>
        {canDelete && (
          <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <ConversationDeleteButton
              id={conversation.id}
              className="h-7 w-7"
            />
          </div>
        )}
      </Link>
    </Card>
  );
}
