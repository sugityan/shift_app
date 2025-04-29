"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const supabase = await createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        if (data.user && !data.user.identities?.length) {
          setError("Email already exists. Please log in instead.");
        } else {
          router.push("/calendar");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-12 transform transition-all duration-300 fade-in">
        <div className="card p-8 sm:p-10 shadow-xl rounded-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-3 primary-gradient bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join Shift Tracker to manage your work schedule
            </p>
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 transform transition-all animate-pulse"
              role="alert"
            >
              <p className="text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              label="Email"
              className="transition-all duration-200"
            />
            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              label="Password"
              className="transition-all duration-200"
            />
            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              label="Confirm Password"
              className="transition-all duration-200"
            />

            <Button
              type="submit"
              disabled={loading}
              fullWidth
              size="lg"
              className="mt-6 transform hover:translate-y-[-2px] transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
