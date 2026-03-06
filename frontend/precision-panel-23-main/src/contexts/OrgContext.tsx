import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { OrgMember, mockMembers, MemberRole } from "@/data/mock";

export interface Organization {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface OrgContextType {
  organizations: Organization[];
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization) => void;
  createOrg: (name: string, description: string) => void;
  members: OrgMember[];
  addMember: (email: string, role: MemberRole) => void;
  removeMember: (id: string) => void;
  changeRole: (id: string, role: MemberRole) => void;
}

const OrgContext = createContext<OrgContextType | null>(null);

const defaultOrg: Organization = {
  id: "org_001",
  name: "Acme Corporation",
  description: "Default organization",
  created_at: "2025-12-01T08:00:00Z",
};

export function OrgProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([defaultOrg]);
  const [activeOrg, setActiveOrg] = useState<Organization>(defaultOrg);
  const [members, setMembers] = useState<OrgMember[]>([...mockMembers]);

  const createOrg = useCallback((name: string, description: string) => {
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name,
      description,
      created_at: new Date().toISOString(),
    };
    setOrganizations((prev) => [...prev, newOrg]);
    setActiveOrg(newOrg);
  }, []);

  const addMember = useCallback((email: string, role: MemberRole) => {
    setMembers((prev) => [
      ...prev,
      {
        id: `usr_${Date.now()}`,
        email,
        role,
        is_active: true,
        joined_at: new Date().toISOString(),
      },
    ]);
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const changeRole = useCallback((id: string, role: MemberRole) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }, []);

  return (
    <OrgContext.Provider
      value={{ organizations, activeOrg, setActiveOrg, createOrg, members, addMember, removeMember, changeRole }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
