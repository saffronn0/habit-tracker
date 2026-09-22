import AuthForm from "@/components/auth/AuthForm";
import { signInAction } from "@/lib/auth-actions";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12">
      <h1 className="font-display mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-center text-3xl font-bold text-transparent">
        Welcome back
      </h1>
      <AuthForm
        action={signInAction}
        fields={[
          { name: "email", type: "email", label: "Email", placeholder: "you@example.com", autoComplete: "email" },
          { name: "password", type: "password", label: "Password", placeholder: "••••••••", autoComplete: "current-password" },
        ]}
        submitLabel="Log in"
        pendingLabel="Logging in…"
        footer={{ text: "New here?", linkText: "Create an account", href: "/signup" }}
      />
    </main>
  );
}
