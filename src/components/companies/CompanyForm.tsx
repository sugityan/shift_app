"use client";

import React, { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { type Company } from "@/types";
import useAuth from "@/hooks/useAuth";
import { companyService } from "@/services/companyService";

interface CompanyFormProps {
  company?: Company | null;
  onSubmit?: (data: Company) => void;
}

const CompanyForm = ({
  company = null,
  onSubmit = () => {},
}: CompanyFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState(company ? company.name : "");
  const [hourlyWage, setHourlyWage] = useState(
    company ? company.hourly_wage.toString() : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update form values when company prop changes
    if (company) {
      setName(company.name);
      setHourlyWage(company.hourly_wage.toString());
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setError("会社を管理するにはログインが必要です");
        return;
      }

      // Validate inputs
      if (!name.trim()) {
        setError("会社名は必須です");
        return;
      }

      const hourlyWageNum = parseFloat(hourlyWage);
      if (isNaN(hourlyWageNum) || hourlyWageNum <= 0) {
        setError("有効な時給を入力してください（0より大きい値）");
        return;
      }

      // Use service layer to add/update company
      const response = company
        ? await companyService.updateCompany(company.id, {
            name,
            hourly_wage: hourlyWageNum,
          })
        : await companyService.addCompany({
            name,
            hourly_wage: hourlyWageNum,
            user_id: user.id,
          });

      if (response.error) {
        // Handle different error types safely
        const errorMessage =
          response.error instanceof Error
            ? response.error.message
            : "会社情報の保存中にエラーが発生しました";

        setError(`会社の保存エラー: ${errorMessage}`);
        console.error("Form submission error details:", response.error);
      } else {
        console.log("Company saved successfully:", response.data);
        onSubmit(response.data!);
        if (!company) {
          // Reset form if adding a new company
          setName("");
          setHourlyWage("");
        }
      }
    } catch (err) {
      console.error("Unexpected error during form submission:", err);
      setError("予期せぬエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-4">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 text-sm rounded-lg"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mb-3">
        <Input
          type="text"
          placeholder="会社名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          label="会社名"
          className="w-full"
        />
      </div>

      <div className="mb-3">
        <Input
          type="number"
          placeholder="時給"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(e.target.value)}
          required
          min="0"
          step="10"
          label="時給 (¥)"
          className="w-full"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full" size="md">
          {loading ? "保存中..." : company ? "会社を更新" : "会社を追加"}
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;
