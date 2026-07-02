import { useState } from "react";

// Mocked SSO sign-in screen. No real authentication — clicking the button
// simulates an identity-provider redirect and enters the app.
export function Login({ onSignIn }: { onSignIn: () => void }) {
  const [loading, setLoading] = useState(false);

  const signIn = () => {
    setLoading(true);
    window.setTimeout(onSignIn, 900);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4">
      {/* Decorative brand background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            KT
          </div>
          <div className="text-left">
            <div className="text-base font-bold text-white">Key Travel</div>
            <div className="text-xs text-slate-400">B2B Travel Portal</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
          <h1 className="text-center text-lg font-bold text-slate-900">
            Sign in to your workspace
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500">
            Use your organization's single sign-on to continue.
          </p>

          <button
            onClick={signIn}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Spinner />
                Redirecting to your identity provider…
              </>
            ) : (
              <>
                <ShieldIcon />
                Sign in with SSO
              </>
            )}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            supported providers
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex items-center justify-center gap-2">
            {["Microsoft Entra", "Okta", "Google"].map((p) => (
              <button
                key={p}
                onClick={signIn}
                disabled={loading}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-70"
              >
                {p}
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Protected by single sign-on. You'll pick a role and organization
            inside — this is a prototype with in-memory data.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          © Key Travel · Presale prototype
        </p>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}
