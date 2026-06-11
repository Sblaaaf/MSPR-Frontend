"use client";

import { WifiOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n-context";
import { useOnlineStatus } from "@/lib/use-online-status";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-warning px-4 py-2 text-center text-sm font-medium text-black"
    >
      <WifiOff className="size-4 shrink-0" />
      <span>{t("offline_banner")}</span>
    </div>
  );
}
