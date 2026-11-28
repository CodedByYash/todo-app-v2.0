"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";

export interface Workspace {
  id: string;
  workspacename: string;
  description?: string | null;
  type?: "PERSONAL" | "PROFESSIONAL";
  ownerId?: string;
  members?: { id: string; role: string; userId: string }[];
}

interface WorkspaceContextType {
  selectedWorkspace: string | null;
  setSelectedWorkspace: (id: string) => Promise<void>;
  workspaces: Workspace[];
  /** Re-fetch the workspace list (and optionally select one). */
  refreshWorkspaces: (selectId?: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

const patchPreferences = (defaultWorkspaceId: string) =>
  fetch("/api/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ defaultWorkspaceId }),
  });

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const onboarded = session?.user?.onboardingCompleted;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelected] = useState<string | null>(null);

  const load = useCallback(
    async (selectId?: string) => {
      if (!userId || !onboarded) return;
      try {
        const wsResponse = await fetch("/api/workspaces");
        if (!wsResponse.ok) throw new Error("Failed to fetch workspaces");
        const wsData: Workspace[] = await wsResponse.json();
        setWorkspaces(wsData);
        if (wsData.length === 0) {
          setSelected(null);
          return;
        }

        let next = selectId;
        if (!next || !wsData.some((ws) => ws.id === next)) {
          const prefResponse = await fetch("/api/preferences");
          const prefData = prefResponse.ok ? await prefResponse.json() : {};
          next =
            prefData?.defaultWorkspaceId &&
            wsData.some((ws) => ws.id === prefData.defaultWorkspaceId)
              ? prefData.defaultWorkspaceId
              : wsData[0].id;
          if (prefData?.defaultWorkspaceId !== next) {
            await patchPreferences(next as string);
          }
        } else {
          await patchPreferences(next);
        }
        setSelected(next as string);
      } catch (error) {
        console.error("Error fetching workspace data:", error);
      }
    },
    [userId, onboarded],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const handleWorkspaceChange = async (value: string) => {
    setSelected(value);
    if (userId) {
      try {
        await patchPreferences(value);
      } catch (error) {
        console.error("Error updating preferences:", error);
      }
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspace,
        setSelectedWorkspace: handleWorkspaceChange,
        workspaces,
        refreshWorkspaces: load,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
