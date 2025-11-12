"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signIn, authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm({
  className,
  onSuccess,
  ...props
}: React.ComponentProps<"form"> & { onSuccess?: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError("Utilisateur ou mot de passe incorrect");
      } else {
        toast.success("Connexion réussie");
        router.push("/");
        setEmail("");
        setPassword("");
        onSuccess?.();
      }
    } catch {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    setIsResetLoading(true);

    try {
      await authClient.forgetPassword({
        email: resetEmail,
        redirectTo: "/reset-password",
      });
      toast.success(
        "Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."
      );
      setResetEmail("");
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        <Dialog>
          <DialogHeader>
            <DialogTitle>Connexion</DialogTitle>
            <DialogDescription>
              Entrez vos identifiants pour vous connecter
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              {error && (
                <p className="text-xs text-destructive font-medium -mb-2 -mt-3">
                  {error}
                </p>
              )}
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                disabled={isLoading}
                aria-invalid={!!error}
                className={error ? "border-destructive" : ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                disabled={isLoading}
                aria-invalid={!!error}
                className={error ? "border-destructive" : ""}
              />
              <div
                className="text-blue-500 underline underline-offset-2 text-sm -mt-3 cursor-pointer"
                onClick={() => setIsResetDialogOpen(true)}
              >
                Mot de passe oublié ?
              </div>
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </Field>
            <div className="-mt-5 text-sm">
              Vous n&apos;avez pas encore de compte ?{" "}
              <Link
                href={"/signup"}
                className="text-blue-500 underline underline-offset-2"
              >
                Créez en un
              </Link>
            </div>
          </FieldGroup>
        </Dialog>
      </form>

      {/* Dialog pour la réinitialisation du mot de passe */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mot de passe oublié</DialogTitle>
            <DialogDescription>
              Entrez votre adresse email pour recevoir un lien de
              réinitialisation
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={isResetLoading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isResetLoading}>
                  {isResetLoading
                    ? "Envoi en cours..."
                    : "Envoyer le lien de réinitialisation"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
