"use client"
import * as React from "react"
import config from '@/config/config'
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

interface TicketDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecorte?: Recorte | null;
  onUseRecorte?: (id: string, quantity: number) => void;
}

function RecorteForm({ 
  selectedRecorte, 
  onUseRecorte,
  className 
}: { 
  selectedRecorte: Recorte; 
  onUseRecorte?: (id: string, quantity: number) => void;
  className?: string;
}) {
  const [quantity, setQuantity] = React.useState<number>(1);

  // Si no hay recorte seleccionado o no tiene id, no mostramos nada
  if (!selectedRecorte || !selectedRecorte.id) {
    return <p>Recorte no encontrado</p>;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onUseRecorte) {
      onUseRecorte(selectedRecorte.id, quantity);
    }
  };

  return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
      {/* Sección de imagen */}
      {selectedRecorte.imagen && (
        <div className="grid gap-2">
          <Label>Imagen del Recorte</Label>
          <div className="relative w-full h-[200px] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={`${config.API_BASE_URL}${selectedRecorte.imagen}`}
              alt={`Recorte ${selectedRecorte.id}`}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Dimensiones</Label>
          <p className="text-lg">
            {selectedRecorte.largo} x {selectedRecorte.ancho} x {selectedRecorte.espesor} mm
          </p>
        </div>
        <div className="grid gap-2">
          <Label>Máquina</Label>
          <p className="text-lg">{selectedRecorte.Maquina?.nombre}</p>
        </div>
        <div className="grid gap-2">
          <Label>Cantidad Disponible</Label>
          <p className="text-lg">{selectedRecorte.cantidad}</p>
        </div>
        <div className="grid gap-2">
          <Label>Fecha de Creación</Label>
          <p className="text-lg">
            {new Date(selectedRecorte.fecha_creacion).toLocaleDateString()}
          </p>
        </div>

        {selectedRecorte.observaciones && (
          <div className="grid gap-2">
            <Label>Observaciones</Label>
            <p className="text-lg bg-gray-50 p-3 rounded-md">
              {selectedRecorte.observaciones}
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
          max={selectedRecorte.cantidad}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <Button 
        type="submit"
        disabled={quantity < 1 || quantity > selectedRecorte.cantidad}
      >
        Utilizar Recorte
      </Button>
    </form>
  );
}

export function TicketDrawer({ 
  open, 
  onOpenChange, 
  selectedRecorte, 
  onUseRecorte 
}: TicketDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!selectedRecorte) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Recorte</DialogTitle>
            <DialogDescription>
              Revisa los detalles del recorte y especifica la cantidad a utilizar.
            </DialogDescription>
          </DialogHeader>
          <RecorteForm
            selectedRecorte={selectedRecorte}
            onUseRecorte={onUseRecorte!}
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
          <DrawerTitle>Detalles del Recorte</DrawerTitle>
          <DrawerDescription>
            Revisa los detalles del recorte y especifica la cantidad a utilizar.
          </DrawerDescription>
        </DrawerHeader>
        <RecorteForm
          selectedRecorte={selectedRecorte}
          onUseRecorte={onUseRecorte!}
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
