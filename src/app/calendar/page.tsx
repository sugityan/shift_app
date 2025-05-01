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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
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
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 primary-gradient bg-clip-text">
          シフト管理ダッシュボード
        </h1>

        <div className="card p-6 sm:p-8 mb-8 hover:shadow-xl transition-shadow duration-300 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            カレンダー表示
          </h2>
          <ShiftCalendar companies={companies} />
        </div>

        <div className="card p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            シフト一覧
          </h2>
          <ShiftList companies={companies} showControls={true} />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
