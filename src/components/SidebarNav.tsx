"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ShoppingCart } from "lucide-react";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function SidebarNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="text-lg font-bold">Mi Empresa</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/recortes" style={{ textDecoration: "none" }}>
                  <SidebarMenuButton isActive={pathname === "/recortes" || pathname === "/"}>
                    <BarChart3 className="h-4 w-4" />
                    <span>Recortes</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/cliente" style={{ textDecoration: "none" }}>
                  <SidebarMenuButton isActive={pathname === "/cliente"}>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Material del cliente</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
