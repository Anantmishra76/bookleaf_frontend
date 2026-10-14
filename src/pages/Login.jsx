import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";

const Login = ({ onLogin, notice }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email: email.trim(), password });
      const { token, user } = response.data;
      onLogin(user, token);
      navigate(user.role === "ADMIN" ? "/admin/tickets" : "/author/books", { replace: true });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen items-center px-5 py-12">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
        <section className="bg-teal-900 p-8 text-white md:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-200">BookLeaf Publishing</p>
          <h1 className="mt-12 text-4xl font-semibold leading-tight">Your stories.<br />Our support.</h1>
          <p className="mt-5 leading-7 text-teal-100">Keep track of your books and get help from the BookLeaf team, all in one place.</p>
          <p className="mt-12 text-sm text-teal-200">Author &amp; Operations Portal</p>
        </section>
        <section className="p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in with your BookLeaf account.</p>
          {notice && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
          {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label>
              <input id="email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="input" />
            </div>
            <button type="submit" disabled={loading} className="button w-full">{loading ? "Signing in..." : "Sign in"}</button>
          </form>
          <p className="mt-7 text-xs leading-5 text-slate-500">Use the account provided by your BookLeaf team.</p>
        </section>
      </div>
    </main>
  );
};

export default Login;
