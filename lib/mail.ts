import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export const sendTwoFactorTokenEmail = async (
  email: string,
  token: string
) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found. Skipping 2FA email:", token);
    return;
  }

  await resend.emails.send({
    from: `OpenAlgon CRM <${fromEmail}>`,
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/new-password?token=${token}`

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found. Skipping reset email. LOCAL TESTING LINK:", resetLink);
    return;
  }

  await resend.emails.send({
    from: `OpenAlgon CRM <${fromEmail}>`,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
  });
};

export const sendVerificationEmail = async (
  email: string, 
  token: string
) => {
  const confirmLink = `${domain}/new-verification?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found. Skipping verification email. LOCAL TESTING LINK:", confirmLink);
    return;
  }

  await resend.emails.send({
    from: `OpenAlgon CRM <${fromEmail}>`,
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
  });
};

export const sendInviteEmail = async (
  email: string, 
  token: string,
  orgName: string
) => {
  const inviteLink = `${domain}/invite/${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found. Skipping invite email. LOCAL TESTING LINK:", inviteLink);
    return;
  }

  await resend.emails.send({
    from: `OpenAlgon CRM <${fromEmail}>`,
    to: email,
    subject: `You have been invited to join ${orgName}`,
    html: `
      <h2>You've been invited!</h2>
      <p>You have been invited to join <strong>${orgName}</strong> on OpenAlgon CRM.</p>
      <p>Click <a href="${inviteLink}">here</a> to accept the invitation and join the team.</p>
    `
  });
};
