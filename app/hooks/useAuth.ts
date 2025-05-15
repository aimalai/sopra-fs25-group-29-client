"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function useAuth(): boolean | null {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("token");
    let token: string | null = null;

    if (raw) {
      try {
        token = JSON.parse(raw);
      } catch {
        token = raw;
      }
    }

    if (!token) {
      router.replace("/login");
      setIsAuthed(false);
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  return isAuthed;
}
