import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "../context/AuthProvider";
import { Button } from "../components/ui/Button";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError("Identifiants invalides");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/30">
        <h1 className="mb-2 text-2xl font-semibold">Connexion EcoTrack</h1>
        <p className="mb-6 text-sm text-slate-400">
          Accédez au tableau de bord environnemental
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-brand focus:outline-none"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Mot de passe</label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-brand focus:outline-none"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button
            type="submit"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Connexion en cours
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

