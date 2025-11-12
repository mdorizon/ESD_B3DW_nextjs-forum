import { Role } from "@/generated/prisma";

export function canDeleteMessage(userRole: Role): boolean {
  return userRole === Role.MODERATOR || userRole === Role.ADMIN;
}

export function canDeleteAnyConversation(userRole: Role): boolean {
  return userRole === Role.ADMIN;
}

export function isAdmin(userRole: Role): boolean {
  return userRole === Role.ADMIN;
}

export function isModerator(userRole: Role): boolean {
  return userRole === Role.MODERATOR;
}

export function isModeratorOrAdmin(userRole: Role): boolean {
  return userRole === Role.MODERATOR || userRole === Role.ADMIN;
}
