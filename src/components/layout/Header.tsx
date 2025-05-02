"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

const Header = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState("monthly"); // 'monthly' or 'weekly'
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Instead of immediately redirecting, use window.location for a full page refresh
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Click outside handler for user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if user is logged in
  const isLoggedIn = !!user;

  // Don't show header on auth pages
  const showHeader = !(pathname === "/login" || pathname === "/signup");

  if (!showHeader) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm w-full sticky top-0 z-50">
      <div className="max-w-full mx-auto px-2 sm:px-4">
        {/* 横並びに全要素を配置 */}
        <div className="h-14 flex flex-row items-center justify-between gap-x-2">
          {/* App logo */}
          <div className="flex-shrink-0">
            <Link
              href={isLoggedIn ? "/calendar" : "/"}
              className="flex items-center space-x-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-lg font-medium text-gray-900 hidden sm:inline">
                ShiftCalender
              </span>
            </Link>
          </div>

          {/* 検索・追加・ユーザー関連ボタン */}
          <div className="flex flex-row items-center gap-x-2 ml-auto">
            {isLoggedIn && (
              <>
                {/* User profile dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex-shrink-0 p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>

                  {/* User dropdown menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        {user?.email}
                      </div>
                      <Link
                        href="/calendar"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        カレンダー
                      </Link>
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        アカウント設定
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        会社設定
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md"
                >
                  新規登録
                </Link>
              </>
            )}
            {/* Mobile menu button - always visible on mobile */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - improved for touch and better visibility */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden border-t border-gray-200`}
        id="mobile-menu"
      >
        <div className="px-3 pt-2 pb-3 space-y-1 bg-white shadow-md">
          {isLoggedIn ? (
            <>
              {/* Mobile view toggle - made more touch-friendly */}
              {pathname.includes("calendar") && (
                <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setCurrentView("monthly")}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                      currentView === "monthly"
                        ? "bg-emerald-500 text-white shadow"
                        : "text-gray-600"
                    }`}
                  >
                    マンスリー
                  </button>
                  <button
                    onClick={() => setCurrentView("weekly")}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                      currentView === "weekly"
                        ? "bg-emerald-500 text-white shadow"
                        : "text-gray-600"
                    }`}
                  >
                    ウィークリー
                  </button>
                </div>
              )}

              {/* Menu links with larger touch targets */}
              <Link
                href="/calendar"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                カレンダー
              </Link>
              <Link
                href="/account"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                アカウント設定
              </Link>
              <Link
                href="/settings"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                会社設定
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
