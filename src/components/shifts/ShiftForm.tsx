"use client";

import React, { useState } from "react";
import { type Company } from "@/types";
import Button from "../ui/Button";
import useAuth from "@/hooks/useAuth";
import { shiftService } from "@/services/shiftService";

interface ShiftFormProps {
  companies: Company[];
  onShiftAdded: () => void;
  initialDate?: string;
}

// Helper function to get color class based on company ID
const getCompanyColorClass = (companyId: string) => {
  // This is a simple hash function to consistently map company IDs to colors
  const colors = [
    "border-l-emerald-500", // TimeTree green
    "border-l-red-500", // Red
    "border-l-blue-500", // Blue
    "border-l-orange-500", // Orange
    "border-l-purple-500", // Purple
    "border-l-yellow-500", // Yellow
  ];

  // Simple hash to pick a consistent color
  const hash = companyId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

// Get background color for company selection
const getCompanyBgColorClass = (companyId: string) => {
  // This is a simple hash function to consistently map company IDs to colors
  const colors = [
    "bg-emerald-50 text-emerald-800", // TimeTree green
    "bg-red-50 text-red-800", // Red
    "bg-blue-50 text-blue-800", // Blue
    "bg-orange-50 text-orange-800", // Orange
    "bg-purple-50 text-purple-800", // Purple
    "bg-yellow-50 text-yellow-800", // Yellow
  ];

  // Simple hash to pick a consistent color
  const hash = companyId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

const ShiftForm = ({
  companies,
  onShiftAdded,
  initialDate = "",
}: ShiftFormProps) => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string>("");
  const [date, setDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memo, setMemo] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setError("You must be logged in to add shifts");
        return;
      }

      // Validate time values
      if (startTime >= endTime) {
        setError("End time must be after start time");
        return;
      }

      const { error } = await shiftService.addShift({
        user_id: user.id,
        company_id: companyId,
        date,
        start_time: startTime,
        end_time: endTime,
      });

      if (error) {
        setError("Failed to add shift: " + error.message);
      } else {
        // Reset form and notify parent
        onShiftAdded();
        setCompanyId("");
        setDate(initialDate);
        setStartTime("");
        setEndTime("");
        setMemo("");
      }
    } catch (err) {
      console.error("Error adding shift:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate the estimated wage for this shift
  const calculateEstimatedWage = () => {
    if (!companyId || !startTime || !endTime) return null;

    const company = companies.find((c) => c.id === companyId);
    if (!company?.hourly_wage) return null;

    // Calculate duration in hours
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    let durationHours = endHours - startHours;
    let durationMinutes = endMinutes - startMinutes;

    if (durationMinutes < 0) {
      durationHours--;
      durationMinutes += 60;
    }

    const totalHours = durationHours + durationMinutes / 60;

    // Calculate wage
    return Math.round(totalHours * company.hourly_wage);
  };

  const estimatedWage = calculateEstimatedWage();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Company selection (TimeTree-like) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => setCompanyId(company.id)}
              className={`
                px-4 py-3 rounded-md cursor-pointer border-l-4 transition-colors
                ${
                  companyId === company.id
                    ? `${getCompanyBgColorClass(
                        company.id
                      )} ${getCompanyColorClass(company.id)}`
                    : "bg-white border-l-gray-200 hover:bg-gray-50"
                }
              `}
            >
              <div className="font-medium">{company.name}</div>
              <div className="text-sm text-gray-600">
                ¥{company.hourly_wage}/hr
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date input with TimeTree-like styling */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Time inputs with TimeTree-like styling */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Memo field (TimeTree-like) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Memo (Optional)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Add notes about this shift..."
        />
      </div>

      {/* Estimated wage calculation */}
      {estimatedWage !== null && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-sm text-gray-500">Estimated Earnings</div>
          <div className="text-2xl font-semibold text-gray-900">
            ￥{estimatedWage.toLocaleString()}
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        variant="primary"
        size="lg"
        fullWidth
      >
        {loading ? "Saving..." : "Save Shift"}
      </Button>
    </form>
  );
};

export default ShiftForm;
