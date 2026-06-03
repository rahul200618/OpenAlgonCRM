const mockRequireAuthenticated = jest.fn();

jest.mock("@/lib/authz", () => {
  class AuthenticationError extends Error {}

  return {
    AuthenticationError,
    requireAuthenticated: (...args: unknown[]) =>
      mockRequireAuthenticated(...args),
  };
});
jest.mock("@/lib/prisma", () => ({
  prismadb: {
    users: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    crm_Accounts: { findMany: jest.fn().mockResolvedValue([]) },
    crm_Contacts: { findMany: jest.fn().mockResolvedValue([]) },
    crm_Leads: { findMany: jest.fn().mockResolvedValue([]) },
    crm_Opportunities: { findMany: jest.fn().mockResolvedValue([]) },
    boards: { findMany: jest.fn().mockResolvedValue([]) },
    tasks: { findMany: jest.fn().mockResolvedValue([]) },
    documents: { findMany: jest.fn().mockResolvedValue([]) },
    $queryRaw: jest.fn().mockResolvedValue([]),
  },
}));

import { prismadb } from "@/lib/prisma";
import { unifiedSearch } from "../unified-search";

const userFind = prismadb.users.findMany as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("unifiedSearch user-directory gating", () => {
  it("user role: users facet returns empty without hitting users.findMany", async () => {
    mockRequireAuthenticated.mockResolvedValue({ id: "u1", role: "user" });

    const result = (await unifiedSearch("hello", "en")) as any;
    expect(result.error).toBeUndefined();
    expect(result.users).toEqual([]);
    expect(userFind).not.toHaveBeenCalled();
  });
});
