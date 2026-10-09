import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import VoiceAssistant from "../VoiceAssistant";
import { supabase } from "@/integrations/supabase/client";

const Layout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("setup_complete")
        .eq("user_id", session.user.id)
        .single();

      if (!profile || !profile.setup_complete) {
        navigate("/profile-setup", { replace: true });
        return;
      }

      setChecking(false);
    };

    checkProfile();
  }, [navigate]);

  if (checking) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
        <VoiceAssistant />
      </div>
    </div>
  );
};

export default Layout;
