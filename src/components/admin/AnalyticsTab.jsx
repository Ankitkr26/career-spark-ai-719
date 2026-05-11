import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AnalyticsTab() {
    return (<div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Analytics have been migrated to the Django backend. Implement admin analytics endpoints to populate charts and stats here.</p>
      </div>
      <div className="rounded-2xl border border-border p-6" style={{ background: "var(--card)" }}>
        <p className="text-sm text-muted-foreground">This view is a placeholder until backend analytics endpoints are available.</p>
        <div className="mt-4">
          <Button disabled>Refresh</Button>
        </div>
      </div>
    </div>);
}
