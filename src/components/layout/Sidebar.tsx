import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-gray-800 text-white p-4">
            <h2 className="text-lg font-bold mb-4">Navigation</h2>
            <ul className="space-y-2">
                <li>
                    <Link href="/calendar" className="hover:text-gray-400">Calendar</Link>
                </li>
                <li>
                    <Link href="/settings" className="hover:text-gray-400">Companies</Link>
                </li>
                <li>
                    <Link href="/" className="hover:text-gray-400">Home</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;