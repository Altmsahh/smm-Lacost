import DashboardSidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import AuthGuard from "@/components/dashboard/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#020503] text-white relative selection:bg-[#00df82] selection:text-black">
        {/* Ambient Neon Green Background Glow Layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
          <div className="absolute -top-32 right-1/4 w-[650px] h-[650px] bg-[#00df82]/[0.06] rounded-full blur-[140px]" />
          <div className="absolute top-1/2 -left-48 w-[550px] h-[550px] bg-[#00df82]/[0.05] rounded-full blur-[150px]" />
          <div className="absolute -bottom-40 right-10 w-[600px] h-[600px] bg-[#00df82]/[0.06] rounded-full blur-[140px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-70" />
        </div>

        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto relative z-10">
          <TopNavbar />
          <main className="flex-1 p-3 sm:p-5 lg:p-7">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
