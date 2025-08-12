'use client'
import { useState, FormEvent } from 'react';
import config from '@/config/config';
import { SideDrawer, SideDrawerContent, SideDrawerHeader, SideDrawerTitle, SideDrawerTrigger } from "./ui/side-drawer";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Cliente {
  cliente: string;
  espesor: number;
  tipoMaterial: string;
  largo: number;
  ancho: number;
  cantidad: number;
  remito: string; // Cambiar a string para permitir ceros iniciales
  observaciones?: string;
}

interface CreateClienteDrawerProps {
  onClienteCreated?: () => void;
}

export function CreateClienteDrawer({ onClienteCreated }: CreateClienteDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [cliente, setCliente] = useState<Cliente>({
    cliente: '',
    espesor: 0,
    tipoMaterial: '',
    largo: 0,
    ancho: 0,
    cantidad: 0,
    remito: '', // string vacío por defecto
    observaciones: ''
  });

  // Manejador para crear cliente
  const handleClienteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Material agregado",
          description: "El material del cliente se ha agregado exitosamente.",
        });

        setCliente({
          cliente: '',
          espesor: 0,
          tipoMaterial: '',
          largo: 0,
          ancho: 0,
          cantidad: 0,
          remito: '', // string vacío por defecto
          observaciones: ''
        });
        setIsOpen(false);
        if (onClienteCreated) {
          onClienteCreated();
        }
      } else {
        throw new Error(data.message || 'Error al crear el material');
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar el material del cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SideDrawer open={isOpen} onOpenChange={setIsOpen}>
      <SideDrawerTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Material
        </Button>
      </SideDrawerTrigger>
      <SideDrawerContent className="flex flex-col">
        <SideDrawerHeader className="border-b p-4">
          <SideDrawerTitle>Agregar Material del Cliente</SideDrawerTitle>
        </SideDrawerHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleClienteSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Cliente</label>
              <input
                type="text"
                value={cliente.cliente}
                onChange={(e) => setCliente({...cliente, cliente: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Tipo de Material</label>
                <input
                  type="text"
                  value={cliente.tipoMaterial}
                  onChange={(e) => setCliente({...cliente, tipoMaterial: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="Ej: Acero, Aluminio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Espesor (mm)</label>
                <input
                  type="number"
                  value={cliente.espesor || ''}
                  onChange={(e) => setCliente({...cliente, espesor: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Largo (mm)</label>
                <input
                  type="number"
                  value={cliente.largo || ''}
                  onChange={(e) => setCliente({...cliente, largo: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Ancho (mm)</label>
                <input
                  type="number"
                  value={cliente.ancho || ''}
                  onChange={(e) => setCliente({...cliente, ancho: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Cantidad</label>
                <input
                  type="number"
                  value={cliente.cantidad || ''}
                  onChange={(e) => setCliente({...cliente, cantidad: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">N° de Remito</label>
                <input
                  type="text" // Cambiar a text para permitir ceros iniciales
                  value={cliente.remito || ''}
                  onChange={(e) => setCliente({...cliente, remito: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ej: 001207"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Observaciones</label>
              <textarea
                value={cliente.observaciones || ''}
                onChange={(e) => setCliente({...cliente, observaciones: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Ingrese observaciones adicionales..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Agregando..." : "Agregar Material"}
            </Button>
          </form>
        </div>
      </SideDrawerContent>
    </SideDrawer>
  );
}
