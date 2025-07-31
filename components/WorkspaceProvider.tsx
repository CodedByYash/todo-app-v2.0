"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface Workspace {
  id: string;
  workspacename: string;
}

interface WorkspaceContextType {
  selectedWorkspace: string | null;
  setSelectedWorkspace: (id: string) => Promise<void>;
  workspaces: Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch workspaces
        const wsResponse = await fetch("/api/workspaces");
        if (!wsResponse.ok) throw new Error("Failed to fetch workspaces");
        const wsData = await wsResponse.json();
        setWorkspaces(wsData);

        // Fetch user preferences
        const prefResponse = await fetch("/api/preferences");

        if (!prefResponse.ok) throw new Error("Failed to fetch preferences");
        const prefData = await prefResponse.json();

        if (wsData.length > 0) {
          const defaultWsId =
            prefData?.defaultWorkspaceId &&
            wsData.some(
              (ws: Workspace) => ws.id === prefData.defaultWorkspaceId
            )
              ? prefData.defaultWorkspaceId
              : wsData[0].id;
          setSelectedWorkspace(defaultWsId);
          console.log("we reached here");
          // Update preferences if necessary
          if (prefData?.defaultWorkspaceId !== defaultWsId) {
            await fetch("/api/preferences", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ defaultWorkspaceId: defaultWsId }),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching workspace data:", error);
      }
    };
    fetchData();
  }, [session]);

  const handleWorkspaceChange = async (value: string) => {
    setSelectedWorkspace(value);
    if (session?.user?.id) {
      try {
        await fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ defaultWorkspaceId: value }),
        });
      } catch (error) {
        console.error("Error updating preferences:", error);
      }
    }
  };

  const contextValue = {
    selectedWorkspace,
    setSelectedWorkspace: handleWorkspaceChange,
    workspaces,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
