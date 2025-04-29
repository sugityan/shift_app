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
        setError("You must be logged in to manage companies");
        return;
      }

      // Validate inputs
      if (!name.trim()) {
        setError("Company name is required");
        return;
      }

      const hourlyWageNum = parseFloat(hourlyWage);
      if (isNaN(hourlyWageNum) || hourlyWageNum <= 0) {
        setError("Please enter a valid hourly wage (greater than 0)");
        return;
      }

      console.log("Submitting company with:", {
        name,
        hourly_wage: hourlyWageNum,
        user_id: user.id,
      });

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
            : "An error occurred while saving the company";

        setError(`Error saving company: ${errorMessage}`);
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
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mb-8 p-4 border rounded-lg shadow-sm bg-white"
    >
      <h2 className="text-xl font-semibold mb-4">
        {company ? "Update Company" : "Add New Company"}
      </h2>

      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Input
        type="text"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        label="Company Name"
      />
      <Input
        type="number"
        placeholder="Hourly Wage"
        value={hourlyWage}
        onChange={(e) => setHourlyWage(e.target.value)}
        required
        min="0"
        step="10"
        label="Hourly Wage (¥)"
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : company ? "Update Company" : "Add Company"}
      </Button>
    </form>
  );
};

export default CompanyForm;
