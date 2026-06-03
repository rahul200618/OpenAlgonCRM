jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: <T extends (...a: unknown[]) => unknown>(fn: T) => fn,
}));

const mockRequireAuthenticated = jest.fn();

jest.mock("@/lib/authz", () => {
  class AuthenticationError extends Error {}

  return {
    AuthenticationError,
    requireAuthenticated: (...args: unknown[]) =>
      mockRequireAuthenticated(...args),
    documentReadScopeWhere: (user: { id: string; role: string }) =>
      user.role === "user"
        ? {
            OR: [
              { createdBy: user.id },
              { owner_id: user.id },
              { visibility: "PUBLIC" },
            ],
          }
        : {},
    filterAuthorizedDocumentIds: jest.fn(async (_user, ids: string[]) => ids),
  };
});

jest.mock("@/lib/prisma", () => ({
  prismadb: {
    users: { findUnique: jest.fn() },
    documents: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));

import { prismadb } from "@/lib/prisma";
import { searchDocuments } from "@/actions/documents/search-documents";

const mockUser = (role: "user" | "manager" | "admin", id = "u1") => {
  mockRequireAuthenticated.mockResolvedValue({ id, role });
  (prismadb.users.findUnique as jest.Mock).mockResolvedValue({ id, role });
};

describe("searchDocuments scope", () => {
  beforeEach(() => jest.clearAllMocks());

  it("unauthenticated returns [] and does not query", async () => {
    const { AuthenticationError } = jest.requireMock("@/lib/authz");
    mockRequireAuthenticated.mockRejectedValue(new AuthenticationError());
    const res = await searchDocuments("foo");
    expect(res).toEqual([]);
    expect(prismadb.documents.findMany).not.toHaveBeenCalled();
  });

  it("user role: keyword findMany where includes parent_document_id:null + deletedAt:null + OR scope + search OR", async () => {
    mockUser("user", "u1");
    (prismadb.documents.findMany as jest.Mock).mockResolvedValue([]);
    (prismadb.$queryRaw as jest.Mock).mockResolvedValue([]);
    await searchDocuments("invoice");
    const call = (prismadb.documents.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.parent_document_id).toBeNull();
    expect(call.where.deletedAt).toBeNull();
    expect(Array.isArray(call.where.OR)).toBe(true);
    expect(call.where.AND).toBeDefined();

    const andClauses = call.where.AND as Array<{ OR?: unknown[] }>;
    const searchClause = andClauses.find(
      (c) =>
        Array.isArray(c.OR) &&
        c.OR.some((x: any) => x.document_name)
    );
    expect(searchClause).toBeDefined();
  });

  it("manager: keyword findMany where = parent_document_id:null + deletedAt:null + AND[search OR]", async () => {
    mockUser("manager", "m1");
    (prismadb.documents.findMany as jest.Mock).mockResolvedValue([]);
    (prismadb.$queryRaw as jest.Mock).mockResolvedValue([]);
    await searchDocuments("invoice");
    const call = (prismadb.documents.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.parent_document_id).toBeNull();
    expect(call.where.deletedAt).toBeNull();
    expect(call.where.OR).toBeUndefined();
  });

  it("does not run semantic search while vector search is disabled", async () => {
    mockUser("user", "u1");
    (prismadb.documents.findMany as jest.Mock).mockResolvedValue([]);

    const res = await searchDocuments("foo");
    expect(res).toEqual([]);
    expect(prismadb.$queryRaw).not.toHaveBeenCalled();
    expect(prismadb.documents.findMany).toHaveBeenCalledTimes(1);
  });
});
