"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toggleOrganizationStatus } from "@/actions/admin/toggle-organization";

interface OrgActionMenuProps {
  organization: {
    id: string;
    status: string;
  };
}

export const OrgActionMenu = ({ organization }: OrgActionMenuProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onToggleStatus = async () => {
    try {
      setIsLoading(true);
      const newStatus = organization.status === "active" ? "suspended" : "active";
      const result = await toggleOrganizationStatus(organization.id, newStatus);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Organization ${newStatus === "active" ? "activated" : "suspended"}`);
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onCopy = () => {
    navigator.clipboard.writeText(organization.id);
    toast.success("Organization ID copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onCopy}>
          Copy Org ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isLoading}>View Details</DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onToggleStatus}
          disabled={isLoading}
          className={organization.status === "active" ? "text-destructive" : "text-green-600"}
        >
          {organization.status === "active" ? "Suspend Organization" : "Activate Organization"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
