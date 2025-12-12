export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: "advisor" | "client" | "admin";
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: UserRecord["role"];
};

