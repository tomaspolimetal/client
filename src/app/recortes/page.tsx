"use client";
import React, { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSocketData } from "@/hooks/useSocketData";
import config from "@/config/config";
import { TicketDrawer } from "@/components/ui/TicketDrawer";
import { CreateRecorteDrawer } from "@/components/CreateRecorteDrawer";
import { EditRecorteDrawer } from "@/components/EditRecorteDrawer";
import { useRouter } from 'next/navigation';

// Sidebar
import {
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
import { Bell, CreditCard, Edit, Layers, MoreVertical, Search, Settings, ShoppingCart, Trash2, User, Users } from "lucide-react";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/context/SocketProvider";

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
  observaciones?: string;
  maquinaId: string;
  Maquina?: Maquina;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export default function Recortes() {  
  const router = useRouter();
  const { socket } = useSocket();
  const { status, recortes, maquinas, setRecorteUpdateCallback } = useSocketData();
  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [espesorFilter, setEspesorFilter] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedRecorte, setSelectedRecorte] = useState<Recorte | null>(null);
  const itemsPerPage = 10;

  // Establecer la pestaña activa cuando se cargan las máquinas
  useEffect(() => {
    if (maquinas.length > 0 && !activeTab) {
      setActiveTab(maquinas[0].id);
    }
  }, [maquinas, activeTab]);

  // Configurar el callback para las actualizaciones de recortes
  useEffect(() => {
    setRecorteUpdateCallback((recorte: Recorte) => {
      // Si el recorte y el recorte seleccionado no son null, entonces verificar el id
      if (selectedRecorte && recorte && recorte.id === selectedRecorte.id) {
        setDrawerOpen(false);
        setEditDrawerOpen(false);
        alert('Recorte actualizado exitosamente');
      }
    });

    // Limpiar el callback al desmontar
    return () => {
      setRecorteUpdateCallback(null);
    };
  }, [setRecorteUpdateCallback, selectedRecorte]);

  const handleRecorteClick = (recorte: Recorte) => {
    setSelectedRecorte(recorte);
    setDrawerOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, recorte: Recorte) => {
    e.stopPropagation(); // Prevent opening the use drawer
    setSelectedRecorte(recorte);
    setEditDrawerOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, recorte: Recorte) => {
    e.stopPropagation(); // Prevent opening the use drawer
    if (window.confirm('¿Estás seguro de que quieres eliminar este recorte?')) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/recortes/${recorte.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el recorte');
        }

        // The socket will handle the update
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el recorte');
      }
    }
  };
  const handleUseRecorte = async (id: string, quantity: number) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/recortes/${id}/use`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cantidad: quantity })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
    // El recorte fue actualizado exitosamente
      if (socket) socket.emit('getRecortes'); // Solicitar actualización de recortes
      setDrawerOpen(false); // Cerrar el drawer
      alert('Recorte utilizado exitosamente');
      
    } catch (error) {
      console.error('Error al actualizar el recorte:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar el recorte');
    }
  };

  // Función para obtener los recortes utilizados del último mes
  const getLastMonthUsedRecortes = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return recortes.filter(r => 
      !r.estado && 
      new Date(r.fecha_actualizacion) > oneMonthAgo
    );
  };

  // Recalculate total pages whenever filteredRecortes changes
  const filteredRecortes = recortes
    .filter((recorte) => 
      activeTab ? recorte.maquinaId === activeTab : true)
    .filter((recorte) =>
      searchQuery
        ? recorte.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (recorte.Maquina?.nombre || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    .filter((recorte) =>
      espesorFilter
        ? recorte.espesor === parseFloat(espesorFilter)
        : true)
    .filter((recorte) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      switch (estadoFilter) {
        case "disponibles":
          return recorte.estado;
        case "utilizados":
          return !recorte.estado && new Date(recorte.fecha_actualizacion) > oneMonthAgo;
        default:
          return true;
      }
    });

  const totalPages = Math.ceil(filteredRecortes.length / itemsPerPage);

  // Adjust current page if it exceeds the new total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedRecortes = filteredRecortes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handleRecorteCreated = () => {
    // Actualizar la lista de recortes
    if (socket) socket.emit('getRecortes');
  };

  const handleNavigateToHistorial = () => {
    router.push('/historial');
  };

  return (
    <Suspense fallback={<div></div>}>
      {/* El fallback real lo maneja Next.js con loading.tsx */}
      <div className="flex flex-col flex-1 overflow-hidden">          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger />
            <div className="w-full flex-1 md:w-auto md:flex-none">
              
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
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recortes</h2>
              <CreateRecorteDrawer maquinas={maquinas} onRecorteCreated={handleRecorteCreated} />
            </div>
            <div className="grid gap-4 md:grid-cols-3 mb-6">              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recortes por Máquina</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>                
                <CardContent className="p-3">
                  <CircularProgress
                    items={[
                      {
                        value: recortes.filter(r => 
                          r.estado && 
                          maquinas.find(m => m.id === r.maquinaId)?.nombre.toLowerCase().includes('laser')
                        ).length,
                        color: "#3b82f6", // azul para Laser
                        label: "Laser"
                      },
                      {
                        value: recortes.filter(r => 
                          r.estado && 
                          maquinas.find(m => m.id === r.maquinaId)?.nombre.toLowerCase().includes('plasma')
                        ).length,
                        color: "#f59e0b", // naranja para Plasma
                        label: "Plasma"
                      },
                      {
                        value: recortes.filter(r => 
                          r.estado && 
                          maquinas.find(m => m.id === r.maquinaId)?.nombre.toLowerCase().includes('oxi')
                        ).length,
                        color: "#22c55e", // verde para Oxicorte
                        label: "Oxicorte"
                      }                    ]}
                    size={80}
                    thickness={8}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilizados último mes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    const lastMonthUsed = recortes.filter(r => 
                      !r.estado && 
                      new Date(r.fecha_actualizacion) > oneMonthAgo
                    );
                    return (
                      <>
                        <div className="text-2xl font-bold">{lastMonthUsed.length}</div>
                        <p className="text-xs text-muted-foreground">Recortes utilizados en los últimos 30 días</p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleNavigateToHistorial}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Historial</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Haz click para ver el historial</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros adicionales */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Estado:</label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value as "todos" | "disponibles" | "utilizados")}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="disponibles">Disponibles</option>
                  <option value="utilizados">Utilizados</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Espesor (mm):</label>
                <Input
                  type="number"
                  value={espesorFilter}
                  onChange={(e) => setEspesorFilter(e.target.value)}
                  placeholder="Espesor"
                  className="w-[150px]"
                />
              </div>
            </div>

            {/* Navegación por pestañas */}
            <div className="bg-white border-b border-gray-200 mb-6">
              <div className="flex space-x-8 px-4">
                {maquinas.map((maquina) => (
                  <button
                    key={maquina.id}
                    onClick={() => setActiveTab(maquina.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                      activeTab === maquina.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >                    <Layers className="w-4 h-4" />
                    <span className="font-medium">{maquina.nombre}</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{
                        backgroundColor: recortes.filter(r => r.maquinaId === maquina.id && r.estado).length > 0 ? "#22c55e" : "",
                        color: recortes.filter(r => r.maquinaId === maquina.id && r.estado).length > 0 ? "white" : ""
                      }}
                    >
                      {recortes.filter(r => r.maquinaId === maquina.id && r.estado).length}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla de Recortes */}
            <div className="bg-white rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Largo</TableHead>
                    <TableHead>Ancho</TableHead>
                    <TableHead>Espesor</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Máquina</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Imagen</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecortes.map((recorte) => (
                    <TableRow 
                      key={recorte.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRecorteClick(recorte)}
                    >
                      <TableCell>{recorte.largo}</TableCell>
                      <TableCell>{recorte.ancho}</TableCell>
                      <TableCell>{recorte.espesor}</TableCell>
                      <TableCell>{recorte.cantidad}</TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: recorte.estado ? "#22c55e" : "#ef4444",
                            color: "white",
                          }}
                        >
                          {recorte.estado ? "Disponible" : "Utilizado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{recorte.Maquina?.nombre}</TableCell>
                      <TableCell>{recorte.observaciones
    ? recorte.observaciones.length > 25
      ? recorte.observaciones.slice(0, 25) + '...'
      : recorte.observaciones
    : "-"}</TableCell>
                      <TableCell>{new Date(recorte.fecha_creacion).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {recorte.imagen ? (
                          <div className="relative w-12 h-12">
                            <img
                              src={`${config.API_BASE_URL}${recorte.imagen}`}
                              alt={`Recorte ${recorte.id}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin imagen</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleEditClick(e, recorte)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDeleteClick(e, recorte)}
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
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredRecortes.length)} de {filteredRecortes.length} resultados
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
          </main>

          <TicketDrawer 
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            selectedRecorte={selectedRecorte}
            onUseRecorte={handleUseRecorte}
          />

          <EditRecorteDrawer
            open={editDrawerOpen}
            onOpenChange={setEditDrawerOpen}
            selectedRecorte={selectedRecorte}
            maquinas={maquinas}
            onRecorteUpdated={() => {
              if (socket) socket.emit('getRecortes');
            }}
          />
        </div>
    </Suspense>
  );
}
