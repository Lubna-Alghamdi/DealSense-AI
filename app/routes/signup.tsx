import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/_agent-native/auth/ba/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error?.message ||
            "Could not create the account."
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create the account."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#0d172b] flex items-center justify-center px-6 text-white">
        <div className="text-center max-w-md">
          <div className="text-[#4388ff] text-6xl mb-6">✓</div>

          <h1 className="text-4xl font-bold mb-3">
            Account created!
          </h1>

          <p className="text-slate-400 mb-8">
            Your DealSense account is ready. You can now sign in.
          </p>

          <a
            href="/sign-in"
            className="block bg-[#2f6fed] hover:bg-[#2863d8] rounded-xl py-4 font-semibold"
          >
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d172b] text-white flex">
      {/* Left blue panel */}
      <section className="hidden lg:flex lg:w-[46%] bg-[#2f6fed] p-12 items-center">
        <div className="max-w-lg">
          <p className="text-xl font-semibold mb-3">Welcome!</p>

          <h1 className="text-5xl font-bold mb-14">
            Create your account
          </h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold">Analytics</h2>
              <p className="text-blue-100">
                Track real time performance
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Security</h2>
              <p className="text-blue-100">
                Enterprise grade protection
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Speed</h2>
              <p className="text-blue-100">
                Super fast and reliable
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signup form */}
      <section className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full border-2 border-[#4388ff] flex items-center justify-center text-[#4388ff] text-3xl">
              +
            </div>

            <h1 className="text-4xl font-bold">
              Create your account
            </h1>

            <p className="text-slate-400 text-lg mt-2">
              Enter your details to get started
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block font-semibold text-lg mb-2">
                Name
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[#1e2a3d] border border-slate-600 rounded-xl px-5 py-4 text-white outline-none focus:border-[#4388ff]"
              />
            </div>

            <div>
              <label className="block font-semibold text-lg mb-2">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1e2a3d] border border-slate-600 rounded-xl px-5 py-4 text-white outline-none focus:border-[#4388ff]"
              />
            </div>

            <div>
              <label className="block font-semibold text-lg mb-2">
                Password
              </label>

              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-[#1e2a3d] border border-slate-600 rounded-xl px-5 py-4 text-white outline-none focus:border-[#4388ff]"
              />
            </div>

            {error && (
              <p className="text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2f6fed] hover:bg-[#2863d8] disabled:opacity-60 rounded-xl py-4 text-lg font-semibold"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-slate-400">
              Already have an account?{" "}
              <a href="/" className="text-[#4388ff] font-semibold">
                Login
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
