import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth, isConversationOwner, getUserWithRole } from "@/lib/auth-utils";
import { canDeleteAnyConversation } from "@/lib/permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      messages: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(conversation);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Récupérer le rôle de l'utilisateur
    const userWithRole = await getUserWithRole(user.id);

    if (!userWithRole) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire OU a les permissions d'admin
    const isOwner = await isConversationOwner(user.id, id);
    const hasPermission = canDeleteAnyConversation(userWithRole.role);

    if (!isOwner && !hasPermission) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cette conversation" },
        { status: 403 }
      );
    }

    const conversation = await prisma.conversation.delete({
      where: { id },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la conversation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Vérifier que l'utilisateur est le propriétaire
    const isOwner = await isConversationOwner(user.id, id);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette conversation" },
        { status: 403 }
      );
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        title: body.title,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la modification de la conversation" },
      { status: 500 }
    );
  }
}
