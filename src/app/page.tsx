"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import Button from "@/components/ui/Button";

const HomePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/calendar");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section with gradient background */}
      <div className="primary-gradient py-20 px-6 text-white">
        <div className="container-centered text-center">
          <h1 className="text-5xl font-bold mb-6">Shift Tracker</h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Your simple solution for tracking work shifts, calculating hours,
            and managing your income.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white py-20 px-6">
        <div className="container-centered">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Track Your Shifts With Ease
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="card p-6 text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
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
              </div>
              <h3 className="text-xl font-medium mb-2">Calendar View</h3>
              <p className="text-gray-600">
                See all your shifts in an intuitive calendar interface.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Income Tracking</h3>
              <p className="text-gray-600">
                Automatically calculate your earnings for each shift.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Multiple Companies</h3>
              <p className="text-gray-600">
                Manage shifts for different employers in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container-centered text-center">
          <p>
            © {new Date().getFullYear()} Shift Tracker App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
