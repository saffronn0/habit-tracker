"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { signOutAction } from "@/lib/auth-actions";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => signOutAction())}
      disabled={isPending}
      aria-label="Sign out"
      title="Sign out"
      className="glass-card flex items-center justify-center rounded-2xl p-2.5 text-muted transition-colors hover:text-foreground disabled:opacity-60"
    >
      <LogOut size={16} />
    </button>
  );
}
