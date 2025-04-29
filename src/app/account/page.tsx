"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Header from "@/components/layout/Header";

const AccountSettingsPage = () => {
  const { user, loading, updateUserProfile } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || "",
        email: user.email || "",
      });
    }
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    router.push("/login");
    return null;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword({
      ...password,
      [name]: value,
    });
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };
  
  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
    setError(null);
    setSuccess(null);
    setPassword({
      current: "",
      new: "",
      confirm: "",
    });
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      // プロフィール更新ロジックを実装
      // updateUserProfile関数は hooks/useAuth.ts に実装する必要があります
      await updateUserProfile({
        name: formData.name,
      });
      
      setSuccess("プロフィールを更新しました");
      setIsEditing(false);
    } catch (err) {
      setError("プロフィールの更新に失敗しました");
      console.error("Error updating profile:", err);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (password.new !== password.confirm) {
      setError("新しいパスワードが一致しません");
      return;
    }
    
    try {
      // パスワード更新ロジックを実装
      // 実際のパスワード変更APIを呼び出す必要があります
      // 例: await auth.updatePassword(password.current, password.new);
      
      setSuccess("パスワードを更新しました");
      setIsChangingPassword(false);
      setPassword({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (err) {
      setError("パスワードの更新に失敗しました");
      console.error("Error updating password:", err);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 fade-in">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          アカウント設定
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 transform transition-all animate-pulse" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              <strong className="font-medium">エラー:</strong>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative mb-6 transform transition-all animate-pulse" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <strong className="font-medium">成功:</strong>
              <span className="ml-2">{success}</span>
            </div>
          </div>
        )}
        
        {/* プロフィール情報カード */}
        <div className="card p-6 sm:p-8 mb-8 hover:shadow-xl transition-shadow duration-300 rounded-xl bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-black">プロフィール情報</h2>
            <button
              onClick={handleEditToggle}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isEditing 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isEditing ? 'キャンセル' : '編集'}
            </button>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">メールアドレスは変更できません</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200"
                >
                  更新する
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-700 mb-1">名前</span>
                <span className="block px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{formData.name || '未設定'}</span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</span>
                <span className="block px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{formData.email}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* パスワード変更カード */}
        <div className="card p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 rounded-xl bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-black">パスワード変更</h2>
            <button
              onClick={handlePasswordToggle}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isChangingPassword 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isChangingPassword ? 'キャンセル' : '変更する'}
            </button>
          </div>
          
          {isChangingPassword ? (
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-4">
                <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">現在のパスワード</label>
                <input
                  type="password"
                  id="current"
                  name="current"
                  value={password.current}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="new" className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
                <input
                  type="password"
                  id="new"
                  name="new"
                  value={password.new}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">8文字以上の強力なパスワードを設定してください</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード（確認）</label>
                <input
                  type="password"
                  id="confirm"
                  name="confirm"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  minLength={8}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200"
                >
                  パスワードを更新する
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              パスワードを変更するには「変更する」ボタンをクリックしてください。
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;