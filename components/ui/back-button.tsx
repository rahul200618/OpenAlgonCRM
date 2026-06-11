"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => router.back()}
      className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
      title="Go Back"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Go Back</span>
    </Button>
  );
}
