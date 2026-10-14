"use client";

import React, { useState, useRef } from "react";
import { useSignIn, useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Check, Truck, Tag, Loader2 } from "lucide-react";
import { useAuthModal } from "@/hooks/useAuthModal";
import Logo from "@/components/common/Logo";
import "./SlidingAuthContainer.css";

interface SlidingAuthProps {
  initialMode?: "sign-in" | "sign-up";
  isModal?: boolean;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function SlidingAuthContainer({ initialMode = "sign-in", isModal = false }: SlidingAuthProps) {
  const [isRightPanelActive, setIsRightPanelActive] = useState(initialMode === "sign-up");
  const { closeAuthModal } = useAuthModal();

  // Visibility toggles
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Sign In state
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [signInError, setSignInError] = useState("");
  const [isSignInLoading, setIsSignInLoading] = useState(false);

  // Sign Up state
  const [signUpFirstName, setSignUpFirstName] = useState("");
  const [signUpLastName, setSignUpLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Email verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric or clean char
    const char = value.slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = char;
    setOtpDigits(newOtp);
    setVerificationCode(newOtp.join(""));

    // Auto-advance to next input
    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otpDigits];
    pastedData.split("").forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtpDigits(newOtp);
    setVerificationCode(newOtp.join(""));
    const focusIdx = Math.min(pastedData.length, 5);
    otpInputsRef.current[focusIdx]?.focus();
  };

