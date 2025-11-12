import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Compter les conversations créées
  const conversationsCount = await prisma.conversation.count({
    where: { authorId: id },
  });

  // Compter les messages envoyés
  const messagesCount = await prisma.message.count({
    where: { authorId: id },
  });

  // Récupérer les dernières conversations où l'utilisateur a participé
  const recentConversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { authorId: id },
        {
          messages: {
            some: {
              authorId: id,
            },
          },
        },
      ],
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      messages: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10,
  });

  return NextResponse.json({
    conversationsCount,
    messagesCount,
    recentConversations: recentConversations.map((conv) => ({
      ...conv,
      messagesCount: conv.messages.length,
    })),
  });
}
