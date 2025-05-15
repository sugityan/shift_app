"use client";

import moment from "moment";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
	Calendar,
	type SlotInfo,
	Views,
	momentLocalizer,
} from "react-big-calendar";
import "moment/locale/ja"; // 日本語ロケールをインポート
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./ShiftCalendar.css"; // We'll create this file for custom mobile styles
import useAuth from "@/hooks/useAuth";
import { shiftService } from "@/services/shiftService";
import type { Company, Shift } from "@/types";
import ShiftForm from "../shifts/ShiftForm";

// 日本語ロケールを設定
moment.locale("ja");
const localizer = momentLocalizer(moment);

// 曜日と月の名前を日本語に設定するためのオブジェクト
// Messages type definition
interface CalendarMessages {
	allDay: string;
	previous: string;
	next: string;
	today: string;
	month: string;
	week: string;
	day: string;
	agenda: string;
	date: string;
	time: string;
	event: string;
	showMore: (total: number) => string;
	noEventsInRange: string;
}

// Calendar messages with Japanese translations
const messages: CalendarMessages = {
	allDay: "終日",
	previous: "前月へ",
	next: "次月へ",
	today: "今日",
	month: "月",
	week: "週",
	day: "日",
	agenda: "予定表",
	date: "日付",
	time: "時間",
	event: "イベント",
	showMore: (total: number) => `+ さらに ${total} 件`,
	noEventsInRange: "この期間にはシフトがありません",
};

interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	resource: Shift;
	companyId: string;
}

// CompanyStats interface to track working days and hours per company
interface CompanyStats {
	id: string;
	name: string;
	workingDays: number;
	workingHours: number;
	colorClass: string;
}

interface ShiftCalendarProps {
	companies?: Company[];
}

// Custom TimeTree-like components
const TimeTreeDayHeader = ({ label }: { label: string }) => {
	// Extract the day number and day of week
	const [dayOfWeek, dayNumber] = label.split(" ");

	return (
		<div className="text-center">
			<div className="text-xs text-gray-700 uppercase font-medium">
				{dayOfWeek}
			</div>
			<div className="text-lg font-medium text-gray-900">{dayNumber}</div>
		</div>
	);
};

const TimeTreeEvent = ({
	event,
}: {
	event: {
		title: string;
		companyId: string;
		company?: Company;
	};
}) => {
	// Find the company for this event (we'll keep the variable but use it)
	const colorClass = getCompanyColorClass(event.companyId);

	return (
		<div
			className={`text-xs px-1 py-0.5 truncate rounded ${colorClass} mb-1 font-medium`}
		>
			{event.title}
		</div>
	);
};

// Helper function to get color class based on company ID
const getCompanyColorClass = (companyId: string) => {
	// This is a simple hash function to consistently map company IDs to colors
	const colors = [
		"bg-emerald-200 text-emerald-800", // TimeTree green (darker)
		"bg-red-200 text-red-800", // Red (darker)
		"bg-blue-200 text-blue-800", // Blue (darker)
		"bg-orange-200 text-orange-800", // Orange (darker)
		"bg-purple-200 text-purple-800", // Purple (darker)
		"bg-yellow-200 text-yellow-800", // Yellow (darker)
	];

	// Simple hash to pick a consistent color
	const hash = companyId.split("").reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);

	return colors[Math.abs(hash) % colors.length];
};

