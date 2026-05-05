import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const [isCollapsed, setIsCollapsed] = useState(() =>
        localStorage.getItem('sidebarCollapsed') === 'true'
    );
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebarCollapsed', String(next));
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuToggle={() => setIsMobileOpen(prev => !prev)} />

            <div className="pt-16 flex min-h-screen">
                {/* Mobile backdrop */}
                {isMobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-30 md:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}

                <Sidebar
                    isCollapsed={isCollapsed}
                    onToggleCollapse={toggleCollapse}
                    isMobileOpen={isMobileOpen}
                    onMobileClose={() => setIsMobileOpen(false)}
                />

                <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
