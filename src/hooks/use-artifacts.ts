"use client";

import { useCallback, useState } from "react";

export interface Artifact {
  id: string;
  type: "code" | "text";
  language?: string | undefined;
  content: string;
  title?: string | undefined;
}

export function useArtifacts() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);

  const addArtifact = useCallback((artifact: Artifact) => {
    setArtifacts((prev) => [...prev, artifact]);
    setActiveArtifactId(artifact.id);
    setIsPanelOpen(true);
  }, []);

  const removeArtifact = useCallback(
    (id: string) => {
      setArtifacts((prev) => {
        const next = prev.filter((a) => a.id !== id);
        if (activeArtifactId === id) {
          setActiveArtifactId(next.length > 0 && next[0] ? next[0].id : null);
        }
        return next;
      });
    },
    [activeArtifactId],
  );

  const clearArtifacts = useCallback(() => {
    setArtifacts([]);
    setActiveArtifactId(null);
    setIsPanelOpen(false);
  }, []);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const setActiveArtifact = useCallback((id: string) => {
    setActiveArtifactId(id);
  }, []);

  return {
    artifacts,
    isPanelOpen,
    activeArtifactId,
    addArtifact,
    removeArtifact,
    clearArtifacts,
    openPanel,
    closePanel,
    setActiveArtifact,
  };
}
