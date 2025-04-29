"use client";

import React, { useEffect, useState, useCallback } from "react";
import { type Shift, type Company } from "@/types";
import useAuth from "@/hooks/useAuth";
import { shiftService } from "@/services/shiftService";
import Button from "../ui/Button";

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
    if (!confirm("Are you sure you want to delete this shift?")) return;

    try {
      setLoading(true);
      const { error } = await shiftService.deleteShift(id);

      if (error) {
        console.error("Error deleting shift:", error);
        setError("Failed to delete shift");
      } else {
        // Refresh the list
        await fetchShifts();
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && shifts.length === 0)
    return <div className="py-4 text-gray-600">Loading shifts...</div>;

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recorded Shifts</h2>
        <p className="text-gray-500 italic">No shifts recorded yet.</p>
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recorded Shifts</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Total Hours:{" "}
            <span className="font-semibold">{totalHours.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Total Pay:{" "}
            <span className="font-semibold">${totalPay.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              {showControls && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      <Button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="text-xs bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </Button>
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
