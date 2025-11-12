import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  // Seulement pour le développement
  // advanced: {
  //   disableOriginCheck: true,
  // },
  trustedOrigins: ["http://localhost:3000"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
