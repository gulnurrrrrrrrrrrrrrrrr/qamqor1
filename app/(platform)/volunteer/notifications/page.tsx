"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Awaited<ReturnType<typeof api.notifications>>["notifications"]>([]);

  useEffect(() => {
    api.notifications().then((r) => setNotifications(r.notifications)).catch(console.error);
  }, []);

  return (
    <RoleShell role="volunteer" title="Notifications" subtitle="Applications · Events · Achievements">
      <Panel className="!p-0 divide-y divide-white/[0.04] overflow-hidden">
        {notifications.map((n) => (
          <div key={n.id} className="px-5 py-4 hover:bg-white/[0.02]">
            <p className="text-sm text-white">{n.title}</p>
            <p className="text-xs text-ink-400 mt-1">{n.body}</p>
            <p className="text-[10px] text-ink-500 mt-2">{n.time}</p>
          </div>
        ))}
      </Panel>
    </RoleShell>
  );
}
