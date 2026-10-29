import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { loginSchema } from '@suraksha/shared';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isBackendConnected, isForceDemo, loadDemoTourist } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0]
      });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });
      showSuccess(
        result.message || 'Logged in to SURAKSHA Tourist Portal',
        result.isMock ? 'Demo Mode Active' : 'Connected to Server'
      );
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      showError(msg, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreFillDemo = () => {
    setEmail('tourist.demo@suraksha.gov.in');
    setPassword('DemoTourist@2026');
    setErrors({});
    showInfo('Filled sample tourist credentials for quick demo testing.', 'Credentials Filled');
  };

  const handleInstantDemoLogin = () => {
    loadDemoTourist();
    showSuccess('Logged in as sample tourist Aarav Sharma', 'Prototype Session Ready');
    navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-safety-400 shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Tourist Safety Login
            </h1>
            <p className="text-xs text-slate-500">
              Access your digital safety pass, SOS monitoring &amp; incident reports
            </p>
          </div>

          {/* Mode Indicator Banner */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              !isForceDemo && isBackendConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  !isForceDemo && isBackendConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <span className="font-medium text-[11px]">
                {!isForceDemo && isBackendConnected
                  ? 'API Server Connected (Port 5000)'
                  : 'Backend Offline: Standalone Demo Mode Active'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Registered Email"
              type="email"
              icon={<Mail className="w-4 h-4" />}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-safety-600 focus:ring-safety-500"
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                onClick={handlePreFillDemo}
                className="text-xs text-safety-700 hover:text-safety-800 font-semibold hover:underline"
              >
                Auto-fill Demo Data
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2 font-bold"
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Examiner 1-Click bypass button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Instant 1-Click Evaluation Login (Aarav Sharma)</span>
            </button>
          </div>

          {/* Links to Register */}
          <div className="text-center pt-2 text-xs text-slate-600">
            <span>First time using SURAKSHA? </span>
            <Link
              to="/register"
              className="font-bold text-safety-700 hover:text-safety-800 hover:underline"
            >
              Register Tourist Account
            </Link>
          </div>
        </div>

        {/* Evaluation note */}
        <p className="text-center text-[11px] text-slate-400">
          SURAKSHA College Major Project Prototype • Safe Sandbox Environment
        </p>
      </div>
    </div>
  );
};
