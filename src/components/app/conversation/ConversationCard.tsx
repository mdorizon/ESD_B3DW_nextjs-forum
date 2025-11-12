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
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link href={`/conversations/${conversation.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-all">
        <CardHeader className="-mb-4">{conversation?.title}</CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
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
          </div>
        </CardContent>
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
      </Card>
    </Link>
  );
}
