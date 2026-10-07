import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { LockSimple, Envelope, CircleNotch, WarningCircle } from '@phosphor-icons/react';

const MAX_FAILED_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = 'terruno_login_throttle';

interface ThrottleState {
  failCount: number;
  cooldownUntil: number;
}

const readThrottle = (): ThrottleState => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { failCount: 0, cooldownUntil: 0 };
    const parsed = JSON.parse(raw) as Partial<ThrottleState>;
    return { failCount: Number(parsed.failCount) || 0, cooldownUntil: Number(parsed.cooldownUntil) || 0 };
  } catch {
    return { failCount: 0, cooldownUntil: 0 };
  }
};

const writeThrottle = (state: ThrottleState) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable: throttle still works for the current page lifetime
  }
};

const secondsLeft = (until: number) => Math.max(0, Math.ceil((until - Date.now()) / 1000));

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(() => readThrottle().failCount);
  const [cooldownUntil, setCooldownUntil] = useState(() => readThrottle().cooldownUntil);
  const [remaining, setRemaining] = useState(() => secondsLeft(readThrottle().cooldownUntil));
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    setRemaining(secondsLeft(cooldownUntil));
    const timer = setInterval(() => {
      const left = secondsLeft(cooldownUntil);
      setRemaining(left);
      if (left === 0) {
        clearInterval(timer);
        setFailCount(0);
        setCooldownUntil(0);
        writeThrottle({ failCount: 0, cooldownUntil: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const registerFailure = () => {
    const nextCount = failCount + 1;
    if (nextCount >= MAX_FAILED_ATTEMPTS) {
      const until = Date.now() + COOLDOWN_SECONDS * 1000;
      setFailCount(nextCount);
      setCooldownUntil(until);
      setRemaining(COOLDOWN_SECONDS);
      writeThrottle({ failCount: nextCount, cooldownUntil: until });
    } else {
      setFailCount(nextCount);
      writeThrottle({ failCount: nextCount, cooldownUntil: 0 });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remaining > 0) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setFailCount(0);
      setCooldownUntil(0);
      writeThrottle({ failCount: 0, cooldownUntil: 0 });
      navigate('/admin');
    } catch (err: unknown) {
      console.error('[Login]', err);
      registerFailure();
      const status = typeof err === 'object' && err !== null && 'status' in err ? (err as { status?: number }).status : undefined;
      if (status === 429) {
        setError('Demasiados intentos. Espera unos minutos antes de volver a intentar.');
      } else {
        setError('Email o contrasena incorrectos. Verifica tus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terruno-bg flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-terruno-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-terruno-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
            <LockSimple className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-serif text-terruno-brown">Acceso de Administrador</h1>
          <p className="text-terruno-accent mt-2">Ingresar para gestionar tu tienda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <WarningCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-terruno-brown mb-2">
              Dirección de Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Envelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-terruno-border rounded-xl focus:ring-terruno-burgundy focus:border-terruno-burgundy bg-terruno-bg outline-none transition-colors"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-terruno-brown mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockSimple className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-terruno-border rounded-xl focus:ring-terruno-burgundy focus:border-terruno-burgundy bg-terruno-bg outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || remaining > 0}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-terruno-burgundy hover:bg-terruno-burgundy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terruno-burgundy transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <CircleNotch className="w-5 h-5 animate-spin" />
            ) : remaining > 0 ? (
              `Esperar ${remaining}s`
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
