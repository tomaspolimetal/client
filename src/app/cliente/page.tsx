"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useCachedSocketData } from "@/context/CacheProvider";
import config from "@/config/config";
import { CreateClienteDrawer } from "@/components/CreateClienteDrawer";
import { TicketDrawer } from "@/components/ui/TicketDrawerClient";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { es } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";

// Sidebar components
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Dropdown components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Card components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons and input components
import { Bell, CreditCard, Search, Settings, ShoppingCart, User, Users, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar"
import { addDays } from "date-fns"
import { EditClienteDrawer } from "@/components/EditClienteDrawer";
import { CacheIndicator } from "@/components/CacheIndicator";
import { useToast } from "@/components/ui/use-toast";

interface Cliente {
  id: string;
  cliente: string;
  espesor: number;
  tipoMaterial: string;
  largo: number;
  ancho: number;
  cantidad: number;
  remito: string; // Cambiar a string para permitir ceros iniciales
  observaciones?: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortField = keyof Cliente;

export default function Cliente() {  
  const router = useRouter();
  const { toast } = useToast();
  const { status, clientes: cachedClientes, socket } = useCachedSocketData();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Cliente | null>(null);
  
  // Estados para filtros
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [estadoFilter, setEstadoFilter] = useState<"todos" | "disponibles" | "utilizados">("todos");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sort state
  const [sortField, setSortField] = useState<keyof Cliente>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedItemsPerPage = localStorage.getItem('clienteMaterialItemsPerPage');
    if (savedItemsPerPage) {
      setItemsPerPage(Number(savedItemsPerPage));
    }
  }, []);

  // Sincronizar clientes del caché con el estado local
  useEffect(() => {
    const transformedClientes = (cachedClientes || []).map(cliente => ({
      ...cliente,
      remito: cliente.remito?.toString() ?? ''
    }));
    setClientes(transformedClientes);
  }, [cachedClientes]);

  useEffect(() => {
    localStorage.setItem('clienteMaterialItemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('initialData');

    socket.on('materialUpdated', (updatedMaterial: Cliente) => {
      setClientes((prev: Cliente[]) => prev.map(material => 
        material.id === updatedMaterial.id ? updatedMaterial : material
      ));
    });

    return () => {
      if (!socket) return;
      socket.off('materialUpdated');
    };
  }, [socket]);



  const handleSort = (field: keyof Cliente) => {
    if (sortField === field) {
      setSortOrder(current => current === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  
  const handleMaterialClick = (material: Cliente) => {
    if (material.estado) {
      setSelectedMaterial(material);
      setDrawerOpen(true);
    }
  };

  const handleEditClick = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation(); // Prevent opening the use drawer
    setSelectedMaterial(cliente);
    setEditDrawerOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation(); // Prevent opening the use drawer
    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este material?');
    if (confirmed) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/clientes/${cliente.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el material');
        }

        if (socket) socket.emit('getClientes'); // Solicitar actualización
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Error al eliminar el material",
          variant: "destructive"
        });
      }
    }
  };

  const handleUseMaterial = async (id: string, quantity: number) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/clientes/${id}/use`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cantidad: quantity })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el material');
      }

      setDrawerOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el material",
        variant: "destructive"
      });
    }
  };

  // Filtrar clientes por query de búsqueda, fechas y estado
  const filteredClientes = clientes
    .filter((cliente) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        cliente.cliente.toLowerCase().includes(searchLower) ||
        cliente.tipoMaterial.toLowerCase().includes(searchLower) ||
        cliente.observaciones?.toLowerCase().includes(searchLower) ||
        cliente.remito.toString().includes(searchQuery);

      // Filtro por estado
      const matchesEstado = 
        estadoFilter === "todos" ? true :
        estadoFilter === "disponibles" ? cliente.estado :
        !cliente.estado;

      // Filtro por fecha
      const clienteDate = new Date(cliente.createdAt);
      const matchesDate = 
        !dateRange?.from || (
          clienteDate >= dateRange.from &&
          (!dateRange.to || clienteDate <= addDays(dateRange.to, 1))
        );

      return matchesSearch && matchesEstado && matchesDate;
    })
    .sort((a, b) => {
      if (sortField === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Suspense fallback={<div></div>}>
      {/* El fallback real lo maneja Next.js con loading.tsx */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <SidebarTrigger />
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cliente o material..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <CacheIndicator />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <p>{status}</p>
                  <span className="sr-only">Estado</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Estado del Sistema</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>{status}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Material de Clientes</h2>
            <CreateClienteDrawer />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Material Disponible</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>            
              <CardContent>
                <div className="text-2xl font-bold">
                  {clientes?.filter(cliente => cliente.estado).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Material Disponible</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de ingresos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clientes?.filter(cliente => {
                    const createdAt = new Date(cliente.createdAt);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return createdAt >= thirtyDaysAgo;
                  }).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Ingresos últimos 30 días</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Material Utilizado</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clientes?.filter(cliente => !cliente.estado).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Inactivos</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>
                      Lista de todos los clientes y sus materiales
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>            
              <CardContent>
                {/* Filtros */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Select
                      value={estadoFilter}
                      onValueChange={(value: "todos" | "disponibles" | "utilizados") => setEstadoFilter(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Estado del material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="disponibles">Disponibles</SelectItem>
                        <SelectItem value="utilizados">Utilizados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                {format(dateRange.to, "LLL dd, y", { locale: es })}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y", { locale: es })
                            )
                          ) : (
                            <span>Seleccionar fechas</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>

                    {dateRange && (dateRange.from || dateRange.to) && (
                      <Button
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => setDateRange(undefined)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Limpiar fechas</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tipo Material</TableHead>
                        <TableHead>Espesor</TableHead>
                        <TableHead>Largo</TableHead>
                        <TableHead>Ancho</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Remito</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Observaciones</TableHead>
                        <TableHead>Fecha Ingreso</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClientes.map((cliente) => (
                        <TableRow 
                          key={cliente.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleMaterialClick(cliente)}
                        >
                          <TableCell>{cliente.cliente}</TableCell>
                          <TableCell>{cliente.tipoMaterial}</TableCell>
                          <TableCell>{cliente.espesor}</TableCell>
                          <TableCell>{cliente.largo}</TableCell>
                          <TableCell>{cliente.ancho}</TableCell>
                          <TableCell>{cliente.cantidad}</TableCell>
                          <TableCell>{cliente.remito && cliente.remito !== '0' ? cliente.remito : '-'}</TableCell>
                          <TableCell>
                            <Badge
                              style={{
                                backgroundColor: cliente.estado ? "#22c55e" : "#ef4444",
                                color: "white",
                              }}
                            >
                              {cliente.estado ? "Disponible" : "Utilizado"}
                            </Badge>
                          </TableCell>
                          <TableCell>{ cliente.observaciones
    ? cliente.observaciones.length > 25
      ? cliente.observaciones.slice(0, 25) + '...'
      : cliente.observaciones
    : "-"}</TableCell>
                          <TableCell>{new Date(cliente.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleEditClick(e, cliente)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDeleteClick(e, cliente)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginación */}
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center text-sm text-gray-700">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredClientes.length)} de {filteredClientes.length} resultados
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <Button
                            key={i + 1}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <TicketDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          selectedMaterial={selectedMaterial}
          onUseMaterial={handleUseMaterial}
        />      <EditClienteDrawer
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          selectedCliente={selectedMaterial}
          onClienteUpdated={() => {
            if (socket) socket.emit('getClientes');
          }}
        />
      </div>
    </Suspense>
  );
}