import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Role } from "@/generated/prisma";

export function useUserRole() {
  const { data: session } = useSession();
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.id) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setRole(userData.role || Role.USER);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(Role.USER);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [session?.user?.id]);

  return { role, isLoading };
}
