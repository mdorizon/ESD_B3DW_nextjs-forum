"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import UserService from "@/services/user.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Calendar, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  messagesCount: number;
  updatedAt: string;
}

interface UserStats {
  conversationsCount: number;
  messagesCount: number;
  recentConversations: Conversation[];
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [userData, statsData] = await Promise.all([
          UserService.fetchUserById(userId),
          UserService.fetchUserStats(userId),
        ]);
        setUser(userData);
        setStats(statsData);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-6 animate-pulse">
          <div className="flex items-start gap-6">
            <div className="size-24 rounded-full bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user || !stats) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h1>
          <Link href="/" className="text-blue-500 underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* En-tête du profil */}
      <div className="border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-6">
          <Avatar className="size-24 rounded-full">
            <AvatarFallback className="rounded-full text-2xl">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={96}
                  height={96}
                />
              ) : (
                getInitials(user.name)
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-muted-foreground mb-4">{user.email}</p>
            {user.bio && <p className="text-sm mb-4">{user.bio}</p>}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>
                Membre depuis le{" "}
                {format(new Date(user.createdAt), "d MMMM yyyy", {
                  locale: fr,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.conversationsCount}</p>
              <p className="text-sm text-muted-foreground">
                {stats.conversationsCount > 1
                  ? "Conversations créées"
                  : "Conversation créée"}
              </p>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <UserIcon className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.messagesCount}</p>
              <p className="text-sm text-muted-foreground">
                {stats.messagesCount > 1 ? "Messages envoyés" : "Message envoyé"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dernières conversations */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Conversations récentes
        </h2>
        {stats.recentConversations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucune conversation pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {stats.recentConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/conversations/${conversation.id}`}
                className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {conversation.title || "Sans titre"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-xs">
                          {conversation.author.image ? (
                            <Image
                              src={conversation.author.image}
                              alt={conversation.author.name}
                              width={20}
                              height={20}
                            />
                          ) : (
                            getInitials(conversation.author.name)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {conversation.author.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        • {conversation.messagesCount}{" "}
                        {conversation.messagesCount > 1
                          ? "messages"
                          : "message"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
