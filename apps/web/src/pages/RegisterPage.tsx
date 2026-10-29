import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, User, Mail, Lock, Phone, Globe, ShieldAlert, Sparkles } from 'lucide-react';
import { registerSchema } from '@suraksha/shared';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const rawData = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim() ? phone.trim() : undefined,
      nationality: nationality.trim() ? nationality.trim() : undefined,
      emergencyContact:
        emergencyName.trim() && emergencyPhone.trim()
          ? {
              name: emergencyName.trim(),
              phone: emergencyPhone.trim()
            }
          : undefined
    };

    const parsed = registerSchema.safeParse(rawData);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const formatted: Record<string, string> = {};

      if (fieldErrors.name) formatted.name = fieldErrors.name[0];
      if (fieldErrors.email) formatted.email = fieldErrors.email[0];
      if (fieldErrors.password) formatted.password = fieldErrors.password[0];
      if (fieldErrors.phone) formatted.phone = fieldErrors.phone[0];
      if (fieldErrors.nationality) formatted.nationality = fieldErrors.nationality[0];

      setErrors(formatted);
      return null;
    }

    setErrors({});
    return parsed.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;

    setLoading(true);
    try {
      const result = await register(data);
      showSuccess(
        result.message || 'Tourist account registered successfully',
        'Welcome to SURAKSHA'
      );
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to complete registration.';
      showError(msg, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreFillSample = () => {
    setName('Priya Sen');
    setEmail('priya.sen@tourist.in');
    setPassword('Suraksha@2026');
    setPhone('+91 98111 22334');
    setNationality('India');
    setEmergencyName('Rohan Sen (Brother)');
    setEmergencyPhone('+91 98111 55667');
    setErrors({});
    showInfo('Filled registration form with valid test tourist profile.', 'Sample Data Injected');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-safety-400 shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Tourist Registration
            </h1>
            <p className="text-xs text-slate-500">
              Generate your official SURAKSHA digital safety pass and emergency profile
            </p>
          </div>

          {/* Quick Auto Fill Button for Evaluators */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePreFillSample}
              className="inline-flex items-center gap-1.5 text-xs text-safety-700 font-semibold hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Sample Registration Data</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Legal Name"
              type="text"
              icon={<User className="w-4 h-4" />}
              placeholder="e.g., Priya Sen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
              autoComplete="name"
            />

            <Input
              label="Email Address"
              type="email"
              icon={<Mail className="w-4 h-4" />}
              placeholder="priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Account Password"
              type="password"
              icon={<Lock className="w-4 h-4" />}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              helperText="Must be 8 to 72 characters"
              required
              autoComplete="new-password"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Phone (Optional)"
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                autoComplete="tel"
              />

              <Input
                label="Nationality (Optional)"
                type="text"
                icon={<Globe className="w-4 h-4" />}
                placeholder="e.g., India, France"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                error={errors.nationality}
              />
            </div>

            {/* Emergency Contact Group */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                <ShieldAlert className="w-4 h-4 text-emergency-600" />
                <span>Emergency Guardian / Contact Person</span>
              </div>

              <div className="space-y-3">
                <Input
                  label="Guardian / Contact Name"
                  type="text"
                  placeholder="e.g., Rohan Sen (Brother)"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  error={errors.emergencyName}
                />

                <Input
                  label="Emergency Contact Phone"
                  type="tel"
                  placeholder="+91 98111 55667"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  error={errors.emergencyPhone}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-3 font-bold"
            >
              Complete Registration
            </Button>
          </form>

          {/* Links to Login */}
          <div className="text-center pt-2 text-xs text-slate-600">
            <span>Already have a tourist account? </span>
            <Link
              to="/login"
              className="font-bold text-safety-700 hover:text-safety-800 hover:underline"
            >
              Log In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
