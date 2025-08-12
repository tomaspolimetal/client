'use client'
import { useState, FormEvent, useEffect } from 'react';
import config from '@/config/config';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "./ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";

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

interface EditClienteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCliente: Cliente | null;
  onClienteUpdated?: () => void;
}

function ClienteForm({ 
  selectedCliente, 
  onSubmit,
  className 
}: { 
  selectedCliente: Cliente; 
  onSubmit: (data: FormData) => void;
  className?: string;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    onSubmit(formData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cliente">Cliente</Label>
          <Input
            id="cliente"
            name="cliente"
            type="text"
            defaultValue={selectedCliente.cliente}
            required
          />
        </div>
        <div>
          <Label htmlFor="tipoMaterial">Tipo Material</Label>
          <Input
            id="tipoMaterial"
            name="tipoMaterial"
            type="text"
            defaultValue={selectedCliente.tipoMaterial}
            required
          />
        </div>
        <div>
          <Label htmlFor="largo">Largo (mm)</Label>
          <Input
            id="largo"
            name="largo"
            type="number"
            defaultValue={selectedCliente.largo}
            required
          />
        </div>
        <div>
          <Label htmlFor="ancho">Ancho (mm)</Label>
          <Input
            id="ancho"
            name="ancho"
            type="number"
            defaultValue={selectedCliente.ancho}
            required
          />
        </div>
        <div>
          <Label htmlFor="espesor">Espesor (mm)</Label>
          <Input
            id="espesor"
            name="espesor"
            type="number"
            defaultValue={selectedCliente.espesor}
            required
          />
        </div>
        <div>
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input
            id="cantidad"
            name="cantidad"
            type="number"
            defaultValue={selectedCliente.cantidad}
            required
          />
        </div>
        <div>
          <Label htmlFor="remito">Remito</Label>
          <Input
            id="remito"
            name="remito"
            type="number"
            defaultValue={selectedCliente.remito}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <textarea
          id="observaciones"
          name="observaciones"
          defaultValue={selectedCliente.observaciones}
          className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
          placeholder="Ingrese observaciones adicionales..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <DrawerClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DrawerClose>
        <Button type="submit">
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}

export function EditClienteDrawer({ 
  open, 
  onOpenChange, 
  selectedCliente, 
  onClienteUpdated 
}: EditClienteDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSubmit = async (formData: FormData) => {
    try {
      if (!selectedCliente) return;

      const formJson = Object.fromEntries(formData.entries());
      const response = await fetch(`${config.API_BASE_URL}/api/clientes/${selectedCliente.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formJson),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el material del cliente');
      }

      onOpenChange(false);
      if (onClienteUpdated) {
        onClienteUpdated();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el material del cliente');
    }
  };

  if (!selectedCliente) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Material del Cliente</DialogTitle>
            <DialogDescription>
              Modifica los detalles del material aquí.
            </DialogDescription>
          </DialogHeader>
          <ClienteForm
            selectedCliente={selectedCliente}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Editar Material del Cliente</DrawerTitle>
          <DrawerDescription>
            Modifica los detalles del material aquí.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ClienteForm
            selectedCliente={selectedCliente}
            onSubmit={handleSubmit}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
