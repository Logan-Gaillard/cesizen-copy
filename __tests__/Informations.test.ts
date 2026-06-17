import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    })
  ),
}));

vi.mock("@/libs/db", () => ({
  default: {
    information: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/libs/user.service", () => ({
  getSessionUser: vi.fn(),
}));

// ─── Imports après les mocks ──────────────────────────────────────────────────

import prisma from "@/libs/db";
import { getSessionUser } from "@/libs/user.service";
import {
  createActu,
  getAllActus,
  getActuById,
  deleteActu,
  updateActu,
} from "@/actions/information";

const mockGetSessionUser = getSessionUser as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Données de test ──────────────────────────────────────────────────────────

const mockActuDb = {
  id: "info-uuid-1",
  userId: "admin-uuid",
  title: "Titre test",
  description: "Description test",
  content: "Contenu de test suffisamment long pour calculer un readTime.",
  imageURL: "https://example.com/img.png",
  category: "Santé mentale",
  readTime: "1 min",
  createdAt: new Date("2026-01-01T10:00:00Z"),
  updatedAt: new Date("2026-01-01T10:00:00Z"),
};

const mockActuInput = {
  title: "Titre test",
  description: "Description test",
  content: "Contenu de test suffisamment long pour calculer un readTime.",
  imageURL: "https://example.com/img.png",
  category: "Santé mentale",
};

// ─── createActu ───────────────────────────────────────────────────────────────

describe("createActu", () => {
  it("unit-19 — crée une information si l'utilisateur est connecté", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "admin-uuid", role: "admin", nickname: "Admin" });
    vi.mocked(prisma.information.create).mockResolvedValue(mockActuDb);

    await expect(createActu(mockActuInput)).resolves.toBeUndefined();
    expect(prisma.information.create).toHaveBeenCalledOnce();
  });

  it("unit-20 — lève une erreur si l'utilisateur n'est pas connecté", async () => {
    mockGetSessionUser.mockResolvedValue(null);

    await expect(createActu(mockActuInput)).rejects.toThrow("User not authenticated");
    expect(prisma.information.create).not.toHaveBeenCalled();
  });

  it("unit-21 — le readTime est calculé et non nul", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "admin-uuid", role: "admin", nickname: "Admin" });
    vi.mocked(prisma.information.create).mockResolvedValue(mockActuDb);

    await createActu(mockActuInput);

    const callArg = vi.mocked(prisma.information.create).mock.calls[0][0];
    expect(callArg.data.readTime).toBeTruthy();
    expect(callArg.data.readTime).toMatch(/\d+ min/);
  });
});

// ─── getAllActus ───────────────────────────────────────────────────────────────

describe("getAllActus", () => {
  it("unit-22 — retourne les informations triées du plus récent au plus ancien", async () => {
    const actus = [
      { ...mockActuDb, id: "info-1", createdAt: new Date("2026-03-01") },
      { ...mockActuDb, id: "info-2", createdAt: new Date("2026-01-01") },
    ];
    vi.mocked(prisma.information.findMany).mockResolvedValue(actus);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: "admin-uuid", nickname: "Admin", email: "admin@test.fr", pwdHash: "h", role: "admin", createdAt: new Date(), updatedAt: new Date() },
    ]);

    const result = await getAllActus();

    expect(result).toHaveLength(2);
    // Le premier retourné par Prisma est le plus récent (orderBy desc dans l'action)
    expect(result[0].id).toBe("info-1");
  });

  it("unit-23 — retourne un tableau vide si aucune information en base", async () => {
    vi.mocked(prisma.information.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const result = await getAllActus();

    expect(result).toEqual([]);
  });

  it("unit-24 — l'auteur est 'Non renseigné' si userId ne correspond à aucun user", async () => {
    vi.mocked(prisma.information.findMany).mockResolvedValue([mockActuDb]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]); // aucun user trouvé

    const result = await getAllActus();

    expect(result[0].author).toBe("Non renseigné");
  });
});

// ─── getActuById ──────────────────────────────────────────────────────────────

describe("getActuById", () => {
  it("unit-25 — retourne l'information correspondant à l'ID", async () => {
    vi.mocked(prisma.information.findUnique).mockResolvedValue(mockActuDb);

    const result = await getActuById("info-uuid-1");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("info-uuid-1");
    expect(result?.title).toBe("Titre test");
  });

  it("unit-26 — retourne null si l'ID n'existe pas", async () => {
    vi.mocked(prisma.information.findUnique).mockResolvedValue(null);

    const result = await getActuById("id-inexistant");

    expect(result).toBeNull();
  });
});

// ─── deleteActu ───────────────────────────────────────────────────────────────

describe("deleteActu", () => {
  it("unit-27 — supprime l'information correspondant à l'ID", async () => {
    vi.mocked(prisma.information.delete).mockResolvedValue(mockActuDb);

    await expect(deleteActu("info-uuid-1")).resolves.toBeUndefined();
    expect(prisma.information.delete).toHaveBeenCalledWith({
      where: { id: "info-uuid-1" },
    });
  });
});

// ─── updateActu ───────────────────────────────────────────────────────────────

describe("updateActu", () => {
  it("unit-28 — met à jour une information existante", async () => {
    vi.mocked(prisma.information.update).mockResolvedValue(mockActuDb);

    await expect(
      updateActu("info-uuid-1", {
        ...mockActuInput,
        title: "Titre modifié",
      })
    ).resolves.toBeUndefined();

    expect(prisma.information.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "info-uuid-1" },
        data: expect.objectContaining({ title: "Titre modifié" }),
      })
    );
  });

  it("unit-29 — recalcule le readTime lors de la mise à jour", async () => {
    vi.mocked(prisma.information.update).mockResolvedValue(mockActuDb);

    await updateActu("info-uuid-1", {
      ...mockActuInput,
      content: "Un contenu bien plus long que l'original pour vérifier le recalcul du temps de lecture estimé.",
    });

    const callArg = vi.mocked(prisma.information.update).mock.calls[0][0];
    expect(callArg.data.readTime).toMatch(/\d+ min/);
  });
});