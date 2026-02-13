import type { NextAuthConfig, DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { loginSchema } from './zod/login-schema';
import { serviceContainer } from './src/Shared/infrastructure/ServiceContainer';
import {} from 'next/font/google';

// Extender tipos de NextAuth
declare module 'next-auth' {
  interface User {
    id?: string;
    role?: string;
    token?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      token?: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }
}

// Configuración de NextAuth
const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name,
          surname: profile.family_name,
          email: profile.email,
          emailVerified: profile.email_verified,
          image: profile.picture,
        };
      },
    }),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await loginSchema.parseAsync(credentials);

        const user = await serviceContainer.user.userLogin.execute(email, password);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      try {
        const result =
          account && (await serviceContainer.account.accountOAuthSignIn.execute(user, account));
        return result ?? true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false; // Or return a string URL to redirect to on error
      }
    },
    jwt: async ({ token, user, account, trigger, session }) => {
      if (user) {
        // With OAuth (e.g. Google), NextAuth passes the provider profile (user.id = profile.sub).
        // We must store the database user id so that session.user.id matches User table and relations (e.g. administrators).
        let userId = user.id || token.sub;
        if (user.email && account?.provider && account.provider !== 'credentials') {
          const dbUser = await serviceContainer.user.userFind.execute(user.email);
          if (dbUser?.id) {
            userId = dbUser.id;
            token.role = dbUser.role;
          }
        } else if (user.role) {
          token.role = user.role;
        }
        token.id = userId;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (trigger === 'update') {
        token.role = session.user.role;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        // Extract user ID from token (token.id or token.sub as fallback)
        const userId = (token.id as string) || (token.sub as string);

        session.user.id = userId;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.accessToken = token.accessToken as string;

        session.user = {
          ...session.user,
          id: userId,
          email: token.email as string,
          name: token.name as string,
          image: token.picture as string,
          token: JSON.stringify(token),
        };
      }
      return session;
    },
  },
};

export default authConfig;
