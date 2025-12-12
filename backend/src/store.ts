import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { UserRecord } from "./types";

export async function createUser(
  email: string,
  password: string,
  fullName: string,
  role: UserRecord["role"]
): Promise<UserRecord> {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      role,
    },
  });
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    fullName: user.fullName,
    role: user.role,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    fullName: user.fullName,
    role: user.role,
  };
}

export async function verifyUser(
  email: string,
  password: string
): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const matches = await bcrypt.compare(password, user.passwordHash);
  return matches ? user : null;
}

// Seed demo user for quick start
void (async () => {
  const demoEmail = "advisor@example.com";
  const exists = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!exists) {
    await createUser(demoEmail, "Password123!", "Demo Advisor", "advisor");
  }
})();

