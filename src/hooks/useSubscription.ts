import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatus {
  canCreate: boolean;
  currentCount: number;
  maxLimit: number;
  currentPlan: "free" | "pro" | "school";
  loading: boolean;
}

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    canCreate: false,
    currentCount: 0,
    maxLimit: 3,
    currentPlan: "free",
    loading: true,
  });

  const checkLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const { data, error } = await supabase.rpc("check_world_limit", {
        check_user_id: user.id,
      });

      if (error) {
        console.error("Error checking world limit:", error);
        // Default to allowing creation if check fails
        setStatus(prev => ({ ...prev, loading: false, canCreate: true }));
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        setStatus({
          canCreate: result.can_create,
          currentCount: Number(result.current_count),
          maxLimit: result.max_limit,
          currentPlan: result.current_plan as "free" | "pro" | "school",
          loading: false,
        });
      } else {
        // No subscription found, use defaults
        setStatus(prev => ({ ...prev, loading: false, canCreate: true }));
      }
    } catch (err) {
      console.error("Subscription check error:", err);
      setStatus(prev => ({ ...prev, loading: false, canCreate: true }));
    }
  };

  useEffect(() => {
    checkLimit();
  }, []);

  return { ...status, refresh: checkLimit };
};
