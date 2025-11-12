"use client";

import { useSession, signOut } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  User,
  ChevronUp,
  MessageSquare,
  LogIn,
  UserPlus,
  ChevronDown,
  Home,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import ConversationService from "@/services/conversation.service";
import { useParams, useRouter } from "next/navigation";
import ConversationDeleteButton from "@/components/app/conversation/ConversationDeleteButton";
import { useQueryClient } from "@tanstack/react-query";

interface UserConversation {
  id: string;
  title: string | null;
  authorId: string;
}

export function AppSidebar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const params = useParams();
  const activeConversationId = params?.id as string | undefined;
  const queryClient = useQueryClient();
  const [userConversations, setUserConversations] = useState<
    UserConversation[]
  >([]);

  const fetchUserConversations = () => {
    if (session?.user) {
      ConversationService.fetchConversations()
        .then((conversations) => {
          const filtered = conversations.filter(
            (conv: UserConversation) => conv.authorId === session.user.id
          );
          setUserConversations(filtered);
        })
        .catch((error) =>
          console.error("Error fetching conversations:", error)
        );
    }
  };

  useEffect(() => {
    fetchUserConversations();
  }, [session?.user]);

  // Écouter les changements du cache "conversations" pour rafraîchir la sidebar
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.query?.queryKey?.[0] === "conversations" &&
        event.type === "updated"
      ) {
        fetchUserConversations();
      }
    });
    return unsubscribe;
  }, [session?.user, queryClient]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Déconnexion réussie");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogin = () => {
    router.push("/login");
  };
  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MessageSquare className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Forum</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Home />
                    <span>Conversations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {session?.user && userConversations.length > 0 && (
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <MessageSquare />
                        <span>Vos conversations</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {userConversations.slice(0, 5).map((conversation) => (
                          <SidebarMenuSubItem key={conversation.id}>
                            <div className="flex items-center gap-1 group/item">
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  activeConversationId === conversation.id
                                }
                                className="flex-1"
                              >
                                <Link
                                  href={`/conversations/${conversation.id}`}
                                >
                                  <span className="truncate">
                                    {conversation.title || "Sans titre"}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity pr-2">
                                <ConversationDeleteButton
                                  id={conversation.id}
                                  className="h-6 w-6"
                                />
                              </div>
                            </div>
                          </SidebarMenuSubItem>
                        ))}
                        {userConversations.length > 5 && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/?filter=mine">
                                <span className="text-xs italic">
                                  Voir toutes ({userConversations.length})
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <div className="flex items-center gap-2 p-2">
            <div className="size-8 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded animate-pulse" />
              <div className="h-2 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ) : session?.user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt="Profile-picture"
                            width={32}
                            height={32}
                          ></Image>
                        ) : (
                          getInitials(session.user.name)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 leading-none text-left">
                      <span className="font-semibold truncate">
                        {session.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${session.user.id}`}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" onClick={handleLogin}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                  <LogIn className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Se connecter</span>
                  <span className="text-xs text-muted-foreground">
                    Accédez à votre compte
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" onClick={handleSignup}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <UserPlus className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Créer un compte</span>
                  <span className="text-xs text-muted-foreground">
                    Rejoignez la communauté
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
