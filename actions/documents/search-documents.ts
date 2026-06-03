"use server";
import {
  requireAuthenticated,
  documentReadScopeWhere,
  filterAuthorizedDocumentIds,
  AuthenticationError,
} from "@/lib/authz";
import { prismadb } from "@/lib/prisma";


export interface DocumentSearchResult {
  id: string;
  name: string;
  summary: string | null;
  systemType: string | null;
  accountName: string | null;
}

export async function searchDocuments(
  query: string
): Promise<DocumentSearchResult[]> {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }
  if (!query || query.trim().length < 2) return [];

  // Keyword search — scope OR (visibility/ownership) goes at top level;
  // user-supplied search OR moves into AND so it cannot replace the scope OR.
  const kwResults = await prismadb.documents.findMany({
    where: {
      parent_document_id: null,
      ...documentReadScopeWhere(user),
      deletedAt: null,
      AND: [
        {
          OR: [
            { document_name: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 5,
    select: {
      id: true,
      document_name: true,
      summary: true,
      document_system_type: true,
      accounts: { select: { account: { select: { name: true } } }, take: 1 },
    },
  });

  // Semantic search via raw pgvector. Apply post-filter for authz.
  let semResults: { id: string; similarity: number }[] = [];

  // Merge: keyword results first, then semantic-only results
  const kwIds = new Set(kwResults.map((r) => r.id));
  const semOnlyIds = semResults.filter((r) => !kwIds.has(r.id)).map((r) => r.id);

  let extraDocs: typeof kwResults = [];
  if (semOnlyIds.length > 0) {
    extraDocs = await prismadb.documents.findMany({
      where: { id: { in: semOnlyIds }, parent_document_id: null, deletedAt: null },
      select: {
        id: true,
        document_name: true,
        summary: true,
        document_system_type: true,
        accounts: { select: { account: { select: { name: true } } }, take: 1 },
      },
    });
  }

  return [...kwResults, ...extraDocs].map((r) => ({
    id: r.id,
    name: r.document_name,
    summary: r.summary,
    systemType: r.document_system_type,
    accountName: r.accounts?.[0]?.account?.name ?? null,
  }));
}
