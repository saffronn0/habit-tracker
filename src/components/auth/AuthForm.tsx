"use client";

import { useActionState } from "react";
import Link from "next/link";

type Field = {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
};

type Props = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  fields: Field[];
  submitLabel: string;
  pendingLabel: string;
  footer: { text: string; linkText: string; href: string };
};

export default function AuthForm({ action, fields, submitLabel, pendingLabel, footer }: Props) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="glass-card w-full max-w-sm rounded-3xl p-7 shadow-xl">
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor={field.name}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            required={field.name !== "name"}
            className="w-full rounded-xl border border-card-border bg-transparent px-3 py-2.5 text-sm outline-none ring-accent focus:ring-2"
          />
        </div>
      ))}

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mb-4 w-full rounded-xl bg-gradient-to-br from-primary to-accent py-2.5 text-sm font-semibold text-foreground shadow-md transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>

      <p className="text-center text-xs text-muted">
        {footer.text}{" "}
        <Link href={footer.href} className="font-semibold text-accent hover:underline">
          {footer.linkText}
        </Link>
      </p>
    </form>
  );
}
