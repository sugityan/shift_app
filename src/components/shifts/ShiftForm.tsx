"use client";

import React, { useState } from "react";
import { type Company, type Shift } from "@/types";
import Button from "../ui/Button";
import useAuth from "@/hooks/useAuth";
import { shiftService } from "@/services/shiftService";

interface ShiftFormProps {
  companies: Company[];
  onShiftAdded: (newShift?: Shift) => void;
  initialDate?: string;
  shift?: Shift; // Add this to support editing
  isEditing?: boolean; // Add this to indicate edit mode
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
  shift,
  isEditing = false,
}: ShiftFormProps) => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string>(shift?.company_id || "");
  const [date, setDate] = useState<string>(shift?.date || initialDate);
  const [startTime, setStartTime] = useState<string>(shift?.start_time || "");
  const [endTime, setEndTime] = useState<string>(shift?.end_time || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memo, setMemo] = useState<string>(shift?.memo || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setError("シフトを追加するにはログインが必要です");
        return;
      }

      // Validate time values
      if (startTime >= endTime) {
        setError("終了時間は開始時間より後である必要があります");
        return;
      }

      let result;

      if (isEditing && shift) {
        // Update existing shift
        result = await shiftService.updateShift(shift.id, {
          company_id: companyId,
          date,
          start_time: startTime,
          end_time: endTime,
          memo,
        });
      } else {
        // Add new shift
        result = await shiftService.addShift({
          user_id: user.id,
          company_id: companyId,
          date,
          start_time: startTime,
          end_time: endTime,
          memo,
        });
      }

      if (result.error) {
        setError(
          (isEditing ? "シフトの更新" : "シフトの追加") +
            "に失敗しました: " +
            result.error.message
        );
      } else {
        // 成功した場合、新しいシフトデータを親コンポーネントに渡す
        if (result.data) {
          onShiftAdded(result.data);
        } else {
          onShiftAdded(); // データがない場合は引数なしで呼び出し
        }
        
        // フォームをリセット
        setCompanyId("");
        setDate(initialDate);
        setStartTime("");
        setEndTime("");
        setMemo("");
      }
    } catch (err) {
      console.error(
        isEditing ? "Error updating shift:" : "Error adding shift:",
        err
      );
      setError("予期せぬエラーが発生しました");
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

      {/* Company selection (TimeTree-like) - responsive grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          会社
        </label>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
              <div className="font-medium text-sm md:text-base">
                {company.name}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                ¥{company.hourly_wage}/時間
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date input with TimeTree-like styling */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          日付
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base"
        />
      </div>

      {/* Time inputs with TimeTree-like styling - responsive grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            開始時間
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            終了時間
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Memo field (TimeTree-like) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メモ (任意)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base"
          placeholder="このシフトに関するメモを追加..."
        />
      </div>

      {/* Estimated wage calculation */}
      {estimatedWage !== null && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
          <div className="text-xs sm:text-sm text-gray-500">予想収入</div>
          <div className="text-xl sm:text-2xl font-semibold text-gray-900">
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
        {loading ? "保存中..." : isEditing ? "シフトを更新" : "シフトを保存"}
      </Button>
    </form>
  );
};

export default ShiftForm;
