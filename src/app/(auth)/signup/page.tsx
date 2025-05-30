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
      setError("パスワードが一致しません");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上である必要があります");
      setLoading(false);
      return;
    }

    try {
      const supabase = await createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/calendar`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        if (data.user && !data.user.identities?.length) {
          setError(
            "このメールアドレスは既に登録されています。ログインしてください。"
          );
        } else {
          router.push("/calendar");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("予期せぬエラーが発生しました。もう一度試してください。");
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
              アカウント作成
            </h1>
            <p className="text-gray-600">
              シフト管理アプリに登録して勤務スケジュールを管理しよう
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
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              label="メールアドレス"
              className="transition-all duration-200"
            />
            <Input
              type="password"
              placeholder="パスワードを作成"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              label="パスワード"
              className="transition-all duration-200"
            />
            <Input
              type="password"
              placeholder="パスワードを確認"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              label="パスワード確認"
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
                  アカウント作成中...
                </span>
              ) : (
                "アカウント作成"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              すでにアカウントをお持ちですか？{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors underline"
              >
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
