import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isMessageOwner, getUserWithRole } from "@/lib/auth-utils";
import { canDeleteMessage } from "@/lib/permissions";

export async function DELETE(
  _request: NextRequest,
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

    // Vérifier que l'utilisateur est le propriétaire OU a les permissions de modérateur/admin
    const isOwner = await isMessageOwner(user.id, id);
    const hasPermission = canDeleteMessage(userWithRole.role);

    if (!isOwner && !hasPermission) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce message" },
        { status: 403 }
      );
    }

    const deletedMessage = await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json(deletedMessage);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la suppression du message" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Vérifier que l'utilisateur est le propriétaire
    const isOwner = await isMessageOwner(user.id, id);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce message" },
        { status: 403 }
      );
    }

    const message = await prisma.message.update({
      where: { id },
      data: {
        content: body.content,
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

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la modification du message" },
      { status: 500 }
    );
  }
}
