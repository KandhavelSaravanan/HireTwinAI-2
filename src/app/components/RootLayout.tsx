import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Outlet />
    </div>
  );
}
