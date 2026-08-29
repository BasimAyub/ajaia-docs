export const seededUsers = [
  { id: "daniel", name: "Daniel Park", email: "daniel@ajaia.test", color: "#355e4b" },
  { id: "maya", name: "Maya Singh", email: "maya@ajaia.test", color: "#b46a55" },
  { id: "elena", name: "Elena Rossi", email: "elena@ajaia.test", color: "#6d8fc4" }
] as const;

export type SeededUserId = (typeof seededUsers)[number]["id"];
export const DEFAULT_DEMO_USER_ID: SeededUserId = "daniel";

export function isSeededUserId(value: string | undefined): value is SeededUserId {
  return Boolean(value && seededUsers.some((user) => user.id === value));
}

export function getSeededUser(userId: string) {
  return seededUsers.find((user) => user.id === userId) ?? seededUsers[0];
}
