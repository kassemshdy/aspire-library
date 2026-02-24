import { getServerSession, type Session } from "next-auth";
import { authConfig } from "./auth.config";

export const auth = (): Promise<Session | null> => getServerSession(authConfig);

