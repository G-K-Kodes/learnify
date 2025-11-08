import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface CooldownMessages {
  progress: (remaining: number) => string;
  done: string;
}

export function useCooldownToast(key: string, messages: CooldownMessages) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);

  const startCooldown = (seconds: number) => {
    const endTime = Date.now() + seconds * 1000;
    localStorage.setItem(`${key}_endTime`, endTime.toString());
    setCooldownActive(true);

    const showToast = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

      if (remaining <= 0) {
        toast.dismiss(`${key}_cooldown`);
        toast.success(messages.done || "✅ Cooldown complete."); // ✅ safe fallback
        setCooldownActive(false);
        localStorage.removeItem(`${key}_endTime`);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      toast.dismiss(`${key}_cooldown`);
      toast.loading(messages.progress(remaining) || `⏳ ${remaining}s remaining`, {
        id: `${key}_cooldown`,
      });
    };

    showToast();
    intervalRef.current = setInterval(showToast, 1000);
  };

  const restoreCooldown = () => {
    const storedEnd = localStorage.getItem(`${key}_endTime`);
    if (storedEnd && Number(storedEnd) > Date.now()) {
      startCooldown(Math.ceil((Number(storedEnd) - Date.now()) / 1000));
    }
  };

  useEffect(() => {
    restoreCooldown();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { startCooldown, cooldownActive };
}
