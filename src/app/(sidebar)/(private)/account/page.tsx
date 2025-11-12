"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function AccountPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Paramètres du compte</h1>

      <div className="space-y-6">
        {/* Section informations utilisateur */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Email:</span> {session?.user?.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Nom:</span>{" "}
              {session?.user?.name || "Non défini"}
            </p>
          </div>
        </div>

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
