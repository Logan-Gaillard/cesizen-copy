import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock next/headers (cookies) — inutilisé directement dans registerUser/loginUser
// mais importé via "use server"
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    })
  ),
}));

// Mock Prisma
vi.mock("@/libs/db", () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    session: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock argon2
vi.mock("argon2", () => ({
  default: {
    hash: vi.fn(async (pwd: string) => `hashed_${pwd}`),
    verify: vi.fn(async (hash: string, pwd: string) => hash === `hashed_${pwd}`),
    argon2id: 2,
  },
}));

// Mock getSessionUser (utilisé dans plusieurs actions)
vi.mock("@/libs/user.service", () => ({
  getSessionUser: vi.fn(),
}));

// ─── Imports après les mocks ──────────────────────────────────────────────────

import prisma from "@/libs/db";
import { getSessionUser } from "@/libs/user.service";
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  deleteUser,
  updateCurrentUserProfile,
  changeCurrentUserPassword,
} from "@/actions/user";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockPrismaUser = prisma.user as ReturnType<typeof vi.fn> & typeof prisma.user;
const mockPrismaSession = prisma.session as ReturnType<typeof vi.fn> & typeof prisma.session;
const mockGetSessionUser = getSessionUser as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── registerUser ─────────────────────────────────────────────────────────────

describe("registerUser", () => {
  it("unit-01 — inscription réussie avec données valides", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "uuid-123",
      nickname: "Logan",
      email: "logan@test.fr",
      pwdHash: "hashed_Abcdef1!",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await registerUser({
      nickname: "Logan",
      email: "logan@test.fr",
      password: "Abcdef1!",
      confirmPassword: "Abcdef1!",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe("uuid-123");
  });

  it("unit-02 — échec si les mots de passe ne correspondent pas", async () => {
    const result = await registerUser({
      nickname: "Logan",
      email: "logan@test.fr",
      password: "Abcdef1!",
      confirmPassword: "AutreMotDePasse!",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/mots de passe ne correspondent pas/i);
  });

  it("unit-03 — échec si le pseudo est déjà pris", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "uuid-existant",
      nickname: "Logan",
      email: "autre@test.fr",
      pwdHash: "hash",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await registerUser({
      nickname: "Logan",
      email: "nouveau@test.fr",
      password: "Abcdef1!",
      confirmPassword: "Abcdef1!",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/nom d'utilisateur/i);
  });

  it("unit-04 — échec si l'email est déjà utilisé", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "uuid-existant",
      nickname: "AutreNickname",
      email: "logan@test.fr",
      pwdHash: "hash",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await registerUser({
      nickname: "NouveauNickname",
      email: "logan@test.fr",
      password: "Abcdef1!",
      confirmPassword: "Abcdef1!",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/email/i);
  });
});

// ─── loginUser ────────────────────────────────────────────────────────────────

describe("loginUser", () => {
  it("unit-05 — connexion réussie avec identifiants valides", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "uuid-123",
      nickname: "Logan",
      email: "logan@test.fr",
      pwdHash: "hashed_Abcdef1!",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prisma.session.create).mockResolvedValue({
      id: "session-uuid",
      userId: "uuid-123",
      token: "token-abc",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await loginUser("logan@test.fr", "Abcdef1!", false);

    expect(result.success).toBe(true);
  });

  it("unit-06 — échec si l'email est inconnu", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await loginUser("inconnu@test.fr", "Abcdef1!", false);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/invalide/i);
  });

  it("unit-07 — échec si le mot de passe est incorrect", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "uuid-123",
      nickname: "Logan",
      email: "logan@test.fr",
      pwdHash: "hashed_Abcdef1!",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // argon2.verify retourne false car le hash ne correspond pas
    const result = await loginUser("logan@test.fr", "MauvaisMotDePasse!", false);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/invalide/i);
  });
});

// ─── getAllUsers ──────────────────────────────────────────────────────────────

