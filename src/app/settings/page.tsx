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
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-black">読み込み中...</p>
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
      <div className="w-full mx-auto p-2 sm:px-4 md:px-6 lg:px-8 sm:py-6 md:py-8 fade-in">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-6 md:mb-8 text-black">
          会社管理
        </h1>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-2 py-2 sm:px-4 sm:py-3 rounded-lg relative mb-3 sm:mb-6"
            role="alert"
          >
            <div className="flex flex-wrap sm:flex-nowrap items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0"
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
              <strong className="font-medium text-xs sm:text-sm md:text-base">
                エラー:
              </strong>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm md:text-base">
                {error}
              </span>
            </div>
          </div>
        )}

        <div className="mb-3 sm:mb-6 md:mb-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold p-3 sm:p-4 border-b">
            {editingCompany ? "会社を編集" : "新しい会社を追加"}
          </h2>
          <div>
            <CompanyForm
              company={editingCompany}
              onSubmit={handleCompanySubmit}
            />
          </div>
        </div>

        {loading && companies.length === 0 ? (
          <div className="p-4 sm:p-6 md:p-12 text-center text-black rounded-lg bg-white shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base">
              会社情報を読み込み中...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
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
