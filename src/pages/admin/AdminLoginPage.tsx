import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container } from '../../components/common/Container';
import { Card } from '../../components/common/Card';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/common/Button';
import { PageTransition } from '../../components/layout/PageTransition';
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, resetPassword, user, isAdmin } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password modal state
  const [isForgotOpen, setIsForgotOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // If already logged in and admin, redirect to /admin
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and security password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please check your credentials or contact the hospital IT desk.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    setForgotError(null);

    try {
      await resetPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err: unknown) {
      // Avoid revealing whether account exists
      console.warn('Password reset error:', err);
      setForgotSuccess(true); // Generic message to prevent user enumeration
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <PageTransition className="justify-center items-center py-12 sm:py-16 min-h-[80vh] flex flex-col justify-center">
      <Container size="sm">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <BrandLogo variant="header" linkToHome={true} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#103A50]/10 text-[#103A50] border border-[#103A50]/20 text-xs font-mono font-semibold uppercase tracking-wider">
              <Lock className="w-3 h-3 text-[#0879A5]" />
              Staff Security Gateway
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#103A50] font-normal">
              Admin Authentication
            </h1>
            <p className="text-xs text-[#617786] max-w-sm mx-auto leading-relaxed">
              Protected administrative suite for Deccan Care Maternity &amp; General Hospital.
            </p>
          </div>

          {/* Login Card */}
          <Card variant="default" padding="lg" className="border border-[#D6EAF1] shadow-md bg-white">
            {isForgotOpen ? (
              /* Forgot Password View */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-3">
                  <h3 className="font-serif text-lg text-[#103A50] font-medium">
                    Reset Staff Password
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotOpen(false);
                      setForgotSuccess(false);
                      setForgotError(null);
                    }}
                    className="text-xs font-mono text-[#0879A5] hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>
                </div>

                {forgotSuccess ? (
                  <div className="p-4 rounded-xl bg-[#EEF8FB] border border-[#D6EAF1] text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#0879A5] mx-auto" />
                    <h4 className="font-serif text-base text-[#103A50]">
                      Reset Link Dispatched
                    </h4>
                    <p className="text-xs text-[#617786]">
                      If a staff account exists for that email, password reset instructions have been sent.
                    </p>
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsForgotOpen(false);
                          setForgotSuccess(false);
                        }}
                      >
                        Return to Sign In
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-xs text-[#617786]">
                      Enter your hospital staff email to receive a password reset link.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#17384A] block">
                        Staff Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="admin@deccancare.in"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
                      />
                    </div>

                    {forgotError && (
                      <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#FAD8D8] text-xs text-[#D93636] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={forgotLoading || !forgotEmail}
                    >
                      {forgotLoading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              /* Main Login Form */
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17384A] block">
                    Staff Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@deccancare.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#17384A] block">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(true)}
                      className="text-[11px] font-mono text-[#0879A5] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#617786] hover:text-[#103A50]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#FAD8D8] text-xs text-[#D93636] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isLoading || !email || !password}
                    icon={<Shield className="w-4 h-4" />}
                  >
                    {isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Console'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </Container>
    </PageTransition>
  );
};
