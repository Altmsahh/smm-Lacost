import Link from 'next/link';
import { Home, User, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col justify-between p-4">
            <div>
                <div className="text-2xl font-bold mb-8 px-2">لوحة التحكم</div>
                <nav className="flex flex-col space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800"
                    >
                        <Home size={20} />
                        <span>الرئيسية</span>
                    </Link>
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800"
                    >
                        <User size={20} />
                        <span>الملف الشخصي</span>
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800"
                    >
                        <Settings size={20} />
                        <span>الإعدادات</span>
                    </Link>
                </nav>
            </div>

            <div className="border-t border-gray-800 pt-4">
                <button className="flex items-center gap-3 px-3 py-2 w-full text-red-400 hover:bg-gray-800 rounded-md">
                    <LogOut size={20} />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
