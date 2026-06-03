/**
 * OPENALGON CRM — Lead Assignment Engine
 *
 * Supports 4 strategies from PRD:
 * - round_robin: cycles through active sales executives in sequence
 * - weighted: distributes proportionally based on user.weight
 * - team: assigns to all members of a specified role/team
 * - manual: direct assignment to a specific user
 */
import { prismadb as prisma } from "@/lib/prisma";

export type AssignmentStrategy = "round_robin" | "weighted" | "manual" | "team";

export interface AssignmentOptions {
  organizationId?: string;
  targetUserId?: string; // for manual strategy
  teamRole?: string;     // for team strategy (e.g. "salesExecutive")
  assignedById?: string; // who is triggering the assignment
}

export interface AssignmentResult {
  assignedTo: string;
  strategy: AssignmentStrategy;
  assignmentId: string;
}

/**
 * Main assignment function — picks the right user and writes an assignment record.
 */
export async function assignLead(
  leadId: string,
  strategy: AssignmentStrategy,
  options: AssignmentOptions = {}
): Promise<AssignmentResult> {
  let targetUserId: string;

  switch (strategy) {
    case "manual":
      if (!options.targetUserId) {
        throw new Error("manual strategy requires targetUserId");
      }
      targetUserId = options.targetUserId;
      break;

    case "round_robin":
      targetUserId = await roundRobin(options.organizationId);
      break;

    case "weighted":
      targetUserId = await weighted(options.organizationId);
      break;

    case "team":
      targetUserId = await teamBased(
        options.teamRole ?? "user",
        options.organizationId
      );
      break;

    default:
      throw new Error(`Unknown assignment strategy: ${strategy}`);
  }

  // Write the assignment record
  const assignment = await prisma.leadAssignment.create({
    data: {
      leadId,
      assignedTo: targetUserId,
      assignedBy: options.assignedById,
      strategy,
    },
  });

  // Update the lead's assigned_to field
  await prisma.crm_Leads.update({
    where: { id: leadId },
    data: { assigned_to: targetUserId },
  });

  return {
    assignedTo: targetUserId,
    strategy,
    assignmentId: assignment.id,
  };
}

// ---------------------------------------------------------------------------
// Strategy implementations
// ---------------------------------------------------------------------------

/**
 * Round Robin — advances through active sales executives in order.
 * Uses round_robin_index on the Users table to track position.
 */
async function roundRobin(organizationId?: string): Promise<string> {
  const where = {
    userStatus: "ACTIVE" as const,
    role: "user" as const,
    ...(organizationId ? { organization_id: organizationId } : {}),
  };

  const users = await prisma.users.findMany({
    where,
    orderBy: { round_robin_index: "asc" },
    select: { id: true, round_robin_index: true },
  });

  if (users.length === 0) {
    throw new Error("No active sales executives available for round-robin assignment");
  }

  // Pick the user with the lowest index (least recently assigned)
  const selected = users[0];

  // Increment their index so next time someone else gets picked
  await prisma.users.update({
    where: { id: selected.id },
    data: { round_robin_index: selected.round_robin_index + 1 },
  });

  return selected.id;
}

/**
 * Weighted — distributes leads proportionally based on user.weight.
 * Higher weight = more leads.
 */
async function weighted(organizationId?: string): Promise<string> {
  const where = {
    userStatus: "ACTIVE" as const,
    role: "user" as const,
    ...(organizationId ? { organization_id: organizationId } : {}),
  };

  const users = await prisma.users.findMany({
    where,
    select: { id: true, weight: true },
  });

  if (users.length === 0) {
    throw new Error("No active sales executives available for weighted assignment");
  }

  // Build weighted pool — each user appears `weight` times
  const pool: string[] = [];
  for (const user of users) {
    for (let i = 0; i < (user.weight ?? 1); i++) {
      pool.push(user.id);
    }
  }

  // Pick random from weighted pool
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * Team-based — assigns to the first available member of a given role.
 * Useful for dedicated teams (e.g., "enterprise sales").
 */
async function teamBased(role: string, organizationId?: string): Promise<string> {
  const where = {
    userStatus: "ACTIVE" as const,
    role: role as any,
    ...(organizationId ? { organization_id: organizationId } : {}),
  };

  const users = await prisma.users.findMany({
    where,
    orderBy: { round_robin_index: "asc" },
    select: { id: true, round_robin_index: true },
    take: 1,
  });

  if (users.length === 0) {
    throw new Error(`No active users with role "${role}" available for team assignment`);
  }

  const selected = users[0];

  // Also advance round-robin index for team members
  await prisma.users.update({
    where: { id: selected.id },
    data: { round_robin_index: selected.round_robin_index + 1 },
  });

  return selected.id;
}
