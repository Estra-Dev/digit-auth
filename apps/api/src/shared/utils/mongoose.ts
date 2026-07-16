import type { ClientSession } from "mongoose";

export const withSession = (session?: ClientSession) => {
  return session ? { session } : {};
};