describe("getAllUsers", () => {
  it("unit-08 — retourne la liste des utilisateurs si admin", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "admin-id", role: "admin", nickname: "Admin" });
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: "u1", nickname: "Alice", email: "alice@test.fr", role: "user" },
      { id: "u2", nickname: "Bob", email: "bob@test.fr", role: "user" },
    ]);

    const users = await getAllUsers();

    expect(users).toHaveLength(2);
    expect(users[0].nickname).toBe("Alice");
  });

  it("unit-09 — lève une erreur si non admin", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "user-id", role: "user", nickname: "User" });

    await expect(getAllUsers()).rejects.toThrow("Unauthorized");
  });

  it("unit-10 — lève une erreur si non connecté", async () => {
    mockGetSessionUser.mockResolvedValue(null);

    await expect(getAllUsers()).rejects.toThrow("Unauthorized");
  });
});

// ─── deleteUser ───────────────────────────────────────────────────────────────

describe("deleteUser", () => {
  it("unit-11 — supprime un utilisateur si admin", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "admin-id", role: "admin", nickname: "Admin" });
    vi.mocked(prisma.user.delete).mockResolvedValue({} as any);

    await expect(deleteUser("u1")).resolves.toBeUndefined();
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
  });

  it("unit-12 — lève une erreur si non admin", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "user-id", role: "user", nickname: "User" });

    await expect(deleteUser("u1")).rejects.toThrow("Unauthorized");
  });
});

// ─── updateCurrentUserProfile ─────────────────────────────────────────────────

describe("updateCurrentUserProfile", () => {
  it("unit-13 — mise à jour réussie du profil", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "uuid-123", role: "user", nickname: "Logan" });
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const result = await updateCurrentUserProfile({
      nickname: "NouveauNickname",
      email: "nouveau@test.fr",
    });

    expect(result.success).toBe(true);
  });

  it("unit-14 — échec si pseudo déjà pris par un autre utilisateur", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "uuid-123", role: "user", nickname: "Logan" });
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "autre-uuid",
      nickname: "NouveauNickname",
      email: "autre@test.fr",
      pwdHash: "hash",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateCurrentUserProfile({
      nickname: "NouveauNickname",
      email: "logan@test.fr",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/pseudo/i);
  });
});

// ─── changeCurrentUserPassword ────────────────────────────────────────────────

describe("changeCurrentUserPassword", () => {
  it("unit-15 — changement de mot de passe réussi", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "uuid-123", role: "user", nickname: "Logan" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "uuid-123",
      nickname: "Logan",
      email: "logan@test.fr",
      pwdHash: "hashed_AncienMdp1!",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const result = await changeCurrentUserPassword({
      currentPassword: "AncienMdp1!",
      newPassword: "NouveauMdp1!",
      confirmPassword: "NouveauMdp1!",
    });

    expect(result.success).toBe(true);
  });

  it("unit-16 — échec si les nouveaux mots de passe ne correspondent pas", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "uuid-123", role: "user", nickname: "Logan" });

    const result = await changeCurrentUserPassword({
      currentPassword: "AncienMdp1!",
      newPassword: "NouveauMdp1!",
      confirmPassword: "Différent1!",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/ne correspondent pas/i);
  });

  it("unit-17 — échec si le nouveau mdp est identique à l'ancien", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "uuid-123", role: "user", nickname: "Logan" });

    const result = await changeCurrentUserPassword({
      currentPassword: "MêmeMdp1!",
      newPassword: "MêmeMdp1!",
      confirmPassword: "MêmeMdp1!",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/différent/i);
  });

  it("unit-18 — échec si l'ancien mot de passe est incorrect", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "uuid-123", role: "user", nickname: "Logan" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "uuid-123",
      nickname: "Logan",
      email: "logan@test.fr",
      pwdHash: "hashed_AncienMdp1!",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await changeCurrentUserPassword({
      currentPassword: "MauvaisAncienMdp!",
      newPassword: "NouveauMdp1!",
      confirmPassword: "NouveauMdp1!",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/incorrect/i);
  });
});