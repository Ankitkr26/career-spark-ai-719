import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAuth } from "@/components/RequireAuth";
import { JobsTab } from "@/components/admin/JobsTab";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";
import { UsersTab } from "@/components/admin/UsersTab";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — PlaceIQ" },
      {
        name: "description",
        content: "Manage job postings and view resume analytics.",
      },
    ],
  }),
  component: () => (
    <RequireAuth adminOnly>
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Manage job postings, monitor resume trends, and assign roles.
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}