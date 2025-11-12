import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";

// Récupère la session de l'utilisateur actuel
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

// Récupère l'utilisateur actuellement connecté
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

// Récupère l'utilisateur complet avec son rôle depuis la base de données
export async function getUserWithRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  return user;
}

// Vérifie si l'utilisateur est le propriétaire d'une ressource
export async function isOwner(userId: string, resourceAuthorId: string) {
  return userId === resourceAuthorId;
}

// Vérifie si l'utilisateur est le propriétaire d'une conversation
export async function isConversationOwner(
  userId: string,
  conversationId: string
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { authorId: true },
  });

  if (!conversation) {
    return false;
  }

  return isOwner(userId, conversation.authorId);
}

// Vérifie si l'utilisateur est le propriétaire d'un message
export async function isMessageOwner(userId: string, messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { authorId: true },
  });

  if (!message) {
    return false;
  }

  return isOwner(userId, message.authorId);
}

// Vérifie les permissions et lance une erreur si non autorisé
export async function requireOwnership(
  userId: string,
  resourceAuthorId: string
) {
  if (!(await isOwner(userId, resourceAuthorId))) {
    throw new Error("Forbidden");
  }
}
