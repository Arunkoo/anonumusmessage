import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Credentials received:", credentials);

        if (!credentials?.identifier || !credentials?.password) {
          console.error("Missing credentials");
          throw new Error("Please provide an email and password");
        }

        await dbConnect();
        console.log("Database connected");

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          }).lean();
          console.log("User found:", user);

          if (!user) {
            console.error("No user found with the given identifier");
            throw new Error("Invalid email or password");
          }

          if (!user.isVerified) {
            console.warn("Account not verified");
            throw new Error("Please verify your account");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          console.log("Password is valid:", isValid);

          if (!isValid) {
            console.error("Password mismatch");
            throw new Error("Invalid email or password");
          }

          const userObject = {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            isAcceptingMessages: user.isAcceptingMessage,
          };
          console.log("Returning user object:", userObject);

          return userObject;
        } catch (error) {
          console.error("Error in authorization:", error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("An error occurred");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback invoked. Token:", token, "User:", user);

      if (user) {
        token.id = user._id;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      console.log(
        "Session callback invoked. Session:",
        session,
        "Token:",
        token
      );

      if (token) {
        session.user._id = token.sub;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "defaultSecret",
};
