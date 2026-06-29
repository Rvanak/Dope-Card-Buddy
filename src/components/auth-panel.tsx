"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { TurnstileTokenField } from "@/components/turnstile-token-field";

function getPasswordStrength(pw: string) {
  const checks = [
    { label: "10+ characters", pass: pw.length >= 10 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(pw) },
    { label: "Lowercase letter", pass: /[a-z]/.test(pw) },
    { label: "Number", pass: /[0-9]/.test(pw) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(pw) },
  ];
  return checks;
}

export function AuthPanel() {
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Token used for this request — cleared before signIn so the
      // single-use Turnstile token isn't sent twice (register then login).
      let loginTurnstileToken: string | null = turnstileToken;

      if (isRegisterMode) {
        const registration = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, turnstileToken }),
        });
        const registrationBody = (await registration.json()) as { error?: string };
        if (!registration.ok) {
          setMessage(registrationBody.error ?? "Registration failed.");
          return;
        }
        // Token was consumed by /api/register — don't reuse it for signIn.
        loginTurnstileToken = null;
      }

      const result = await signIn("credentials", {
        email,
        password,
        turnstileToken: loginTurnstileToken,
        redirect: false,
      });

      if (result?.error) {
        setMessage("Sign in failed. Check your credentials.");
        return;
      }

      window.location.href = "/pricing";
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-xl font-semibold text-white">
        {isRegisterMode ? "Create Your Account" : "Sign In"}
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        {isRegisterMode
          ? "Create an account, then subscribe to unlock the full ballistic tool."
          : "Sign in to manage your subscription and access the full app."}
      </p>

      <form className="mt-5 space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          type="password"
          minLength={10}
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isRegisterMode && password.length > 0 && (
          <div className="space-y-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
            {getPasswordStrength(password).map(({ label, pass }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className={pass ? "text-green-400" : "text-zinc-500"}>
                  {pass ? "✓" : "○"}
                </span>
                <span className={pass ? "text-zinc-300" : "text-zinc-500"}>{label}</span>
              </div>
            ))}
          </div>
        )}
        <button
          className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
          type="submit"
          disabled={
            loading ||
            (turnstileEnabled && !turnstileToken) ||
            (isRegisterMode && !getPasswordStrength(password).every((c) => c.pass))
          }
        >
          {loading ? "Please wait..." : isRegisterMode ? "Register & Continue" : "Sign In"}
        </button>
        <TurnstileTokenField onToken={setTurnstileToken} />
      </form>

      {message ? <p className="mt-3 text-sm text-red-400">{message}</p> : null}

      <button
        className="mt-4 text-sm text-amber-300 hover:text-amber-200"
        onClick={() => {
          setIsRegisterMode((v) => !v);
          setMessage(null);
        }}
      >
        {isRegisterMode
          ? "Already have an account? Sign in"
          : "Need an account? Create one"}
      </button>
    </section>
  );
}
