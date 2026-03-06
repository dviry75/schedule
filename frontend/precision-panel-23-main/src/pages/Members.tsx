import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrg } from "@/contexts/OrgContext";
import { MemberRole } from "@/data/mock";
import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users } from "lucide-react";

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case "Owner": return "default";
    case "Admin": return "secondary";
    default: return "outline";
  }
};

const Members = () => {
  const { members, addMember, removeMember, changeRole } = useOrg();

  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("Member");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    addMember(email.trim(), role);
    setLoading(false);
    setEmail("");
    setRole("Member");
    setShowAdd(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage organization members and roles</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center justify-center text-center">
          <Users className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No members yet</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowAdd(true)}>
            Add your first member
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} className="border-border">
                    <TableCell className="font-mono text-xs text-foreground">{member.email}</TableCell>
                    <TableCell>
                      {member.role === "Owner" ? (
                        <Badge variant={roleBadgeVariant(member.role) as any}>{member.role}</Badge>
                      ) : (
                        <Select value={member.role} onValueChange={(v) => changeRole(member.id, v as MemberRole)}>
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-xs ${member.is_active ? "text-success" : "text-muted-foreground"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${member.is_active ? "bg-success" : "bg-muted-foreground"}`} />
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      {member.role !== "Owner" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setRemovingId(member.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
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
            {members.map((member) => (
              <div key={member.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-foreground">{member.email}</span>
                  <Badge variant={roleBadgeVariant(member.role) as any}>{member.role}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className={`inline-flex items-center gap-1.5 ${member.is_active ? "text-success" : ""}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${member.is_active ? "bg-success" : "bg-muted-foreground"}`} />
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                  <span>{new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                {member.role !== "Owner" && (
                  <Button variant="ghost" size="sm" className="text-destructive w-full mt-1" onClick={() => setRemovingId(member.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Member Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>Invite a new member to the organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email *</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
              <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loading || !email.trim()}>{loading ? "Adding..." : "Add Member"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={!!removingId} onOpenChange={() => setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (removingId) removeMember(removingId); setRemovingId(null); }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Members;
