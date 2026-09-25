"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { removeToken } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between bg-green-800 px-6 py-3 text-white">
      <Link href="/templates" className="font-bold">
        AI Poster Maker
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/templates">Templates</Link>
        <Link href="/posters">My Posters</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
