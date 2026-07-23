import mongoose from "mongoose";

export function getDatabaseHealth() {
  return {
    status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  };
}
