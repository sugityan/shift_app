"use client";

import React, { useEffect, useState, useCallback } from "react";
import CompanyForm from "@/components/companies/CompanyForm";
import CompanyList from "@/components/companies/CompanyList";
import { type Company } from "@/types";
import useAuth from "@/hooks/useAuth";
import { companyService } from "@/services/companyService";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";

const SettingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await companyService.getUserCompanies(user.id);

      if (error) {
        setError("会社情報の読み込みに失敗しました");
        console.error("Error fetching companies:", error);
      } else {
        setCompanies(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("予期せぬエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user, fetchCompanies]);

  const handleCompanySubmit = async () => {
    setEditingCompany(null);
    await fetchCompanies();
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await companyService.deleteCompany(id);

      if (error) {
        setError("会社の削除に失敗しました");
        console.error("Error deleting company:", error);
      } else {
        await fetchCompanies();
      }
    } catch (err) {
      console.error("Error:", err);
      setError("予期せぬエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-black">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 fade-in">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          会社管理
        </h1>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 transform transition-all animate-pulse"
            role="alert"
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <strong className="font-medium">エラー:</strong>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}

        <div className="card p-6 sm:p-8 mb-8 hover:shadow-xl transition-shadow duration-300 rounded-xl bg-white">
          <h2 className="text-xl font-semibold mb-4 text-black">
            {editingCompany ? "会社を編集" : "新しい会社を追加"}
          </h2>
          <CompanyForm
            company={editingCompany}
            onSubmit={handleCompanySubmit}
          />
        </div>

        {loading && companies.length === 0 ? (
          <div className="card p-12 text-center text-black rounded-xl bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">会社情報を読み込み中...</p>
          </div>
        ) : (
          <div className="card p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 rounded-xl bg-white">
            <h2 className="text-xl font-semibold mb-4 text-black">
              登録済みの会社
            </h2>
            <CompanyList
              companies={companies}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