const ShiftCalendar = ({ companies = [] }: ShiftCalendarProps) => {
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [view, setView] = useState<
		"month" | "week" | "day" | "work_week" | "agenda"
	>(Views.MONTH);
	const [editingShift, setEditingShift] = useState<Shift | null>(null);

	// Current date for the month/week display
	const [currentDate, setCurrentDate] = useState(new Date());

	// For monthly stats
	const [monthlyStats, setMonthlyStats] = useState({
		totalHours: 0,
		totalSalary: 0,
	});

	// For company working days stats
	const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);

	// Initialize calculateMonthlyStats first as a hook
	// Calculate monthly stats when events, companies, or currentDate changes
	const calculateMonthlyStats = useCallback(
		(events: CalendarEvent[], companies: Company[], date: Date) => {
			const currentMonth = date.getMonth();
			const currentYear = date.getFullYear();

			// Filter events for the current month
			const monthEvents = events.filter((event) => {
				const eventDate = new Date(event.start);
				return (
					eventDate.getMonth() === currentMonth &&
					eventDate.getFullYear() === currentYear
				);
			});

			// Calculate total hours and salary
			let totalHours = 0;
			let totalSalary = 0;

			// Initialize company stats with all companies
			const companyWorkingDays: Record<string, Set<string>> = {};
			const companyWorkingHours: Record<string, number> = {};
			const companyStatsMap: Record<string, CompanyStats> = {};

			// Initialize data for each company
			companies.forEach((company) => {
				companyWorkingDays[company.id] = new Set();
				companyWorkingHours[company.id] = 0;
				companyStatsMap[company.id] = {
					id: company.id,
					name: company.name,
					workingDays: 0,
					workingHours: 0,
					colorClass: getCompanyColorClass(company.id),
				};
			});

			monthEvents.forEach((event) => {
				// Calculate hours worked for this shift
				const durationMs = event.end.getTime() - event.start.getTime();
				const durationHours = durationMs / (1000 * 60 * 60);
				totalHours += durationHours;

				// Calculate salary if hourly rate is available
				const company = companies.find((c) => c.id === event.companyId);
				if (company?.hourly_wage) {
					totalSalary += durationHours * company.hourly_wage;
				}

				// Track unique working days for each company
				if (companyWorkingDays[event.companyId]) {
					// Add date in yyyy-mm-dd format to the set of unique days
					const dateString = moment(event.start).format("YYYY-MM-DD");
					companyWorkingDays[event.companyId].add(dateString);

					// Track total hours for each company
					companyWorkingHours[event.companyId] =
						(companyWorkingHours[event.companyId] || 0) + durationHours;
				}
			});

			// Convert the unique days sets to counts
			Object.keys(companyWorkingDays).forEach((companyId) => {
				if (companyStatsMap[companyId]) {
					companyStatsMap[companyId].workingDays =
						companyWorkingDays[companyId].size;
					companyStatsMap[companyId].workingHours =
						Math.round(companyWorkingHours[companyId] * 10) / 10; // Round to 1 decimal
				}
			});

			// Update the state with monthly stats
			setMonthlyStats({
				totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
				totalSalary: Math.round(totalSalary),
			});

			// Update the company stats
			setCompanyStats(Object.values(companyStatsMap));
		},
		[],
	);

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
				// Convert shift data to calendar events
				const calendarEvents = (data || []).map((shift: Shift) => {
					const company = companies.find((c) => c.id === shift.company_id);
					const companyName = company ? company.name : "Unknown";

					// Create date objects from the shift's date and times
					const [year, month, day] = shift.date.split("-").map(Number);
					const [startHour, startMinute] = shift.start_time
						.split(":")
						.map(Number);
					const [endHour, endMinute] = shift.end_time.split(":").map(Number);

					const start = new Date(year, month - 1, day, startHour, startMinute);
					const end = new Date(year, month - 1, day, endHour, endMinute);

					return {
						id: shift.id,
						title: `${companyName} ${shift.start_time} - ${shift.end_time}`,
						start,
						end,
						resource: shift,
						companyId: shift.company_id,
						company,
					};
				});

				setEvents(calendarEvents);

				// Calculate monthly stats
				calculateMonthlyStats(calendarEvents, companies, new Date());
			}
		} catch (err) {
			console.error("Error:", err);
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	}, [user, companies, calculateMonthlyStats]);

	useEffect(() => {
		fetchShifts();
	}, [fetchShifts]);

	useEffect(() => {
		// Recalculate stats when events, companies, or currentDate changes
		calculateMonthlyStats(events, companies, currentDate);
	}, [events, companies, currentDate, calculateMonthlyStats]);

	const handleSelect = (slotInfo: SlotInfo) => {
		const { start } = slotInfo;
		setSelectedDate(start);
		setEditingShift(null); // Reset editing shift when selecting new slot
		setShowForm(true);
	};

	const handleEventClick = (event: CalendarEvent) => {
		// When clicking on an existing event, open the form with that shift data
		setEditingShift(event.resource);
		setShowForm(true);
	};

	const handleNavigate = (date: Date) => {
		setCurrentDate(date);
	};

	const handleShiftAdded = () => {
		setShowForm(false);
		setEditingShift(null);
		fetchShifts();
	};

	// Format date as YYYY-MM-DD for the form
	const formatDateForForm = (date: Date | null) => {
		if (!date) return "";
		return moment(date).format("YYYY-MM-DD");
	};

	// Format the current month and year for display
	const currentMonthYear = useMemo(() => {
		return moment(currentDate).format("YYYY年M月");
	}, [currentDate]);

	if (loading && events.length === 0) {
		return (
			<div className="py-8 text-center text-gray-600">
				カレンダーを読み込み中...
			</div>
		);
	}

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

	return (
		<div className="space-y-4">
			{/* TimeTree-like header with month navigation */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-4">
					<button
						onClick={() =>
							handleNavigate(
								moment(currentDate)
									.subtract(1, view === Views.MONTH ? "month" : "week")
									.toDate(),
							)
						}
						className="p-2 rounded-full hover:bg-gray-200 text-gray-800"
						aria-label="Previous month"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<button
						onClick={() => handleNavigate(new Date())}
						className="text-lg font-bold text-gray-900"
					>
						{currentMonthYear}
					</button>

					<button
						onClick={() =>
							handleNavigate(
								moment(currentDate)
									.add(1, view === Views.MONTH ? "month" : "week")
									.toDate(),
							)
						}
						className="p-2 rounded-full hover:bg-gray-200 text-gray-800"
						aria-label="Next month"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>

				{/* Today button */}
				<button
					onClick={() => handleNavigate(new Date())}
					className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
				>
					今日
				</button>
			</div>

			{/* Shift form modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold">
								{editingShift
									? "シフトを編集"
									: selectedDate
										? moment(selectedDate).format("YYYY年M月D日")
										: "新規"}
								{!editingShift && "のシフト追加"}
							</h2>
							<button
								onClick={() => setShowForm(false)}
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
							onShiftAdded={handleShiftAdded}
							initialDate={formatDateForForm(selectedDate)}
							shift={editingShift || undefined}
							isEditing={!!editingShift}
						/>

						<div className="mt-6 flex justify-end space-x-3">
							<button
								onClick={() => setShowForm(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
							>
								キャンセル
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Monthly stats (TimeTree-like) */}
			<div className="bg-white rounded-lg shadow p-4 mb-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-gray-500">合計時間</p>
						<p className="text-2xl font-semibold">
							{monthlyStats.totalHours} 時間
						</p>
					</div>
					<div>
						<p className="text-sm text-gray-500">予想収入</p>
						<p className="text-2xl font-semibold">
							¥{monthlyStats.totalSalary.toLocaleString()}
						</p>
					</div>
				</div>

				{/* Company working days stats */}
				{companyStats.length > 0 && (
					<div className="mt-4 pt-4 border-t border-gray-100">
						<p className="text-sm text-gray-500 mb-2">会社ごとの稼働状況</p>
						<div className="flex flex-wrap gap-2">
							{companyStats.map((company) => (
								<div
									key={company.id}
									className={`px-3 py-2 rounded-md ${company.colorClass}`}
								>
									<span className="font-semibold">{company.name}</span>
									<div className="flex flex-col text-sm">
										<span>{company.workingDays}日</span>
										<span>{company.workingHours}時間</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Calendar component with TimeTree styling */}
			<div className="bg-white rounded-lg shadow border overflow-hidden">
				<Calendar
					localizer={localizer}
					events={events}
					startAccessor="start"
					endAccessor="end"
					style={{ height: 700 }}
					selectable
					onSelectSlot={handleSelect}
					onSelectEvent={handleEventClick}
					views={["month", "week"]}
					view={view}
					onView={(newView: string) => setView(newView as "month" | "week")}
					date={currentDate}
					onNavigate={handleNavigate}
					components={{
						event: TimeTreeEvent,
						day: { header: TimeTreeDayHeader },
					}}
					eventPropGetter={() => {
						// The colors are now handled in the TimeTreeEvent component
						return {
							className: "border-0 cursor-pointer",
						};
					}}
					dayPropGetter={(date: Date) => {
						// Today's styling
						const isToday = moment(date).isSame(new Date(), "day");
						if (isToday) {
							return {
								className: "bg-emerald-50",
								style: {
									borderTop: "2px solid #10b981",
								},
							};
						}
						return {};
					}}
					formats={{
						dateFormat: "D",
						dayFormat: "ddd D",
						monthHeaderFormat: "YYYY年M月",
						weekdayFormat: "ddd",
					}}
					messages={messages}
				/>
			</div>

			{/* TimeTree-like add button (fixed position) */}
			<button
				onClick={() => {
					setSelectedDate(new Date());
					setShowForm(true);
				}}
				className="fixed bottom-6 right-6 bg-emerald-500 text-white rounded-full p-4 shadow-lg hover:bg-emerald-600 transition-colors"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6"
					fill="none"
					viewBox="0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
			</button>
		</div>
	);
};

export default ShiftCalendar;
