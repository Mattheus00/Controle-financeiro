"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function PresenceTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("folio:presence", {
      config: {
        private: true,
        presence: { key: userId },
      },
    });

    let active = true;

    void supabase.realtime.setAuth().then(() => {
      if (!active) return;
      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !active) return;
        await channel.track({ user_id: userId, online_at: new Date().toISOString() });
      });
    });

    return () => {
      active = false;
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}
