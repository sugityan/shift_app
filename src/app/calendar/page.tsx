"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import ShiftCalendar from "@/components/calendar/ShiftCalendar";
import ShiftList from "@/components/shifts/ShiftList";
import useAuth from "../../hooks/useAuth";
import { type Company } from "../../types";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";

const CalendarPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!user) return;

      try {
        const supabase = await createClient();

        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching companies:", error);
        } else {
          setCompanies(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (user) {
      fetchCompanies();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
      <Header />
      <div className="w-full mx-auto px-1 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 fade-in overflow-hidden max-w-[100vw]">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-6 md:mb-8 text-gray-800 primary-gradient bg-clip-text truncate">
          シフト管理ダッシュボード
        </h1>

        <div className="card p-2 sm:p-6 md:p-8 mb-3 sm:mb-6 md:mb-8 hover:shadow-xl transition-shadow duration-300 rounded-lg sm:rounded-xl bg-white overflow-hidden w-full">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4 text-gray-700">
            カレンダー表示
          </h2>
          <div
            className="calendar-container w-full"
            style={{ maxWidth: "100%", overflowX: "auto" }}
          >
            <ShiftCalendar companies={companies} />
          </div>
        </div>

        <div className="card p-2 sm:p-6 md:p-8 hover:shadow-xl transition-shadow duration-300 rounded-lg sm:rounded-xl bg-white overflow-hidden w-full">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4 text-gray-700">
            シフト一覧
          </h2>
          <div className="w-full overflow-x-auto">
            <ShiftList companies={companies} showControls={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
