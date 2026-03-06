import { useState } from "react";
import { Building2, Users, KeyRound, CreditCard, Plus } from "lucide-react";
import { mockApiKeys } from "@/data/mock";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { MemberRole } from "@/data/mock";

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case "Owner": return "default";
    case "Admin": return "secondary";
    default: return "outline";
  }
};

const Organization = () => {
  const { user } = useAuth();
  const { organizations, activeOrg, members, createOrg, addMember, removeMember, changeRole } = useOrg();
  const activeKeys = mockApiKeys.filter((k) => k.is_active).length;

  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<MemberRole>("Member");
  const [addLoading, setAddLoading] = useState(false);

  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return;
    setCreateLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    createOrg(orgName.trim(), orgDesc.trim());
    setCreateLoading(false);
    setOrgName("");
    setOrgDesc("");
    setShowCreateOrg(false);
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) return;
    setAddLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    addMember(memberEmail.trim(), memberRole);
    setAddLoading(false);
    setMemberEmail("");
    setMemberRole("Member");
    setShowAddMember(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Organization</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your organization</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreateOrg(true)}>
          <Plus className="h-3.5 w-3.5" />
          Create Organization
        </Button>
      </div>

      {/* Organizations List */}
      {organizations.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center justify-center text-center">
          <Building2 className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No organizations yet</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowCreateOrg(true)}>
            Create your first organization
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className={`rounded-lg border p-4 space-y-1 ${activeOrg?.id === org.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{org.name}</span>
                {activeOrg?.id === org.id && <Badge variant="default" className="text-[10px] h-5">Active</Badge>}
              </div>
              {org.description && <p className="text-xs text-muted-foreground">{org.description}</p>}
              <p className="text-[10px] text-muted-foreground">
                Created {new Date(org.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quota */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Quota Usage</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Schedules</span>
              <span className="text-foreground font-medium">6 / 50</span>
            </div>
            <Progress value={12} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Executions today</span>
              <span className="text-foreground font-medium">847 / 10,000</span>
            </div>
            <Progress value={8.47} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Members</span>
              <span className="text-foreground font-medium">{members.length} / 10</span>
            </div>
            <Progress value={(members.length / 10) * 100} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Members</h2>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAddMember(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Member
          </Button>
        </div>
        {members.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No members yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
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
                      <Select
                        value={member.role}
                        onValueChange={(val) => changeRole(member.id, val as MemberRole)}
                      >
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
                  <TableCell>
                    {member.role !== "Owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setRemovingMemberId(member.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">{members.length}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">{activeKeys}</p>
            <p className="text-xs text-muted-foreground">Active API Keys</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">Pro</p>
            <p className="text-xs text-muted-foreground">Current Plan</p>
          </div>
        </div>
      </div>

      {/* Create Org Dialog */}
      <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Add a new organization to your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name *</label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="My Organization" className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
              <Input value={orgDesc} onChange={(e) => setOrgDesc(e.target.value)} placeholder="Optional description" className="bg-background border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOrg(false)}>Cancel</Button>
            <Button onClick={handleCreateOrg} disabled={createLoading || !orgName.trim()}>
              {createLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>Invite a new member to the organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email *</label>
              <Input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="user@example.com" className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
              <Select value={memberRole} onValueChange={(v) => setMemberRole(v as MemberRole)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={addLoading || !memberEmail.trim()}>
              {addLoading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removingMemberId} onOpenChange={() => setRemovingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removingMemberId) removeMember(removingMemberId);
                setRemovingMemberId(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Organization;
