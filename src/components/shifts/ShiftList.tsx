"use client";

import React, { useEffect, useState, useCallback } from "react";
import { type Shift, type Company } from "@/types";
import useAuth from "@/hooks/useAuth";
import { shiftService } from "@/services/shiftService";
import Button from "../ui/Button";
import ShiftForm from "./ShiftForm";

interface ShiftListProps {
  companies?: Company[];
  showControls?: boolean;
}

const ShiftList = ({
  companies = [],
  showControls = false,
}: ShiftListProps) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchShifts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await shiftService.getUserShifts(user.id);

      if (error) {
        setError("Failed to load shifts");
        console.error("Error fetching shifts:", error);
      } else {
        setShifts(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShifts();
  }, [user, fetchShifts]);

  // Get company name by id
  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company ? company.name : "Unknown";
  };

  // Get company hourly wage by id
  const getCompanyHourlyWage = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company ? company.hourly_wage : 0;
  };

  // Calculate hours worked
  const calculateHours = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;

    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    return hours + minutes / 60;
  };

  // Calculate pay for a shift
  const calculatePay = (shift: Shift) => {
    const hours = calculateHours(shift.start_time, shift.end_time);
    const rate = getCompanyHourlyWage(shift.company_id);
    return hours * rate;
  };

  // Handle shift deletion
  const handleDeleteShift = async (id: string) => {
    if (!confirm("このシフトを削除してもよろしいですか？")) return;

    try {
      setLoading(true);
      const { error } = await shiftService.deleteShift(id);

      if (error) {
        console.error("Error deleting shift:", error);
        setError("シフトの削除に失敗しました");
      } else {
        // Refresh the list
        await fetchShifts();
      }
    } catch (err) {
      console.error("Error:", err);
      setError("予期せぬエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // Handle shift editing
  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShowEditForm(true);
  };

  const handleShiftUpdated = () => {
    setShowEditForm(false);
    setEditingShift(null);
    fetchShifts();
  };

  if (loading && shifts.length === 0)
    return <div className="py-4 text-gray-600">シフトを読み込み中...</div>;

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">エラー!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">記録されたシフト</h2>
        <p className="text-gray-500 italic">まだシフトが記録されていません。</p>
      </div>
    );
  }

  // Calculate total hours and pay
  const totalHours = shifts.reduce(
    (total, shift) => total + calculateHours(shift.start_time, shift.end_time),
    0
  );

  const totalPay = shifts.reduce(
    (total, shift) => total + calculatePay(shift),
    0
  );

  return (
    <div className="mt-8">
      {/* Shift edit form modal */}
      {showEditForm && editingShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">シフトを編集</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <ShiftForm
              companies={companies}
              onShiftAdded={handleShiftUpdated}
              shift={editingShift}
              isEditing={true}
            />

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-bold mb-2 sm:mb-0">記録されたシフト</h2>
        <div className="text-left sm:text-right">
          <p className="text-sm text-gray-600">
            合計時間:{" "}
            <span className="font-semibold">{totalHours.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            合計収入:{" "}
            <span className="font-semibold">￥{totalPay.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Mobile shift cards - shown on small screens */}
      <div className="md:hidden space-y-3">
        {shifts.map((shift) => {
          const hoursWorked = calculateHours(shift.start_time, shift.end_time);
          const payAmount = calculatePay(shift);
          const companyName = getCompanyName(shift.company_id);

          return (
            <div
              key={shift.id}
              className="bg-white rounded-lg shadow border p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">
                  {new Date(shift.date).toLocaleDateString()}
                </div>
                <div className="font-medium text-emerald-600">
                  ￥{payAmount.toFixed(0)}
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-1">{companyName}</div>
              <div className="text-sm text-gray-700 mb-2">
                {shift.start_time} - {shift.end_time} ({hoursWorked.toFixed(1)}
                時間)
              </div>

              {showControls && (
                <div className="mt-3 flex justify-end space-x-2">
                  <Button
                    onClick={() => handleEditShift(shift)}
                    className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600"
                    size="sm"
                  >
                    編集
                  </Button>
                  <Button
                    onClick={() => handleDeleteShift(shift.id)}
                    className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600"
                    size="sm"
                  >
                    削除
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop table - hidden on small screens */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日付
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                給与
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                勤務時間
              </th>
              {showControls && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shifts.map((shift) => {
              const hoursWorked = calculateHours(
                shift.start_time,
                shift.end_time
              );
              const payAmount = calculatePay(shift);

              return (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(shift.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCompanyName(shift.company_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hoursWorked.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ￥{payAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shift.start_time} - {shift.end_time}
                  </td>
                  {showControls && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => handleEditShift(shift)}
                          className="text-xs bg-blue-500 hover:bg-blue-600"
                        >
                          編集
                        </Button>
                        <Button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="text-xs bg-red-500 hover:bg-red-600"
                        >
                          削除
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftList;
