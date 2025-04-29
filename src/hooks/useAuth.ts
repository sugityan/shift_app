"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "../utils/supabase/client";
import { User, AuthError } from "@supabase/supabase-js";

type AuthResponse = {
  user: User | null;
  error: AuthError | null;
};

type ProfileUpdateData = {
  name?: string;
  avatar_url?: string;
};

/**
 * Custom hook for handling authentication state and operations
 */
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh the current user data
  const refreshUser = useCallback(async () => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = await createClient();

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Subscribe to auth changes
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            setUser(session?.user ?? null);
          }
        );

        return () => {
          data.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { user: data?.user || null, error };
    } catch (error) {
      console.error("Sign up error:", error);
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { user: data?.user || null, error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error: error as AuthError };
    }
  };

  // 新しいユーザープロフィール更新機能
  const updateUserProfile = async (
    profileData: ProfileUpdateData
  ): Promise<{ error: AuthError | null }> => {
    try {
      const supabase = await createClient();

      // 既存のユーザーメタデータを取得
      const { data: userData } = await supabase.auth.getUser();
      const currentMetadata = userData.user?.user_metadata || {};

      // 更新するメタデータを現在のメタデータとマージ
      const updatedMetadata = {
        ...currentMetadata,
        ...profileData,
      };

      // ユーザーメタデータを更新
      const { error } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });

      if (!error) {
        // 更新に成功したら最新のユーザー情報を取得
        await refreshUser();
      }

      return { error };
    } catch (error) {
      console.error("Update profile error:", error);
      return { error: error as AuthError };
    }
  };

  // パスワード更新機能
  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ error: AuthError | null }> => {
    try {
      // 現在のパスワードで認証を確認
      const supabase = await createClient();

      // まず現在のパスワードが正しいか確認（メールアドレスでサインイン試行）
      if (user && user.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (signInError) {
          return { error: signInError };
        }

        // パスワード更新
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        return { error };
      }

      return {
        error: {
          message: "User not authenticated",
          status: 400,
          name: "AuthError",
        } as AuthError,
      };
    } catch (error) {
      console.error("Update password error:", error);
      return { error: error as AuthError };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    updateUserProfile,
    updatePassword,
  };
};

export default useAuth;
