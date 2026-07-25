import { useState, useEffect, useCallback, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface UseWebContainerProps {
  templateData: TemplateFolder | null;
  // Identifies which playground templateData belongs to (e.g. the
  // playground id). WebContainer only supports one booted instance per tab,
  // so without this a user navigating from Playground A to Playground B in
  // the same tab would reuse A's already-mounted filesystem and B would
  // silently run A's code instead of its own.
  instanceKey?: string;
}

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

let webContainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let bootedForKey: string | null = null;

const getWebContainerInstance = async (
  instanceKey: string | undefined
): Promise<WebContainer> => {
  // Same playground (or no key provided) and already booted - reuse it.
  if (webContainerInstance && bootedForKey === (instanceKey ?? bootedForKey)) {
    return webContainerInstance;
  }

  // A different playground than the one currently booted - tear down the
  // old instance first so its mounted files don't leak into the new one.
  if (webContainerInstance && instanceKey !== undefined && bootedForKey !== instanceKey) {
    try {
      await webContainerInstance.teardown();
    } catch (err) {
      console.error("Failed to tear down previous WebContainer instance:", err);
    }
    webContainerInstance = null;
    bootPromise = null;
    bootedForKey = null;
  }

  if (bootPromise) {
    return bootPromise;
  }

  bootedForKey = instanceKey ?? null;
  bootPromise = WebContainer.boot();
  webContainerInstance = await bootPromise;
  return webContainerInstance;
};

export const useWebContainer = ({
  templateData,
  instanceKey,
}: UseWebContainerProps): UseWebContainerReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    setIsLoading(true);
    setInstance(null);

    async function initializeWebContainer() {
      try {
        const containerInstance = await getWebContainerInstance(instanceKey);

        if (!mountedRef.current) return;

        setInstance(containerInstance);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        if (mountedRef.current) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize WebContainer"
          );
          setIsLoading(false);
        }
      }
    }

    initializeWebContainer();

    return () => {
      mountedRef.current = false;
    };
  }, [instanceKey]);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        throw new Error("WebContainer instance is not available");
      }

      try {
        const pathParts = path.split("/");
        const folderPath = pathParts.slice(0, -1).join("/");

        if (folderPath) {
          await instance.fs.mkdir(folderPath, { recursive: true });
        }

        await instance.fs.writeFile(path, content);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to write file";
        console.error(`Failed to write file at ${path}:`, err);
        throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
      }
    },
    [instance]
  );

  const destroy = useCallback(() => {
    if (webContainerInstance) {
      webContainerInstance.teardown();
      webContainerInstance = null;
      bootPromise = null;
      bootedForKey = null;
      setInstance(null);
      setServerUrl(null);
    }
  }, []);

  return { serverUrl, isLoading, error, instance, writeFileSync, destroy };
};

