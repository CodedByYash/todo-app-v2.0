"use client";
import { FloatingParticles } from "@/components/ui/custom/floatingParticle";
import {
  ArrowRight,
  CheckCircle,
  Github,
  Lock,
  Mail,
  Sparkles,
  Star,
  User,
  Zap,
} from "lucide-react";
import { NextResponse } from "next/server";
import { useEffect, useState } from "react";
import { ThemeToggle, useTheme } from "@/components/ui/custom/theme-component";
import { AnimatePresence, motion, Variants } from "motion/react";
import { OAuthButton } from "@/components/ui/custom/enhanced-oauth";
import { EnhancedInput } from "@/components/ui/custom/enhanced-input";
import { EnhancedCheckbox } from "@/components/ui/custom/enhanced-checkbox";
import { signIn } from "next-auth/react";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUpPage: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter a valid email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });
      return NextResponse.json(response);
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Internal Server error" },
        { status: 500 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/onboarding-redirect" });
  };

  const handleGithubSignIn = () => {
    signIn("github", { callbackUrl: "/onboarding-redirect" });
  };

  const passwordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return "from-red-400 to-red-500";
    if (strength <= 3) return "from-orange-400 to-orange-500";
    if (strength <= 4) return "from-yellow-400 to-yellow-500";
    return "from-green-400 to-green-500";
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      text: "Lightning fast task management",
    },
    {
      icon: <Star className="w-6 h-6" />,
      text: "Beautiful, intuitive interface",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      text: "Boost your productivity 10x",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      text: "Smart AI-powered suggestions",
    },
  ];

  return (
    <div
      className={`min-h-screen ${theme.bg} relative overflow-hidden transition-all duration-500`}
    >
      {/* Theme Toggle */}
      <ThemeToggle theme={theme} />

      {/* Animated background */}
      <div
        className={`absolute inset-0 ${
          theme.isDark
            ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-blue-900 to-slate-900"
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-purple-100 to-pink-100"
        }`}
      />

      {/* Floating particles */}
      <FloatingParticles theme={theme} />

      {/* Grid pattern overlay */}
      <div
        className={`absolute inset-0 ${
          theme.isDark
            ? "bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)]"
            : "bg-[linear-gradient(rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.05)_1px,transparent_1px)]"
        } bg-[size:50px_50px] opacity-20`}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left Side - Hero Section */}
          <motion.div variants={itemVariants} className="relative pt-8">
            <div className="text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <h1
                  className={`text-5xl lg:text-7xl font-bold ${
                    theme.isDark
                      ? "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                      : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                  } bg-clip-text text-transparent leading-tight`}
                >
                  Welcome to
                  <br />
                  <span className="relative">
                    to Taskito
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles
                        className={`w-8 h-8 ${
                          theme.isDark ? "text-yellow-400" : "text-yellow-500"
                        }`}
                      />
                    </motion.div>
                  </span>
                </h1>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className={`text-xl ${theme.textSecondary} max-w-lg`}
              >
                Transform your productivity with our AI-powered task management
                platform. Join thousands of users who've revolutionized their
                workflow.
              </motion.p>

              {/* Animated features */}
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`flex items-center space-x-3 ${theme.textSecondary}`}
                  >
                    <div
                      className={`${
                        theme.isDark ? "text-blue-400" : "text-blue-500"
                      }`}
                    >
                      {features[currentStep].icon}
                    </div>
                    <span className="text-lg">
                      {features[currentStep].text}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Sign In Form */}
          <motion.div variants={itemVariants} className="relative">
            <div
              className={`relative ${theme.cardBg} rounded-2xl p-6 border shadow-2xl max-w-md mx-auto`}
            >
              {/* Glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${theme.glowEffect} rounded-2xl blur-xl`}
              />

              <div className="relative z-10">
                <motion.div
                  variants={itemVariants}
                  className="text-center mb-6"
                >
                  <h2
                    className={`text-2xl font-bold ${theme.textPrimary} mb-2`}
                  >
                    Create Your Account
                  </h2>
                  <p className={`${theme.textSecondary} text-sm`}>
                    Start your productivity journey today
                  </p>
                </motion.div>

                <div className="space-y-4">
                  {/* OAuth Providers */}
                  <motion.div variants={itemVariants} className="space-y-3">
                    <OAuthButton
                      provider="google"
                      onClick={handleGoogleSignIn}
                      theme={theme}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span
                        className={`${theme.oauthText} font-medium text-sm`}
                      >
                        Continue with Google
                      </span>
                    </OAuthButton>

                    <OAuthButton
                      provider="github"
                      onClick={handleGithubSignIn}
                      theme={theme}
                    >
                      <Github className={`w-4 h-4 ${theme.oauthText}`} />
                      <span
                        className={`${theme.oauthText} font-medium text-sm`}
                      >
                        Continue with GitHub
                      </span>
                    </OAuthButton>
                  </motion.div>

                  {/* Divider */}
                  <motion.div variants={itemVariants} className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className={`w-full border-t ${
                          theme.isDark ? "border-white/20" : "border-gray-300"
                        }`}
                      ></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span
                        className={`px-3 ${
                          theme.isDark ? "bg-white/10" : "bg-white/80"
                        } ${theme.textSecondary} rounded-full text-xs`}
                      >
                        Or continue with email
                      </span>
                    </div>
                  </motion.div>

                  {/*Fields */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <EnhancedInput
                      icon={<User className="w-4 h-4" />}
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      error={errors.fullName}
                      theme={theme}
                    />
                    <EnhancedInput
                      icon={<Mail className="w-4 h-4" />}
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      theme={theme}
                    />

                    <EnhancedInput
                      icon={<Lock className="w-4 h-4" />}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      theme={theme}
                    />
                    {/* Password Strength */}
                    <AnimatePresence>
                      {formData.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full bg-gradient-to-r ${getPasswordStrengthColor(
                                  passwordStrength(formData.password)
                                )}`}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${
                                    (passwordStrength(formData.password) / 5) *
                                    100
                                  }%`,
                                }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <span className="text-xs text-gray-300">
                              {getPasswordStrengthText(
                                passwordStrength(formData.password)
                              )}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <EnhancedInput
                      icon={<Lock className="w-4 h-4" />}
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                      showPassword={showConfirmPassword}
                      theme={theme}
                      onTogglePassword={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className={`relative w-full overflow-hidden rounded-xl bg-gradient-to-r ${theme.buttonGradient} p-3 font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Animated background */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${
                            theme.isDark
                              ? "from-blue-500 to-purple-500"
                              : "from-blue-600 to-purple-600"
                          } opacity-0`}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />

                        <div className="relative z-10 flex items-center justify-center space-x-2">
                          {isLoading ? (
                            <motion.div
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                          ) : (
                            <>
                              <span>Create Account</span>
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </motion.div>
                            </>
                          )}
                        </div>
                      </motion.button>
                    </motion.div>
                  </form>
                </div>

                {/* Sign Up Link */}
                <motion.div
                  variants={itemVariants}
                  className="text-center mt-4"
                >
                  <p className={`${theme.textSecondary} text-sm`}>
                    Already have an account?{" "}
                    <motion.button
                      className={`${
                        theme.isDark
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-500 hover:text-blue-600"
                      } font-semibold transition-colors`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign in
                    </motion.button>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
