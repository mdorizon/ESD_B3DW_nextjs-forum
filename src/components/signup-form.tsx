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
} from "@/components/ui/dialog";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm({
  className,
  onSuccess,
  ...props
}: React.ComponentProps<"form"> & { onSuccess?: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError("");
    setPasswordError("");

    // Validation côté client
    if (password.length < 8) {
      setPasswordError("Mot de passe trop court (minimum 8 caractères)");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        // Vérifier si c'est une erreur d'email déjà utilisé
        if (
          result.error.message?.toLowerCase().includes("email") ||
          result.error.message?.toLowerCase().includes("exists") ||
          result.error.message?.toLowerCase().includes("already")
        ) {
          setEmailError("Email déjà utilisé");
        } else if (result.error.message?.toLowerCase().includes("password")) {
          setPasswordError(result.error.message);
        } else {
          setEmailError(result.error.message || "Erreur lors de l'inscription");
        }
      } else {
        toast.success("Compte créé avec succès");
        router.push("/");
        setEmail("");
        setPassword("");
        setName("");
        onSuccess?.();
      }
    } catch {
      setEmailError("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <Dialog>
        <DialogHeader>
          <DialogTitle>Créer un compte</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire pour créer votre compte
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Nom</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
              disabled={isLoading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            {emailError && (
              <p className="text-xs text-destructive font-medium -mb-2 -mt-3">
                {emailError}
              </p>
            )}
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              required
              disabled={isLoading}
              aria-invalid={!!emailError}
              className={emailError ? "border-destructive" : ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            {passwordError && (
              <p className="text-xs text-destructive font-medium -mb-2 -mt-3">
                {passwordError}
              </p>
            )}
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              required
              disabled={isLoading}
              aria-invalid={!!passwordError}
              className={passwordError ? "border-destructive" : ""}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer un compte"}
            </Button>
          </Field>
          <div className="-mt-5 text-sm">
            Vous avez déjà un compte ?{" "}
            <Link
              href={"/login"}
              className="text-blue-500 underline underline-offset-2"
            >
              Connectez vous
            </Link>
          </div>
        </FieldGroup>
      </Dialog>
    </form>
  );
}
