"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSocket } from "../context/SocketProvider";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Topbar
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Cards
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"



import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Bell, CreditCard, Layers, LayoutDashboard, Search, Settings, ShoppingCart, Tag, User, Users } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Maquina {
  id: string;
  nombre: string;
}

interface Recorte {
  id: string;
  largo: number;
  ancho: number;
  espesor: number;
  cantidad: number;
  estado: boolean;
  imagen?: string;
  maquinaId: string;
  Maquina?: Maquina;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

function useRecortesSocket() {
  const { socket } = useSocket();
  const [status, setStatus] = useState("🔴");
  const [recortes, setRecortes] = useState<Recorte[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!socket) return;
    // Manejadores de conexión
    socket.on("connect", () => setStatus("🟢"));
    socket.on("disconnect", () => setStatus("🔴"));
    // Manejadores de datos
    socket.on("initialRecortes", (data: Recorte[]) => setRecortes(data));
    socket.on("newRecorte", (recorte: Recorte) => setRecortes((prev) => [recorte, ...prev]));
    socket.on("recorteDeleted", (data: { id: string }) => setRecortes((prev) => prev.filter((recorte) => recorte.id !== data.id)));
    // Limpieza al desmontar
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("initialRecortes");
      socket.off("newRecorte");
      socket.off("recorteDeleted");
    };
  }, [socket]);

  // Memoizar resultados filtrados
  const filteredRecortes = useMemo(() => {
    if (!searchQuery) return recortes;
    return recortes.filter(r =>
      r.id.includes(searchQuery) ||
      (r.Maquina?.nombre || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recortes, searchQuery]);

  return { status, filteredRecortes, searchQuery, setSearchQuery };
}

export default function Dashboard() {
  const { status, filteredRecortes, searchQuery, setSearchQuery } = useRecortesSocket();

  return (
         <div className="flex flex-col flex-1 overflow-hidden">

          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger />
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />                  <Input
                    type="search"
                    placeholder="Buscar..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notificaciones</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <p>{status}</p>
                    <span className="sr-only">Perfil</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>{/* Topbar */}

          {/* Contenido del dashboard */}
           <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recortes Disponibles</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">+20.1% respecto al mes pasado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilizados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">30</div>
                  <p className="text-xs text-muted-foreground">El ultimo mes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Material del cliente</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">10</div>
                  <p className="text-xs text-muted-foreground">Disponible</p>
                </CardContent>
              </Card>
          </div>

        </main>
         </div> 
    
  );
}