  // Touched state for field-level error display
  const [touchedSignIn, setTouchedSignIn] = useState({ identifier: false, password: false });
  const [touchedSignUp, setTouchedSignUp] = useState({
    firstName: false,
    lastName: false,
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  // Validation RegEx patterns & rules
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_REGEX = /^[a-zA-Z\s]+$/;
  const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

  // Sign In Validation
  const isSignInIdentifierValid = signInIdentifier.trim().length >= 3;
  const isSignInPasswordValid = signInPassword.length >= 6;

  // Password Checklist validation rules
  const passwordCriteria = {
    hasMinLength: signUpPassword.length >= 8,
    hasUpper: /[A-Z]/.test(signUpPassword),
    hasLower: /[a-z]/.test(signUpPassword),
    hasNumber: /[0-9]/.test(signUpPassword),
    hasSpecial: /[@$!%*?&]/.test(signUpPassword),
    passwordsMatch: signUpPassword.length > 0 && signUpPassword === signUpConfirmPassword,
  };

  // Sign Up Validation
  const isFirstNameValid = signUpFirstName.trim().length >= 2 && NAME_REGEX.test(signUpFirstName.trim());
  const isLastNameValid = signUpLastName.trim().length >= 2 && NAME_REGEX.test(signUpLastName.trim());
  const isSignUpEmailValid = EMAIL_REGEX.test(signUpEmail.trim());
  const isSignUpUsernameValid =
    !signUpUsername.trim() || USERNAME_REGEX.test(signUpUsername.trim());
  const isSignUpPasswordValid =
    passwordCriteria.hasMinLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecial &&
    passwordCriteria.passwordsMatch;

  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || searchParams.get("redirectUrl") || "/";

  React.useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      if (isModal) {
        closeAuthModal();
      } else {
        const dest =
          redirectUrl &&
          !redirectUrl.includes("sign-in") &&
          !redirectUrl.includes("sign-up")
            ? redirectUrl
            : "/";
        if (dest.startsWith("http://") || dest.startsWith("https://")) {
          window.location.href = dest;
        } else {
          router.replace(dest);
        }
      }
    }
  }, [isAuthLoaded, isSignedIn, isModal, redirectUrl, router, closeAuthModal]);

  // Google OAuth Handler
  const handleGoogleAuth = async (mode: "sign-in" | "sign-up") => {
    // If already signed in, immediately navigate away or close modal
    if (isSignedIn) {
      if (isModal) {
        closeAuthModal();
      } else {
        const dest =
          redirectUrl &&
          !redirectUrl.includes("sign-in") &&
          !redirectUrl.includes("sign-up")
            ? redirectUrl
            : "/";
        if (dest.startsWith("http://") || dest.startsWith("https://")) {
          window.location.href = dest;
        } else {
          router.replace(dest);
        }
      }
      return;
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const ssoCallbackUrl = origin ? `${origin}/sso-callback` : "/sso-callback";

      if (isSignInLoaded && signIn) {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: ssoCallbackUrl,
          redirectUrlComplete: redirectUrl,
        });
      } else if (isSignUpLoaded && signUp) {
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: ssoCallbackUrl,
          redirectUrlComplete: redirectUrl,
        });
      }
    } catch (err: unknown) {
      console.error("Clerk Google OAuth Error:", err);
      const errorObj = err as {
        errors?: Array<{ message?: string; longMessage?: string; code?: string }>;
        message?: string;
      };
      const rawMsg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        errorObj?.message ||
        "";
      const errCode = errorObj?.errors?.[0]?.code || "";

      // If already signed in, don't show an error — immediately complete the redirect
      if (
        rawMsg.toLowerCase().includes("already signed in") ||
        errCode === "session_exists" ||
        isSignedIn
      ) {
        if (isModal) {
          closeAuthModal();
        } else {
          const dest =
            redirectUrl &&
            !redirectUrl.includes("sign-in") &&
            !redirectUrl.includes("sign-up")
              ? redirectUrl
              : "/";
          if (dest.startsWith("http://") || dest.startsWith("https://")) {
            window.location.href = dest;
          } else {
            router.replace(dest);
          }
        }
        return;
      }

      let msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Google authentication failed. Please try again.";

      if (msg.includes("does not match one of the allowed values for parameter strategy")) {
        msg =
          "Google sign-in is not enabled in your Clerk Dashboard. Please enable Google under Social Connections in your Clerk Dashboard, or sign in with email & password.";
      }

      if (mode === "sign-in") setSignInError(msg);
      else setSignUpError(msg);
    }
  };

  // If already signed in, show a clean redirection spinner instead of the login form
  if (isAuthLoaded && isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[350px] bg-white rounded-2xl shadow-sm text-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Signed In</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          You are already signed in. Taking you to your destination...
        </p>
      </div>
    );
  }

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setTouchedSignIn({ identifier: true, password: true });

    const trimmedIdentifier = signInIdentifier.trim();
    if (!trimmedIdentifier || !signInPassword) {
      setSignInError("Please enter your email/username and password.");
      return;
    }

    if (!isSignInLoaded || !signIn) return;
    setIsSignInLoading(true);

    try {
      const result = await signIn.create({
        identifier: trimmedIdentifier,
        password: signInPassword,
      });

      if (result.status === "complete") {
        await setSignInActive({
          session: result.createdSessionId,
          redirectUrl,
        });
        if (isModal) {
          closeAuthModal();
        }
      } else if (result.status === "needs_first_factor") {
        const passwordResult = await signIn.attemptFirstFactor({
          strategy: "password",
          password: signInPassword,
        });
        if (passwordResult.status === "complete") {
          await setSignInActive({
            session: passwordResult.createdSessionId,
            redirectUrl,
          });
          if (isModal) {
            closeAuthModal();
          }
        } else {
          setSignInError("Sign-in verification incomplete. Please try again.");
        }
      } else {
        setSignInError("Additional sign-in verification required.");
      }
    } catch (err: unknown) {
      const errorObj = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      const msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Login failed. Please check your email/username and password.";
      setSignInError(msg);
    } finally {
      setIsSignInLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setTouchedSignUp({
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    });

    if (!isSignUpEmailValid) {
      setSignUpError("Please enter a valid Email Address (e.g. yourname@gmail.com).");
      return;
    }
    if (!isFirstNameValid || !isLastNameValid) {
      setSignUpError("Please enter valid First and Last names (at least 2 letters).");
      return;
    }
    if (!isSignUpPasswordValid) {
      setSignUpError("Please fulfill all password security requirements.");
      return;
    }
    if (!acceptedTerms) {
      setSignUpError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    if (!isSignUpLoaded || !signUp) return;
    setIsSignUpLoading(true);

    try {
      // Build clean payload without passing undefined username
      const signUpParams: {
        firstName: string;
        lastName: string;
        emailAddress: string;
        password: string;
        username?: string;
      } = {
        firstName: signUpFirstName.trim(),
        lastName: signUpLastName.trim(),
        emailAddress: signUpEmail.trim(),
        password: signUpPassword,
      };

      if (signUpUsername.trim()) {
        signUpParams.username = signUpUsername.trim();
      }

      const signUpAttempt = await signUp.create(signUpParams);

      if (signUpAttempt.status === "complete") {
        await setSignUpActive({
          session: signUpAttempt.createdSessionId,
          redirectUrl,
        });
        if (isModal) {
          closeAuthModal();
        }
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const errorObj = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      const msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Sign up failed. Please check your information and try again.";
      setSignUpError(msg);
    } finally {
      setIsSignUpLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");

    if (!verificationCode.trim()) {
      setSignUpError("Please enter the verification code sent to your email.");
      return;
    }

    if (!isSignUpLoaded || !signUp) return;
    setIsSignUpLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (completeSignUp.status === "complete") {
        if (completeSignUp.createdSessionId) {
          await setSignUpActive({
            session: completeSignUp.createdSessionId,
            redirectUrl,
          });
        }
        if (isModal) {
          closeAuthModal();
        }
      } else if (signUp.status === "complete" && signUp.createdSessionId) {
        await setSignUpActive({
          session: signUp.createdSessionId,
          redirectUrl,
        });
        if (isModal) {
          closeAuthModal();
        }
      } else {
        setSignUpError(`Verification status: ${completeSignUp.status}. Please check the code.`);
      }
    } catch (err: unknown) {
      const errorObj = err as { errors?: Array<{ message?: string; longMessage?: string; code?: string }> };
      const errCode = errorObj?.errors?.[0]?.code;
      const errMsg = errorObj?.errors?.[0]?.longMessage || errorObj?.errors?.[0]?.message;

      // Handle already verified state gracefully
      if (
        errCode === "complete_signup_already_verified" ||
        errMsg?.toLowerCase().includes("already verified") ||
        signUp?.status === "complete"
      ) {
        if (signUp?.createdSessionId) {
          await setSignUpActive({
            session: signUp.createdSessionId,
            redirectUrl,
          });
          if (isModal) {
            closeAuthModal();
          }
          return;
        }
      }
      setSignUpError(errMsg || "Invalid verification code. Please try again.");
    } finally {
      setIsSignUpLoading(false);
    }
  };

  const handleSwitchToSignUp = () => {
    setSignInError("");
    setSignUpError("");
    setTouchedSignIn({ identifier: false, password: false });
    setIsRightPanelActive(true);
    if (!isModal) {
      router.replace("/sign-up");
    }
  };

  const handleSwitchToSignIn = () => {
    setSignInError("");
    setSignUpError("");
    setTouchedSignUp({
      firstName: false,
      lastName: false,
      email: false,
      username: false,
      password: false,
      confirmPassword: false,
    });
    setIsRightPanelActive(false);
    if (!isModal) {
      router.replace("/sign-in");
    }
  };

  return (
    <div className="auth-sliding-wrapper">
      {/* Clerk Bot Protection / Turnstile CAPTCHA container */}
      <div id="clerk-captcha" />
      <div
        className={`auth-container ${isRightPanelActive ? "right-panel-active" : ""}`}
        id="container"
      >
        {/* Sign Up Form */}
        <div className="auth-form-container auth-sign-up-container">
          {pendingVerification ? (
            <form onSubmit={handleVerifyCodeSubmit} className="auth-form flex flex-col items-center text-center p-4 sm:p-6 w-full max-w-[420px] mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-ushop-pink/10 text-ushop-pink flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">Email Verify OTP</h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 text-center max-w-xs">
                Enter the 6-digit code sent to{" "}
                <span className="font-bold text-ushop-purple break-all">{signUpEmail}</span>
              </p>

              {signUpError && (
                <div className="auth-error w-full text-xs py-2 px-3 mt-3 bg-red-50 text-ushop-red border border-red-200 rounded-xl">
                  {signUpError}
                </div>
              )}
              
              {/* 6-Digit OTP Inputs Grid */}
              <div className="grid grid-cols-6 gap-2 sm:gap-2.5 w-full mt-6 max-w-xs">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-full h-12 bg-ushop_light_bg/80 focus:bg-white text-gray-900 font-bold text-xl rounded-xl border border-gray-200 focus:border-ushop-purple focus:ring-2 focus:ring-ushop-purple/20 outline-none text-center transition-all shadow-xs"
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isSignUpLoading}
                className="mt-6 w-full max-w-xs h-11 rounded-full text-white text-sm font-bold bg-ushop-purple hover:bg-ushop-purple-dark transition-all shadow-md hover:shadow-lg transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSignUpLoading ? "Verifying Email..." : "Verify Email"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPendingVerification(false);
                  setOtpDigits(["", "", "", "", "", ""]);
                  setVerificationCode("");
                }}
                className="mt-4 text-xs text-ushop-purple hover:underline font-semibold cursor-pointer"
              >
                ← Back / Change Email
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="auth-form">
              <div className="auth-form-content w-full my-auto flex flex-col items-center">
                {/* Mobile Navigation Tabs */}
                <div className="auth-mobile-tabs">
                  <button
                    type="button"
                    onClick={handleSwitchToSignIn}
                    className="auth-mobile-tab"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="auth-mobile-tab active"
                  >
                    Sign Up
                  </button>
                </div>

                <div className="mb-1.5 flex justify-center">
                  <Logo imageClassName="h-6 sm:h-7 md:h-8 w-auto" />
                </div>

                <h1>Create Account</h1>
                <p className="auth-subtitle">Join UShop tech marketplace today</p>
                
                {signUpError && <div className="auth-error">{signUpError}</div>}

                {/* Google Sign Up Option */}
                <button
                  type="button"
                  onClick={() => handleGoogleAuth("sign-up")}
                  className="auth-google-btn"
                >
                  <GoogleIcon />
                  <span>Sign up with Google</span>
                </button>

                <div className="auth-divider">
                  <div className="auth-divider-line"></div>
                  <span className="auth-divider-text">OR EMAIL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  <div className="auth-input-group">
                    <User className="auth-input-icon" />
                    <input
                      type="text"
                      name="firstName"
                      className={`auth-input ${touchedSignUp.firstName && !isFirstNameValid ? "!border-rose-400" : ""}`}
                      placeholder="First Name"
                      value={signUpFirstName}
                      onChange={(e) => setSignUpFirstName(e.target.value)}
                      onBlur={() => setTouchedSignUp((prev) => ({ ...prev, firstName: true }))}
                      required
                    />
                  </div>
                  <div className="auth-input-group">
                    <User className="auth-input-icon" />
                    <input
                      type="text"
                      name="lastName"
                      className={`auth-input ${touchedSignUp.lastName && !isLastNameValid ? "!border-rose-400" : ""}`}
                      placeholder="Last Name"
                      value={signUpLastName}
                      onChange={(e) => setSignUpLastName(e.target.value)}
                      onBlur={() => setTouchedSignUp((prev) => ({ ...prev, lastName: true }))}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <Mail className="auth-input-icon" />
                  <input
                    type="email"
                    name="email"
                    className={`auth-input ${touchedSignUp.email && !isSignUpEmailValid ? "!border-rose-400" : ""}`}
                    placeholder="Email Address (e.g. name@gmail.com)"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    onBlur={() => setTouchedSignUp((prev) => ({ ...prev, email: true }))}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <User className="auth-input-icon" />
                  <input
                    type="text"
                    name="username"
                    className={`auth-input ${touchedSignUp.username && !isSignUpUsernameValid ? "!border-rose-400" : ""}`}
                    placeholder="Username (Optional)"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    onBlur={() => setTouchedSignUp((prev) => ({ ...prev, username: true }))}
                  />
                </div>

                <div className="auth-input-group">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    name="password"
                    className="auth-input auth-input-has-toggle"
                    placeholder="Password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="auth-input-group">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    name="confirm_password"
                    className="auth-input"
                    placeholder="Confirm Password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Password Requirements Checklist */}
                {(signUpPassword.length > 0 || signUpConfirmPassword.length > 0) && (
                  <div className="w-full my-2 p-2.5 rounded-xl bg-white border border-purple-200/90 shadow-sm text-left text-xs space-y-1 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMinLength ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}`}>
                        <Check className={`w-3.5 h-3.5 shrink-0 ${passwordCriteria.hasMinLength ? "text-emerald-600 stroke-[3]" : "text-slate-400 stroke-[2]"}`} />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}`}>
                        <Check className={`w-3.5 h-3.5 shrink-0 ${passwordCriteria.hasUpper ? "text-emerald-600 stroke-[3]" : "text-slate-400 stroke-[2]"}`} />
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLower ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}`}>
                        <Check className={`w-3.5 h-3.5 shrink-0 ${passwordCriteria.hasLower ? "text-emerald-600 stroke-[3]" : "text-slate-400 stroke-[2]"}`} />
                        <span>Lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}`}>
                        <Check className={`w-3.5 h-3.5 shrink-0 ${passwordCriteria.hasNumber ? "text-emerald-600 stroke-[3]" : "text-slate-400 stroke-[2]"}`} />
                        <span>A number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}`}>
                        <Check className={`w-3.5 h-3.5 shrink-0 ${passwordCriteria.hasSpecial ? "text-emerald-600 stroke-[3]" : "text-slate-400 stroke-[2]"}`} />
                        <span>Special character (@$!%*?&)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.passwordsMatch ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}`}>
                        <Check className={`w-3.5 h-3.5 shrink-0 ${passwordCriteria.passwordsMatch ? "text-emerald-600 stroke-[3]" : "text-slate-400 stroke-[2]"}`} />
                        <span>Passwords match</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Privacy Policy Checkbox */}
                <div className="flex items-center gap-2 my-2 text-left w-full">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-purple-300 text-ushop-pink focus:ring-ushop-pink accent-ushop-pink cursor-pointer shrink-0"
                    required
                  />
                  <label htmlFor="acceptTerms" className="text-xs text-slate-700 cursor-pointer font-medium leading-tight">
                    I agree to the{" "}
                    <Link href="/terms" className="text-ushop-purple font-bold hover:underline" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-ushop-purple font-bold hover:underline" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div className="auth-button-group">
                  <button type="submit" className="auth-button" disabled={isSignUpLoading}>
                    {isSignUpLoading ? "Signing Up..." : "Sign Up"}
                  </button>
                </div>

                {/* Mobile Switch Link */}
                <div className="mt-3 pt-2.5 border-t border-purple-100/80 w-full text-center block md:hidden">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={handleSwitchToSignIn}
                      className="font-bold text-ushop-pink hover:underline cursor-pointer ml-1"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sign In Form */}
        <div className="auth-form-container auth-sign-in-container">
          <form onSubmit={handleSignInSubmit} className="auth-form">
            <div className="auth-form-content w-full my-auto flex flex-col items-center">
              {/* Mobile Navigation Tabs */}
              <div className="auth-mobile-tabs">
                <button
                  type="button"
                  className="auth-mobile-tab active"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToSignUp}
                  className="auth-mobile-tab"
                >
                  Sign Up
                </button>
              </div>

              <div className="mb-1.5 flex justify-center">
                <Logo imageClassName="h-6 sm:h-7 md:h-8 w-auto" />
              </div>

              <h1>Welcome Back</h1>
              <p className="auth-subtitle">Sign in to your UShop account</p>

              {signInError && <div className="auth-error">{signInError}</div>}

              {/* Google Sign In Option */}
              <button
                type="button"
                onClick={() => handleGoogleAuth("sign-in")}
                className="auth-google-btn"
              >
                <GoogleIcon />
                <span>Sign in with Google</span>
              </button>

              <div className="auth-divider">
                <div className="auth-divider-line"></div>
                <span className="auth-divider-text">OR EMAIL</span>
              </div>

              <div className="auth-input-group">
                <Mail className="auth-input-icon" />
                <input
                  type="text"
                  name="username"
                  className={`auth-input ${touchedSignIn.identifier && !isSignInIdentifierValid ? "!border-rose-400" : ""}`}
                  placeholder="you@gmail.com or +233..."
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  onBlur={() => setTouchedSignIn((prev) => ({ ...prev, identifier: true }))}
                  required
                />
              </div>

              <div className="auth-input-group">
                <Lock className="auth-input-icon" />
                <input
                  type={showSignInPassword ? "text" : "password"}
                  name="password"
                  className={`auth-input auth-input-has-toggle ${touchedSignIn.password && !isSignInPasswordValid ? "!border-rose-400" : ""}`}
                  placeholder="Password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  onBlur={() => setTouchedSignIn((prev) => ({ ...prev, password: true }))}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Remember my device & Forgot Password */}
              <div className="flex items-center justify-between w-full my-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-purple-300 text-ushop-pink focus:ring-ushop-pink accent-ushop-pink cursor-pointer"
                  />
                  <span>Remember my device</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-bold text-ushop-purple hover:underline"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="auth-button-group">
                <button type="submit" className="auth-button" disabled={isSignInLoading}>
                  {isSignInLoading ? "Logging in..." : "Login"}
                </button>
              </div>

              <p className="text-xs text-center text-slate-500 leading-relaxed pt-2 mt-1">
                By continuing, you agree to U-Shop&apos;s{" "}
                <Link className="text-ushop-purple underline hover:text-ushop-pink transition-colors font-semibold" href="/terms" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="text-ushop-purple underline hover:text-ushop-pink transition-colors font-semibold" href="/privacy" onClick={(e) => e.stopPropagation()}>
                  Privacy Policy
                </Link>.
              </p>

              {/* Mobile Switch Link */}
              <div className="mt-3 pt-2.5 border-t border-purple-100/80 w-full text-center block md:hidden">
                <p className="text-xs text-slate-500">
                  Don&rsquo;t have an account?{" "}
                  <button
                    type="button"
                    onClick={handleSwitchToSignUp}
                    className="font-bold text-ushop-pink hover:underline cursor-pointer ml-1"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Overlay Container */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel auth-overlay-left relative overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                  alt="Students using tech products and laptops"
                  className="w-full h-full object-cover opacity-80"
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                  fill
                  sizes="50vw"
                  priority
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#520f85]/55 via-[rgba(82,15,133,0.35)] to-[#191022]/80" />
              </div>

              {/* Foreground Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center w-full px-5 lg:px-8 gap-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-black/40 border border-white/20 px-4 py-1.5 rounded-full">
                  <Tag className="w-3 h-3 text-[#D4009B]" />
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/90">Exclusive</span>
                </div>

                {/* Heading */}
                <h1 className="text-xl lg:text-[1.65rem] font-extrabold text-white leading-snug drop-shadow-md">
                  Empowering <span className="text-[#D4009B]">You</span>
                  <br />
                  with Affordable Tech.
                </h1>

                {/* Description */}
                <p className="text-xs lg:text-xs text-white/90 leading-relaxed max-w-[240px] drop-shadow-sm font-medium">
                  Join thousands getting the best deals on laptops, smartphones, and tech from trusted sellers across Ghana.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 gap-2.5 w-full max-w-[280px]">
                  <div className="flex flex-col items-center gap-1.5 bg-black/45 border border-white/20 rounded-xl px-3 py-3">
                    <ShieldCheck className="w-5 h-5 text-[#D4009B]" />
                    <p className="font-bold text-xs text-white leading-tight">Verified Sellers</p>
                    <p className="text-xs text-white/75 leading-tight">Shop with confidence</p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 bg-black/45 border border-white/20 rounded-xl px-3 py-3">
                    <Truck className="w-5 h-5 text-[#D4009B]" />
                    <p className="font-bold text-xs text-white leading-tight">Nationwide Delivery</p>
                    <p className="text-xs text-white/75 leading-tight">Straight to your doorstep</p>
                  </div>
                </div>

                {/* Switch to Login */}
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="text-xs text-white/70 font-medium">Already have an account?</span>
                  <button className="auth-ghost-overlay" onClick={handleSwitchToSignIn}>
                    Login
                  </button>
                </div>
              </div>
            </div>
            <div className="auth-overlay-panel auth-overlay-right relative overflow-hidden">
              {/* Sharp Background Image with Crisp Gradient Overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                  alt="Students collaborating"
                  className="w-full h-full object-cover opacity-75"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-llH9qahVl1cL5QpV15iSOUpxhHrkLBHed_nTgR2B3TNE9N75P1em7L54H-OLN9_i_OnJ3OSpFAkVW_mc0PI7H1E_7ETgi2JNktF7Fq52vH8zFLngbFowghwbfQymwy4PjWTwvhiK_jpM2Dzgwnm8bc0WgwabLQ_qSSpu-hjsd9X9RoBq4IIq9btA0KiMgJxumPq5gFzXkyrCsKLEuNGp12qIXoYsVkPzoPOGAf2yKbQJ-gWuNFMY4sNSRWWlBUQoTdRV7-l4R3E"
                  fill
                  sizes="50vw"
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191022] via-[rgba(25,16,34,0.65)] to-transparent" />
              </div>

              {/* Foreground Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center w-full">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-white/20 rounded-full mb-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-white/90">#1 Tech Marketplace</span>
                </div>

                {/* Heading */}
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Buy, Sell, and Upgrade{" "}
                  <span className="text-purple-200 block mt-0.5">
                    Your Tech.
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xs lg:text-sm text-white/85 leading-relaxed my-3 max-w-xs">
                  Join thousands across Ghana getting the best deals on laptops, phones, and accessories.
                </p>

                {/* Social Proof */}
                <div className="flex items-center justify-center gap-3 my-3">
                  <div className="flex -space-x-2.5">
                    <Image
                      alt="Student profile"
                      className="w-8 h-8 rounded-full border-2 border-purple-400 object-cover shadow-sm"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      width={32}
                      height={32}
                    />
                    <Image
                      alt="Student profile"
                      className="w-8 h-8 rounded-full border-2 border-purple-400 object-cover shadow-sm"
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                      width={32}
                      height={32}
                    />
                    <Image
                      alt="Student profile"
                      className="w-8 h-8 rounded-full border-2 border-purple-400 object-cover shadow-sm"
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                      width={32}
                      height={32}
                    />
                  </div>
                  <p className="text-xs text-white/90">
                    <span className="font-bold text-white">2,000+</span> joined this week
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-center gap-3">
                  <span className="text-xs text-white/90 font-medium">Are you new to UShop?</span>
                  <button className="auth-ghost-overlay" onClick={handleSwitchToSignUp}>
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
