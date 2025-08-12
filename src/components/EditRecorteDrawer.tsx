'use client'
import { useState, FormEvent, useEffect } from 'react';
import config from '@/config/config';
import { getImageSrc } from '@/utils/imageUtils';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "./ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";

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

interface EditRecorteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecorte: Recorte | null;
  maquinas: Maquina[];
  onRecorteUpdated?: () => void;
}

function RecorteForm({ 
  selectedRecorte, 
  maquinas,
  onSubmit,
  className 
}: { 
  selectedRecorte: Recorte; 
  maquinas: Maquina[];
  onSubmit: (data: FormData) => void;
  className?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    getImageSrc(selectedRecorte.imagen, config.API_BASE_URL)
  );

  useEffect(() => {
    if (selectedRecorte.imagen) {
      setPreviewUrl(getImageSrc(selectedRecorte.imagen, config.API_BASE_URL));
    }
  }, [selectedRecorte]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    onSubmit(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="largo">Largo (mm)</Label>
          <Input
            id="largo"
            name="largo"
            type="number"
            defaultValue={selectedRecorte.largo}
            required
          />
        </div>
        <div>
          <Label htmlFor="ancho">Ancho (mm)</Label>
          <Input
            id="ancho"
            name="ancho"
            type="number"
            defaultValue={selectedRecorte.ancho}
            required
          />
        </div>
        <div>
          <Label htmlFor="espesor">Espesor (mm)</Label>
          <Input
            id="espesor"
            name="espesor"
            type="number"
            defaultValue={selectedRecorte.espesor}
            required
          />
        </div>
        <div>
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input
            id="cantidad"
            name="cantidad"
            type="number"
            defaultValue={selectedRecorte.cantidad}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="maquinaId">Máquina</Label>
        <select
          id="maquinaId"
          name="maquinaId"
          defaultValue={selectedRecorte.maquinaId}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          required
        >
          {maquinas.map((maquina) => (
            <option key={maquina.id} value={maquina.id}>
              {maquina.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <textarea
          id="observaciones"
          name="observaciones"
          defaultValue={selectedRecorte.observaciones}
          className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
          placeholder="Ingrese observaciones adicionales..."
        />
      </div>

      <div>
        <Label htmlFor="imagen">Imagen</Label>
        <div className="mt-2 flex items-center gap-4">
          <Input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {previewUrl && (
            <div className="relative w-24 h-24">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </div>
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

export function EditRecorteDrawer({ 
  open, 
  onOpenChange, 
  selectedRecorte, 
  maquinas = [],
  onRecorteUpdated 
}: EditRecorteDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Si no hay recorte seleccionado, no mostrar nada
  if (!selectedRecorte) return null;
  
  const handleSubmit = async (formData: FormData) => {
    try {
      if (!selectedRecorte) return;

      const response = await fetch(`${config.API_BASE_URL}/api/recortes/${selectedRecorte.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el recorte');
      }

      onOpenChange(false);
      if (onRecorteUpdated) {
        onRecorteUpdated();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el recorte');
    }
  };

  if (!selectedRecorte) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Recorte</DialogTitle>
            <DialogDescription>
              Modifica los detalles del recorte aquí.
            </DialogDescription>
          </DialogHeader>
          <RecorteForm
            selectedRecorte={selectedRecorte}
            maquinas={maquinas}
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
          <DrawerTitle>Editar Recorte</DrawerTitle>
          <DrawerDescription>
            Modifica los detalles del recorte aquí.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <RecorteForm
            selectedRecorte={selectedRecorte}
            maquinas={maquinas}
            onSubmit={handleSubmit}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
