import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the email confirmation / OAuth redirect
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/", { replace: true });
      } else if (event === "PASSWORD_RECOVERY") {
        navigate("/auth", { replace: true });
      }
    });

    // Also check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted gap-4">
      <div className="p-3 bg-primary/10 rounded-full animate-pulse">
        <Heart className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground text-sm">Verifying your account…</p>
    </div>
  );
};

export default AuthCallback;
