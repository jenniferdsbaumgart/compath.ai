import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";

export function useProtectedRoute() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);
}
