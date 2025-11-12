"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Lien de réinitialisation invalide");
      router.push("/login");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!token) {
      setError("Token manquant");
      return;
    }

    setIsLoading(true);

    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });
      toast.success("Mot de passe réinitialisé avec succès !");
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError(
        "Erreur lors de la réinitialisation. Le lien est peut-être expiré."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Forum
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-bold">
                  Réinitialiser votre mot de passe
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Entrez votre nouveau mot de passe
                </p>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="password">
                    Nouveau mot de passe
                  </FieldLabel>
                  {error && (
                    <p className="text-xs text-destructive font-medium -mb-2 -mt-3">
                      {error}
                    </p>
                  )}
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 caractères"
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
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    required
                    disabled={isLoading}
                    aria-invalid={!!error}
                    className={error ? "border-destructive" : ""}
                  />
                </Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Réinitialisation..."
                    : "Réinitialiser le mot de passe"}
                </Button>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="https://swiftheberg.com/images/DC2_datacenter.webp"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          width={1920}
          height={1080}
        />
      </div>
    </div>
  );
}
