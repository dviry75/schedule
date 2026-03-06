import { Plus, Ban } from "lucide-react";
import { mockApiKeys } from "@/data/mock";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const ApiKeys = () => {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage access keys for the scheduling API</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Create Key
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockApiKeys.map((key) => (
              <TableRow key={key.id} className="border-border">
                <TableCell className="font-mono text-xs text-foreground">{key.key_preview}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 text-xs ${key.is_active ? "text-emerald-400" : "text-muted-foreground"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${key.is_active ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                    {key.is_active ? "Active" : "Revoked"}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(key.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {key.last_used_at
                    ? new Date(key.last_used_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Never"}
                </TableCell>
                <TableCell>
                  {key.is_active && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                      <Ban className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {mockApiKeys.map((key) => (
          <div key={key.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-foreground">{key.key_preview}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs ${key.is_active ? "text-emerald-400" : "text-muted-foreground"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${key.is_active ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                {key.is_active ? "Active" : "Revoked"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created {new Date(key.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <span>Used {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiKeys;
