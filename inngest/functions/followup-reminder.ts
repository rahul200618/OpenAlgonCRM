import { inngest } from "../client";
import { prismadb as prisma } from "@/lib/prisma";
import sendEmail from "@/lib/sendmail";

export const followupReminder = inngest.createFunction(
  { id: "followup-reminder", name: "Follow-up Reminder", triggers: [{ cron: "0 8 * * *" }] },
  async ({ step }) => {
    const dueLimit = new Date();
    dueLimit.setHours(dueLimit.getHours() + 24);

    const followups = await step.run("fetch-due-followups", async () => {
      return await prisma.followup.findMany({
        where: {
          status: "pending",
          followupDate: {
            lte: dueLimit,
            gte: new Date(),
          },
        },
        include: {
          lead: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
            },
          },
        },
      });
    });

    if (followups.length === 0) {
      return { message: "No follow-ups due in next 24 hours" };
    }

    const emailResults = await step.run("send-reminder-emails", async () => {
      const results = [];

      for (const followup of followups) {
        const user = await prisma.users.findUnique({
          where: { id: followup.assignedUser },
          select: { email: true, name: true, userLanguage: true },
        });

        if (!user || !user.email) continue;

        const leadName = `${followup.lead?.firstName || ""} ${followup.lead?.lastName || "Client"}`.trim();
        const formattedDate = new Date(followup.followupDate).toLocaleString();

        const subject =
          user.userLanguage === "en"
            ? `Reminder: Lead Follow-up with ${leadName} due`
            : `Připomenutí: Kontakt s ${leadName} se blíží`;

        const text =
          user.userLanguage === "en"
            ? `Hello ${user.name},\n\nThis is a reminder that you have a scheduled follow-up with ${leadName} on ${formattedDate}.\n\nNote: ${followup.note || "No details provided"}\n\nView Lead: ${process.env.NEXT_PUBLIC_APP_URL}/crm/leads/${followup.leadId}\n\nBest regards,\nOPENALGON CRM`
            : `Dobrý den ${user.name},\n\nToto je připomenutí, že máte naplánovaný kontakt s klientem ${leadName} dne ${formattedDate}.\n\nPoznámka: ${followup.note || "Žádné detaily"}\n\nZobrazit příležitost: ${process.env.NEXT_PUBLIC_APP_URL}/crm/leads/${followup.leadId}\n\nS pozdravem,\nOPENALGON CRM`;

        try {
          await sendEmail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject,
            text,
          });
          results.push({ id: followup.id, status: "sent" });
        } catch (err: any) {
          results.push({ id: followup.id, status: "failed", error: err.message });
        }
      }

      return results;
    });

    return { processed: followups.length, details: emailResults };
  }
);
