import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prismadb as prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// NextAuth's PrismaAdapter expects a 'user' model, but ours is 'Users'
const adaptedPrisma = prisma as any;
adaptedPrisma.user = prisma.users;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(adaptedPrisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || "fK3h9X8mP2vL5nQ1wZ4yB7cR6tJ0xM9r",
  trustHost: true,
  debug: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.users.findUnique({
          where: { email: credentials.email as string }
        });
        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;
        
        return user;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        
        const dbUser = await prisma.users.findUnique({
          where: { id: token.sub }
        });
        
        if (dbUser) {
          (session.user as any).role = dbUser.role;
          (session.user as any).organization_id = dbUser.organization_id;
          (session.user as any).userStatus = dbUser.userStatus;
          (session.user as any).userLanguage = dbUser.userLanguage;
          (session.user as any).avatar = dbUser.avatar;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  }
})

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  organization_id: string | null;
  userStatus: string;
  userLanguage: string;
};

export async function getUser(): Promise<AppUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  
  return {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string,
    role: (session.user as any).role as string || "user",
    avatar: (session.user as any).avatar || null,
    organization_id: (session.user as any).organization_id as string | null,
    userStatus: (session.user as any).userStatus as string || "ACTIVE",
    userLanguage: (session.user as any).userLanguage as string || "en",
  };
}

export async function requireUser(): Promise<AppUser> {
  const user = await getUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/en/sign-in");
    throw new Error("Redirecting...");
  }
  return user;
}

export async function hasRole(roles: string | string[]): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(user.role);
}

export async function isAdmin(): Promise<boolean> {
  return hasRole(["admin", "superAdmin"]);
}

export async function getSession(): Promise<{ user: AppUser } | null> {
  const user = await getUser();
  if (!user) return null;
  return { user };
}
