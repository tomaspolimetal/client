"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  maquinaId: string;
  Maquina?: Maquina;
  fecha_creacion: string;
  imagen?: string;
  observaciones?: string;
}

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

interface TicketDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMaterial?: Cliente | null;
  onUseMaterial?: (id: string, quantity: number) => void;
}

function MaterialForm({ 
  selectedMaterial, 
  onUseMaterial,
  className 
}: { 
  selectedMaterial: Cliente; 
  onUseMaterial: (id: string, quantity: number) => void;
  className?: string;
}) {
  const [quantity, setQuantity] = React.useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUseMaterial(selectedMaterial.id, quantity);
  };

  return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Dimensiones</Label>
          <p className="text-lg">
            {selectedMaterial.largo} x {selectedMaterial.ancho} x {selectedMaterial.espesor} mm
          </p>
        </div>
        <div className="grid gap-2">
          <Label>Tipo de Material</Label>
          <p className="text-lg">{selectedMaterial.tipoMaterial}</p>
        </div>
        <div className="grid gap-2">
          <Label>Cliente</Label>
          <p className="text-lg">{selectedMaterial.cliente}</p>
        </div>
        <div className="grid gap-2">
          <Label>Cantidad Disponible</Label>
          <p className="text-lg">{selectedMaterial.cantidad}</p>
        </div>
        <div className="grid gap-2">
          <Label>Remito</Label>
          <p className="text-lg">{selectedMaterial.remito}</p>
        </div>
        <div className="grid gap-2">
          <Label>Fecha de Ingreso</Label>
          <p className="text-lg">
            {new Date(selectedMaterial.createdAt).toLocaleDateString()}
          </p>
        </div>

        {selectedMaterial.observaciones && (
          <div className="grid gap-2 col-span-2">
            <Label>Observaciones</Label>
            <p className="text-lg bg-gray-50 p-3 rounded-md">
              {selectedMaterial.observaciones}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quantity">Cantidad a Utilizar</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={selectedMaterial.cantidad}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <Button 
        type="submit"
        disabled={quantity < 1 || quantity > selectedMaterial.cantidad}
      >
        Utilizar Material
      </Button>
    </form>
  );
}

export function TicketDrawer({ 
  open, 
  onOpenChange, 
  selectedMaterial, 
  onUseMaterial 
}: TicketDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!selectedMaterial) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Material</DialogTitle>
            <DialogDescription>
              Revisa los detalles del material y especifica la cantidad a utilizar.
            </DialogDescription>
          </DialogHeader>
          <MaterialForm
            selectedMaterial={selectedMaterial}
            onUseMaterial={onUseMaterial!}
            className="py-4"
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Detalles del Material</DrawerTitle>
          <DrawerDescription>
            Revisa los detalles del material y especifica la cantidad a utilizar.
          </DrawerDescription>
        </DrawerHeader>
        <MaterialForm
          selectedMaterial={selectedMaterial}
          onUseMaterial={onUseMaterial!}
          className="px-4"
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
