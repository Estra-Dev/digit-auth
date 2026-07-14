import type { ClientSession, SaveOptions } from "mongoose";

export const withSession = (session?: ClientSession): SaveOptions => {
  return session ? { session } : {};
};
