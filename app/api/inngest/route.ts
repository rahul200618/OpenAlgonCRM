import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { emailSyncAll } from "@/inngest/functions/emails/sync-all";
import { emailSyncAccount } from "@/inngest/functions/emails/sync-account";
import { emailLinkCrm } from "@/inngest/functions/emails/link-crm";

import { campaignScheduleSend } from "@/inngest/functions/campaigns/schedule-send";
import { campaignSendStep } from "@/inngest/functions/campaigns/send-step";
import { campaignProcessFollowUp } from "@/inngest/functions/campaigns/process-follow-up";
import { campaignSendNow } from "@/inngest/functions/campaigns/send-now";
import { reportSendScheduled } from "@/inngest/functions/reports/send-scheduled";

import { generateDocumentThumbnail } from "@/inngest/functions/documents/generate-thumbnail";
import { syncExchangeRates } from "@/inngest/functions/ecb/sync-exchange-rates";
import { followupReminder } from "@/inngest/functions/followup-reminder";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    emailSyncAll,
    emailSyncAccount,
    emailLinkCrm,

    campaignScheduleSend,
    campaignSendStep,
    campaignProcessFollowUp,
    campaignSendNow,
    reportSendScheduled,

    generateDocumentThumbnail,
    syncExchangeRates,
    followupReminder,
  ],
});
