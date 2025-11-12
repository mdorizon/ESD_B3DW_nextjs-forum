"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // États pour l'édition du profil
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Stocker les valeurs initiales pour comparer les changements
  const [initialValues, setInitialValues] = useState({
    name: "",
    bio: "",
    image: "",
  });

  // Récupérer les données complètes de l'utilisateur depuis l'API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      setIsLoadingProfile(true);
      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        const values = {
          name: userData.name || "",
          bio: userData.bio || "",
          image: userData.image || "",
        };

        setName(values.name);
        setBio(values.bio);
        setImage(values.image);
        setInitialValues(values);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  // Vérifier si des changements ont été effectués
  useEffect(() => {
    const hasChanged =
      name !== initialValues.name ||
      bio !== initialValues.bio ||
      image !== initialValues.image;
    setHasChanges(hasChanged);
  }, [name, bio, image, initialValues]);

  const handleResetPassword = async () => {
    if (!session?.user?.email) {
      toast.error("Email non disponible");
      return;
    }

    setIsLoading(true);

    try {
      await authClient.forgetPassword({
        email: session.user.email,
        redirectTo: "/reset-password",
      });
      toast.success(
        "Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."
      );
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          bio,
          image,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }

      const updatedUser = await response.json();
      console.log("Profile updated successfully:", updatedUser);

      // Mettre à jour les valeurs initiales avec les nouvelles données
      const newValues = {
        name: updatedUser.name || "",
        bio: updatedUser.bio || "",
        image: updatedUser.image || "",
      };
      setInitialValues(newValues);

      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setIsSaving(false);
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

  if (isPending || isLoadingProfile) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="border rounded-lg p-6 space-y-4">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-24 bg-muted rounded-full w-24" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Paramètres du compte</h1>
        <Link href={`/users/${session?.user?.id}`}>
          <Button variant="outline" className="gap-2">
            <Eye className="size-4" />
            Voir mon profil
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Section édition du profil */}
        <form onSubmit={handleSaveProfile} className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mon profil</h2>

          <FieldGroup>
            {/* Avatar */}
            <Field>
              <FieldLabel>Photo de profil</FieldLabel>
              <div className="flex items-center gap-4">
                <Avatar className="size-24 rounded-full">
                  <AvatarFallback className="rounded-full text-2xl">
                    {image ? (
                      <Image
                        src={image}
                        alt={name}
                        width={96}
                        height={96}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      getInitials(name || "User")
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="URL de l'image (https://...)"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez l&apos;URL d&apos;une image pour votre avatar
                  </p>
                </div>
              </div>
            </Field>

            {/* Nom */}
            <Field>
              <FieldLabel htmlFor="name">Nom</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSaving}
                minLength={2}
              />
            </Field>

            {/* Bio */}
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                placeholder="Parlez un peu de vous..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSaving}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {bio.length}/500 caractères
              </p>
            </Field>

            {/* Email (non modifiable) */}
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                L&apos;email ne peut pas être modifié
              </p>
            </Field>

            {/* Bouton de sauvegarde */}
            <Button type="submit" disabled={isSaving || !hasChanges}>
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </FieldGroup>
        </form>

        {/* Section réinitialisation de mot de passe */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Réinitialisation du mot de passe
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Recevez un lien de réinitialisation à l&apos;adresse{" "}
            <span className="font-medium">{session?.user?.email}</span>
          </p>
          <Button onClick={handleResetPassword} disabled={isLoading}>
            {isLoading
              ? "Envoi en cours..."
              : "Envoyer le lien de réinitialisation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
