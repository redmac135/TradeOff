import { useState, useEffect } from "react";
import { getGameState } from "../aws/gameApi";

export function useGameState() { // default 500ms
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let isMounted = true; // avoid updating state if unmounted
    const checkGameState = async () => {
      try {
        const running = await getGameState();
        if (isMounted) {
          setIsRunning(running);
        }
      } catch (err) {
        console.error("Failed to fetch game state:", err);
      }
    };

    // initial check
    checkGameState();

    // set up interval
    const intervalId = setInterval(checkGameState, 333);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return isRunning;
}