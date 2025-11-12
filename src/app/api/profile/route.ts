import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { name, bio, image } = body;

    // Validation basique
    if (name && name.trim().length < 2) {
      return NextResponse.json(
        { error: "Le nom doit contenir au moins 2 caractères" },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: "La bio ne peut pas dépasser 500 caractères" },
        { status: 400 }
      );
    }

    // Préparer les données à mettre à jour
    const dataToUpdate: {
      name?: string;
      bio?: string | null;
      image?: string | null;
    } = {};

    if (name !== undefined) {
      dataToUpdate.name = name.trim();
    }
    if (bio !== undefined) {
      dataToUpdate.bio = bio.trim() === "" ? null : bio.trim();
    }
    if (image !== undefined) {
      dataToUpdate.image = image.trim() === "" ? null : image.trim();
    }

    console.log("Updating user with data:", dataToUpdate);

    // Mettre à jour le profil
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
      },
    });

    console.log("Updated user:", updatedUser);

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
