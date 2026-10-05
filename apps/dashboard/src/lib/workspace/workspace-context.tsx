"use client";

import { createContext, useContext, type ReactNode } from "react";

type Workspace = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type WorkspaceContextValue = {
  workspace: Workspace;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: ReactNode;
}) {
  return (
    <WorkspaceContext.Provider value={{ workspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider.");
  }

  return context;
}
