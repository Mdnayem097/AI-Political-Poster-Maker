"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <nav className="flex items-center justify-between bg-green-800 px-6 py-3 text-white">
      <Link href="/dashboard" className="font-bold">
        AI Poster Maker
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/templates">Templates</Link>
        <Link href="/posters">My Posters</Link>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md px-2 py-1 transition hover:bg-green-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}