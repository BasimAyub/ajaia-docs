import { cookies } from "next/headers";
import { prisma } from "./db";
import { DEFAULT_DEMO_USER_ID, isSeededUserId } from "./users";

export const USER_COOKIE = "ajaia_user_id";

export async function getCurrentDemoUser() {
  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get(USER_COOKIE)?.value;
  const userId = isSeededUserId(cookieUserId) ? cookieUserId : DEFAULT_DEMO_USER_ID;

  const selectedUser = await prisma.user.findUnique({ where: { id: userId } });
  if (selectedUser) {
    return selectedUser;
  }

  if (userId === DEFAULT_DEMO_USER_ID) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: DEFAULT_DEMO_USER_ID } });
}

export async function getCurrentUserId() {
  const user = await getCurrentDemoUser();
  return user?.id ?? DEFAULT_DEMO_USER_ID;
}
