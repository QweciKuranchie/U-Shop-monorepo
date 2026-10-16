"use client";

import React, { useState, useRef, type FormEvent } from "react";
import { useSignIn, useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { useAuthModal } from "@/hooks/useAuthModal";
import Logo from "@/components/common/Logo";

interface AuthSwitchProps {
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

export default function AuthSwitch({
  initialMode = "sign-in",
  isModal = false,
}: AuthSwitchProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "sign-up");
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

  // Email verification OTP state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Validation RegEx patterns & rules
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_REGEX = /^[a-zA-Z\s]+$/;

  // Password Checklist validation rules
  const passwordCriteria = {
    hasMinLength: signUpPassword.length >= 8,
    hasUpper: /[A-Z]/.test(signUpPassword),
    hasLower: /[a-z]/.test(signUpPassword),
    hasNumber: /[0-9]/.test(signUpPassword),
    hasSpecial: /[@$!%*?&]/.test(signUpPassword),
    passwordsMatch:
      signUpPassword.length > 0 && signUpPassword === signUpConfirmPassword,
  };

  const isFirstNameValid =
    signUpFirstName.trim().length >= 2 && NAME_REGEX.test(signUpFirstName.trim());
  const isLastNameValid =
    signUpLastName.trim().length >= 2 && NAME_REGEX.test(signUpLastName.trim());
  const isSignUpEmailValid = EMAIL_REGEX.test(signUpEmail.trim());
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
  const redirectUrl = searchParams.get("redirect_url") || "/";

  const handleOtpChange = (index: number, value: string) => {
    const char = value.slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = char;
    setOtpDigits(newOtp);
    setVerificationCode(newOtp.join(""));

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

  // Google OAuth
  const handleGoogleAuth = async (mode: "sign-in" | "sign-up") => {
    setSignInError("");
    setSignUpError("");

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
        router.replace(dest);
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
      const errorObj = err as {
        errors?: Array<{ message?: string; longMessage?: string; code?: string }>;
        message?: string;
      };
      const msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Google authentication failed. Please try again.";

      if (mode === "sign-in") setSignInError(msg);
      else setSignUpError(msg);
    }
  };

  // Sign In submit
  const handleSignInSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignInError("");

    const trimmedIdentifier = signInIdentifier.trim();
    if (!trimmedIdentifier || !signInPassword) {
      setSignInError("Please enter your email and password.");
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
        } else {
          router.replace(redirectUrl);
        }
      } else {
        setSignInError("Additional sign in steps required.");
      }
    } catch (err: unknown) {
      const errorObj = err as {
        errors?: Array<{ message?: string; longMessage?: string }>;
      };
      const msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Incorrect email or password. Please try again.";
      setSignInError(msg);
    } finally {
      setIsSignInLoading(false);
    }
  };

  // Sign Up submit
  const handleSignUpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpError("");

    if (!isSignUpEmailValid) {
      setSignUpError("Please enter a valid Email Address.");
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
      setSignUpError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    if (!isSignUpLoaded || !signUp) return;
    setIsSignUpLoading(true);

    try {
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
      const errorObj = err as {
        errors?: Array<{ message?: string; longMessage?: string }>;
      };
      const msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Sign up failed. Please check your information and try again.";
      setSignUpError(msg);
    } finally {
      setIsSignUpLoading(false);
    }
  };

  // OTP Verification Submit
  const handleVerifyCodeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpError("");

    if (!verificationCode.trim()) {
      setSignUpError("Please enter the 6-digit code sent to your email.");
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
        } else {
          router.replace(redirectUrl);
        }
      } else {
        setSignUpError("Verification incomplete. Please check the code.");
      }
    } catch (err: unknown) {
      const errorObj = err as {
        errors?: Array<{ message?: string; longMessage?: string }>;
      };
      const msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Invalid or expired verification code. Please try again.";
      setSignUpError(msg);
    } finally {
      setIsSignUpLoading(false);
    }
  };

  // If already signed in
  if (isAuthLoaded && isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[350px] bg-white rounded-3xl shadow-xl text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#6B1FA8] mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Signed In</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          You are already signed in. Taking you to your destination...
        </p>
      </div>
    );
  }

  return (
    <div className="auth-switch">
      <style>{`
        .auth-switch,
        .auth-switch * {
          box-sizing: border-box;
        }

        .auth-switch {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #2a0645 0%, #520f85 50%, #151515 100%);
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
        }

        .auth-switch .container {
          position: relative;
          width: 100%;
          max-width: 940px;
          min-height: 620px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 60px -15px rgba(82, 15, 133, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.35);
          overflow: hidden;
        }

        .auth-switch .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .auth-switch .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .auth-switch form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 1.5rem 3rem;
          transition: all 0.2s 0.7s;
          overflow-y: auto;
          max-height: 600px;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          width: 100%;
        }

        .auth-switch form::-webkit-scrollbar {
          width: 4px;
        }
        .auth-switch form::-webkit-scrollbar-thumb {
          background: rgba(162, 28, 175, 0.25);
          border-radius: 9999px;
        }

        .auth-switch form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-switch form.sign-in-form {
          z-index: 2;
        }

        .auth-switch .title {
          font-size: 1.85rem;
          color: #520f85;
          margin-bottom: 2px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .auth-switch .subtitle {
          font-size: 0.8rem;
          color: #701a75;
          opacity: 0.8;
          margin-bottom: 12px;
        }

        .auth-switch .auth-error-banner {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #E8000B;
          font-size: 0.75rem;
          padding: 7px 12px;
          border-radius: 10px;
          margin-bottom: 10px;
          max-width: 360px;
          width: 100%;
          text-align: center;
          font-weight: 500;
        }

        .auth-switch .input-field {
          max-width: 360px;
          width: 100%;
          background-color: #faf5ff;
          border: 1.5px solid #e9d5ff;
          margin: 4px 0;
          height: 44px;
          border-radius: 44px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          position: relative;
          transition: all 0.25s ease;
        }

        .auth-switch .input-field:focus-within {
          background-color: #ffffff;
          border-color: #D4009B;
          box-shadow: 0 0 0 3px rgba(212, 0, 155, 0.12);
        }

        .auth-switch .input-field .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a21caf;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .auth-switch .input-field:focus-within .icon-container {
          color: #D4009B;
        }

        .auth-switch .input-field input {
          background: none;
          outline: none;
          border: none;
          font-weight: 500;
          font-size: 0.88rem;
          color: #1e1b4b;
          width: 100%;
          padding: 0;
        }

        .auth-switch .input-field input::placeholder {
          color: #9333ea;
          opacity: 0.45;
          font-weight: 400;
        }

        .auth-switch .btn-toggle-eye {
          background: none;
          border: none;
          color: #a21caf;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          margin-left: 6px;
        }

        .auth-switch .btn-toggle-eye:hover {
          color: #D4009B;
        }

        .auth-switch .btn {
          width: 100%;
          max-width: 360px;
          background: linear-gradient(135deg, #D4009B 0%, #6B1FA8 100%);
          border: none;
          outline: none;
          height: 44px;
          border-radius: 44px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.04em;
          margin: 10px 0 6px 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.88rem;
          box-shadow: 0 6px 20px rgba(212, 0, 155, 0.35);
        }

        .auth-switch .btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #6B1FA8 0%, #520f85 100%);
          transform: translateY(-1.5px);
          box-shadow: 0 8px 25px rgba(82, 15, 133, 0.45);
        }

        .auth-switch .btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .auth-switch .social-btn-google {
          width: 100%;
          max-width: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #ffffff;
          border: 1.5px solid #e9d5ff;
          border-radius: 44px;
          padding: 8.5px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          margin-bottom: 8px;
        }

        .auth-switch .social-btn-google:hover {
          border-color: #D4009B;
          background: #faf5ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(212, 0, 155, 0.15);
          color: #520f85;
        }

        .auth-switch .divider {
          width: 100%;
          max-width: 360px;
          display: flex;
          align-items: center;
          margin: 8px 0;
        }

        .auth-switch .divider-line {
          flex: 1;
          height: 1px;
          background: #e9d5ff;
        }

        .auth-switch .divider-text {
          padding: 0 10px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #a21caf;
        }

        .auth-switch .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .auth-switch .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .auth-switch .left-panel {
          pointer-events: all;
          padding: 3rem 16% 2rem 10%;
        }

        .auth-switch .right-panel {
          pointer-events: none;
          padding: 3rem 10% 2rem 16%;
        }

        .auth-switch .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .auth-switch .panel h3 {
          font-weight: 800;
          line-height: 1.15;
          font-size: 1.65rem;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }

        .auth-switch .panel p {
          font-size: 0.88rem;
          padding: 0.6rem 0;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
        }

        .auth-switch .btn.transparent {
          margin: 8px 0 0 0;
          background: rgba(255, 255, 255, 0.12);
          border: 2px solid rgba(255, 255, 255, 0.85);
          width: 140px;
          height: 42px;
          font-weight: 700;
          font-size: 0.82rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .auth-switch .btn.transparent:hover {
          background: #ffffff;
          color: #520f85;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
        }

        .auth-switch .right-panel .content {
          transform: translateX(800px);
        }

        .auth-switch .container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-switch .container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-switch .container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-switch .container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-switch .container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-switch .container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-switch .container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-switch .container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .auth-switch .container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #520f85 0%, #6B1FA8 45%, #D4009B 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        #clerk-captcha {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin: 6px 0;
          min-height: 0;
        }

        #clerk-captcha:empty {
          display: none !important;
          margin: 0 !important;
        }

        @media (max-width: 870px) {
          .auth-switch .container:before {
            display: none !important;
          }
          .auth-switch .panels-container {
            display: none !important;
          }
          .auth-switch .container {
            min-height: auto !important;
            height: auto !important;
            max-height: none !important;
            width: 100% !important;
            max-width: 460px !important;
            margin: 1.5rem auto !important;
            padding: 1.5rem 0.25rem !important;
            border-radius: 1.75rem !important;
            overflow: visible !important;
            box-shadow: 0 12px 40px -12px rgba(82, 15, 133, 0.3) !important;
          }
          .auth-switch .signin-signup {
            position: static !important;
            width: 100% !important;
            top: auto !important;
            left: auto !important;
            transform: none !important;
            transition: none !important;
            height: auto !important;
          }
          .auth-switch form {
            position: static !important;
            transform: none !important;
            width: 100% !important;
            padding: 0.5rem 1.25rem !important;
            transition: none !important;
            min-height: auto !important;
          }
          .auth-switch form.sign-in-form {
            display: flex !important;
            opacity: 1 !important;
            pointer-events: all !important;
          }
          .auth-switch form.sign-up-form {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          .auth-switch .container.sign-up-mode form.sign-in-form {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          .auth-switch .container.sign-up-mode form.sign-up-form {
            display: flex !important;
            opacity: 1 !important;
            pointer-events: all !important;
          }
        }

        @media (max-width: 570px) {
          .auth-switch form {
            padding: 0.5rem 0.75rem !important;
          }
          .auth-switch .input-field {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className={isSignUp ? "container sign-up-mode" : "container"}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* SIGN IN FORM */}
            <form className="sign-in-form" onSubmit={handleSignInSubmit}>
              <div className="mb-1 flex justify-center">
                <Logo imageClassName="h-7 w-auto" />
              </div>
              <h2 className="title">Welcome Back</h2>
              <p className="subtitle">Sign in to your UShop account</p>

              {signInError && <div className="auth-error-banner">{signInError}</div>}

              {/* Primary Google Login */}
              <button
                type="button"
                onClick={() => handleGoogleAuth("sign-in")}
                className="social-btn-google"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">OR EMAIL</span>
                <div className="divider-line" />
              </div>

              <div className="input-field">
                <div className="icon-container">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Email or Username"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="input-field">
                <div className="icon-container">
                  <Lock size={16} />
                </div>
                <input
                  type={showSignInPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  aria-label="Toggle password"
                >
                  {showSignInPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between w-full max-w-[360px] my-1.5 text-xs text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-purple-300 text-[#D4009B] focus:ring-[#D4009B] accent-[#D4009B] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-bold text-[#6B1FA8] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Clerk Bot Protection / Turnstile CAPTCHA */}
              {!isSignUp && (
                <div
                  id="clerk-captcha"
                  className="w-full my-1 flex justify-center items-center min-h-0"
                  data-cl-theme="light"
                  data-cl-size="flexible"
                />
              )}

              <button
                type="submit"
                className="btn"
                disabled={isSignInLoading}
              >
                {isSignInLoading ? "Logging in..." : "Login"}
              </button>

              {/* Mobile toggle link */}
              <div className="mt-2 text-center block md:hidden text-xs text-slate-500">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-bold text-[#D4009B] hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>

            {/* SIGN UP / OTP VERIFICATION FORM */}
            {pendingVerification ? (
              <form onSubmit={handleVerifyCodeSubmit} className="sign-up-form">
                <div className="w-12 h-12 rounded-2xl bg-[#D4009B]/10 text-[#D4009B] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="title">Verify Email</h2>
                <p className="subtitle max-w-xs text-center">
                  Enter the 6-digit verification code sent to{" "}
                  <span className="font-bold text-[#520f85]">{signUpEmail}</span>
                </p>

                {signUpError && <div className="auth-error-banner">{signUpError}</div>}

                {/* 6-Digit OTP Inputs */}
                <div className="grid grid-cols-6 gap-2 w-full max-w-[320px] my-4">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-full h-12 text-center text-lg font-extrabold bg-[#faf5ff] border-2 border-[#e9d5ff] rounded-xl focus:border-[#D4009B] focus:bg-white focus:outline-none transition-all text-[#1e1b4b]"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={isSignUpLoading || verificationCode.length < 6}
                >
                  {isSignUpLoading ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>
            ) : (
              <form className="sign-up-form" onSubmit={handleSignUpSubmit}>
                <div className="mb-1 flex justify-center">
                  <Logo imageClassName="h-7 w-auto" />
                </div>
                <h2 className="title">Create Account</h2>
                <p className="subtitle">Join Ghana&apos;s leading tech marketplace</p>

                {signUpError && <div className="auth-error-banner">{signUpError}</div>}

                {/* Primary Google Sign Up */}
                <button
                  type="button"
                  onClick={() => handleGoogleAuth("sign-up")}
                  className="social-btn-google"
                >
                  <GoogleIcon />
                  <span>Sign up with Google</span>
                </button>

                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">OR EMAIL</span>
                  <div className="divider-line" />
                </div>

                {/* Name fields row */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[360px]">
                  <div className="input-field !max-w-none">
                    <div className="icon-container">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={signUpFirstName}
                      onChange={(e) => setSignUpFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-field !max-w-none">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={signUpLastName}
                      onChange={(e) => setSignUpLastName(e.target.value)}
                      className="pl-2"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="input-field">
                  <div className="icon-container">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Username */}
                <div className="input-field">
                  <div className="icon-container">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Username (Optional)"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="input-field">
                  <div className="icon-container">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    placeholder="Password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    aria-label="Toggle password"
                  >
                    {showSignUpPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="input-field">
                  <div className="icon-container">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Password Criteria Checklist */}
                {signUpPassword.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-full max-w-[360px] p-2 bg-purple-50/70 border border-purple-100 rounded-xl my-1.5 text-[11px]">
                    <div
                      className={`flex items-center gap-1 ${passwordCriteria.hasMinLength ? "text-emerald-600 font-semibold" : "text-slate-500"}`}
                    >
                      <Check size={11} className={passwordCriteria.hasMinLength ? "opacity-100" : "opacity-30"} />
                      <span>At least 8 chars</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${passwordCriteria.hasUpper ? "text-emerald-600 font-semibold" : "text-slate-500"}`}
                    >
                      <Check size={11} className={passwordCriteria.hasUpper ? "opacity-100" : "opacity-30"} />
                      <span>Uppercase letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${passwordCriteria.hasLower ? "text-emerald-600 font-semibold" : "text-slate-500"}`}
                    >
                      <Check size={11} className={passwordCriteria.hasLower ? "opacity-100" : "opacity-30"} />
                      <span>Lowercase letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? "text-emerald-600 font-semibold" : "text-slate-500"}`}
                    >
                      <Check size={11} className={passwordCriteria.hasNumber ? "opacity-100" : "opacity-30"} />
                      <span>A number</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? "text-emerald-600 font-semibold" : "text-slate-500"}`}
                    >
                      <Check size={11} className={passwordCriteria.hasSpecial ? "opacity-100" : "opacity-30"} />
                      <span>Special (@$!%*?&)</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${passwordCriteria.passwordsMatch ? "text-emerald-600 font-semibold" : "text-slate-500"}`}
                    >
                      <Check size={11} className={passwordCriteria.passwordsMatch ? "opacity-100" : "opacity-30"} />
                      <span>Passwords match</span>
                    </div>
                  </div>
                )}

                {/* Terms Agreement */}
                <div className="flex items-start gap-2 w-full max-w-[360px] my-1 text-left">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-purple-300 text-[#D4009B] focus:ring-[#D4009B] accent-[#D4009B] cursor-pointer shrink-0"
                    required
                  />
                  <label htmlFor="acceptTerms" className="text-[11px] text-slate-700 cursor-pointer leading-tight">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#6B1FA8] font-bold hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#6B1FA8] font-bold hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Clerk Bot Protection / Turnstile CAPTCHA */}
                {isSignUp && (
                  <div
                    id="clerk-captcha"
                    className="w-full my-1 flex justify-center items-center min-h-0"
                    data-cl-theme="light"
                    data-cl-size="flexible"
                  />
                )}

                <button
                  type="submit"
                  className="btn"
                  disabled={isSignUpLoading}
                >
                  {isSignUpLoading ? "Signing Up..." : "Sign Up"}
                </button>

                {/* Mobile toggle link */}
                <div className="mt-2 text-center block md:hidden text-xs text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="font-bold text-[#D4009B] hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* PANELS OVERLAY */}
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New to UShop?</h3>
              <p>
                Join thousands getting the best deals on laptops, smartphones, and
                gadgets from trusted sellers across Ghana.
              </p>
              <button
                type="button"
                className="btn transparent"
                onClick={() => setIsSignUp(true)}
              >
                Sign up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>
                Welcome back! Sign in to continue exploring verified tech deals,
                order tracking, and exclusive discounts.
              </p>
              <button
                type="button"
                className="btn transparent"
                onClick={() => setIsSignUp(false)}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
