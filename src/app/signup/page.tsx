import AuthForm from "@/components/auth/AuthForm";
import { signUpAction } from "@/lib/auth-actions";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12">
      <h1 className="font-display mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-center text-3xl font-bold text-transparent">
        Create your account
      </h1>
      <AuthForm
        action={signUpAction}
        fields={[
          { name: "name", type: "text", label: "Name (optional)", placeholder: "Jamie" },
          { name: "email", type: "email", label: "Email", placeholder: "you@example.com", autoComplete: "email" },
          { name: "password", type: "password", label: "Password", placeholder: "At least 8 characters", autoComplete: "new-password" },
        ]}
        submitLabel="Sign up"
        pendingLabel="Creating account…"
        footer={{ text: "Already have an account?", linkText: "Log in", href: "/login" }}
      />
    </main>
  );
}
