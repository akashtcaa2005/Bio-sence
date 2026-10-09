import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartLine, Bell, Heart, MessageCircle, User,
  Home, AlertTriangle, Apple, Contact, Pill, LogOut
} from "lucide-react";

const navItems = [
  { title: "Dashboard",      icon: <Home          className="h-5 w-5" />, path: "/" },
  { title: "Reports",        icon: <ChartLine     className="h-5 w-5" />, path: "/reports" },
  { title: "Alerts",         icon: <Bell          className="h-5 w-5" />, path: "/alerts" },
  { title: "Diet Plans",     icon: <Apple         className="h-5 w-5" />, path: "/diet" },
  { title: "Medications",    icon: <Pill          className="h-5 w-5" />, path: "/medications" },
  { title: "Doctor Connect", icon: <MessageCircle className="h-5 w-5" />, path: "/doctor" },
  { title: "Alert Contacts", icon: <Contact       className="h-5 w-5" />, path: "/emergency-contacts" },
  { title: "Emergency",      icon: <AlertTriangle className="h-5 w-5" />, path: "/emergency", className: "text-health-abnormal" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`bg-sidebar h-screen ${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300 border-r border-sidebar-border flex flex-col`}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">Bio Sense</h1>
          </div>
        )}
        {collapsed && <Heart className="h-6 w-6 text-primary mx-auto" />}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? ">" : "<"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                } ${item.className || ""} ${collapsed ? "justify-center" : ""}`
              }
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">User Account</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/auth");
                }}
              >
                <LogOut className="h-3 w-3 mr-1" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
