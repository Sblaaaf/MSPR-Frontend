"use client";

import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
  // On démarre toujours à `true` pour que le premier rendu client corresponde
  // au rendu serveur (qui n'a pas accès à `navigator`) et éviter un mismatch
  // d'hydratation. Le statut réel est lu après le montage dans l'effet.
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return isOnline;
}
