import { redirect } from "next/navigation";
import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1. Verify token exists and is valid
  const invite = await prismadb.organizationInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-2xl font-bold">Invalid or Expired Invitation</h1>
        <p className="text-muted-foreground">This invitation link is invalid or has expired.</p>
      </div>
    );
  }

  if (invite.expiresAt < new Date()) {
    // Clean up expired invite
    await prismadb.organizationInvite.delete({ where: { id: invite.id } });
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-2xl font-bold">Invalid or Expired Invitation</h1>
        <p className="text-muted-foreground">This invitation link has expired.</p>
      </div>
    );
  }

  // 2. Check session
  const session = await getSession();
  
  if (!session || !session.user) {
    // If user isn't logged in, redirect them to sign up with the token
    redirect(`/sign-in?callbackUrl=/invite/${token}`);
  }

  // 3. User is logged in, attach them to the organization
  await prismadb.users.update({
    where: { id: session.user.id },
    data: {
      organization_id: invite.organizationId,
    },
  });

  // 4. Delete the invite (single use)
  await prismadb.organizationInvite.delete({
    where: { id: invite.id },
  });

  // 5. Redirect to dashboard
  redirect("/");
}
