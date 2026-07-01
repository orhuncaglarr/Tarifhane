"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT_ID } from "@/lib/config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Renders a real AdSense unit once NEXT_PUBLIC_ADSENSE_CLIENT_ID and a slot
 * id are configured (both are manual, external setup steps - see README).
 * Until then, renders a fixed-size placeholder so the layout doesn't shift
 * once ads are turned on.
 */
export default function AdSlot({ slot }: { slot?: string }) {
  const adUnitId = slot || process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;
  const enabled = Boolean(ADSENSE_CLIENT_ID && adUnitId);

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not loaded yet (e.g. blocked by an ad blocker) - safe to ignore.
    }
  }, [enabled]);

  if (!enabled) {
    return <div className="ad-slot">Reklam alanı</div>;
  }

  return (
    <ins
      className="adsbygoogle ad-slot"
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={adUnitId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
