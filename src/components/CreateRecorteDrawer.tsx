'use client'
import { useState, FormEvent, useEffect } from 'react';
import { SideDrawer, SideDrawerContent, SideDrawerHeader, SideDrawerTitle } from "./ui/side-drawer";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import config from '@/config/config';

interface Maquina {
  id: string;
  nombre: string;
}

interface Recorte {
  largo: number;
  ancho: number;
  espesor: number;
  cantidad: number;
  maquinaId: string;
  imagen?: File | null;
  observaciones?: string;
}

interface CreateRecorteDrawerProps {
  maquinas: Maquina[];
  onRecorteCreated?: () => void;
}

export function CreateRecorteDrawer({ maquinas, onRecorteCreated }: CreateRecorteDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [recorte, setRecorte] = useState<Recorte>({
    largo: 0,
    ancho: 0,
    espesor: 0,
    cantidad: 0,
    maquinaId: '',
    imagen: null,
    observaciones: ''
  });

  // Constante para la URL base de la API
  const API_URL = config.API_BASE_URL;

  // Función para abrir el drawer de forma explícita
  const openDrawer = () => {
    setIsOpen(true);
  };

  // Manejador para crear recorte
  const handleRecorteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado", recorte); // Verificar en consola que se está ejecutando
    
    try {
      // Validaciones básicas
      if (!recorte.largo || !recorte.ancho || !recorte.espesor || !recorte.cantidad || !recorte.maquinaId) {
        alert("Por favor complete todos los campos obligatorios.");
        return;
      }
      
      const formData = new FormData();
      formData.append('largo', recorte.largo.toString());
      formData.append('ancho', recorte.ancho.toString());
      formData.append('espesor', recorte.espesor.toString());
      formData.append('cantidad', recorte.cantidad.toString());
      formData.append('maquinaId', recorte.maquinaId);
      
      if (recorte.imagen) {
        formData.append('imagen', recorte.imagen);
      }
      formData.append('observaciones', recorte.observaciones || '');

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      console.log("Enviando solicitud POST a:", `${API_URL}/api/recortes`);
      
      // Verificar el tamaño del archivo antes de enviar
      if (recorte.imagen && recorte.imagen.size > 10 * 1024 * 1024) { // 10MB limit
        alert("La imagen es demasiado grande. El tamaño máximo permitido es 10MB.");
        return;
      }
      
      const response = await fetch(`${API_URL}/api/recortes`, {
        method: 'POST',
        body: formData,
      });
      
      console.log("Respuesta status:", response.status);
      console.log("Respuesta headers:", response.headers);
      console.log("Respuesta completa:", response);
      
      if (response.ok) {
        console.log("Recorte creado exitosamente");
        // Resetear el formulario
        setRecorte({
          largo: 0,
          ancho: 0,
          espesor: 0,
          cantidad: 0,
          maquinaId: '',
          imagen: null,
          observaciones: ''
        });
        setPreviewUrl(null);
        setIsOpen(false);
        
        // Callback si existe
        if (onRecorteCreated) {
          onRecorteCreated();
        }
        
        alert("Recorte creado exitosamente");
      } else {
        const errorData = await response.text();
        console.error("Error en la respuesta:", errorData);
        
        // Manejar errores específicos
        if (response.status === 413) {
          throw new Error("El archivo es demasiado grande. Intente con una imagen más pequeña.");
        } else if (response.status === 500) {
          throw new Error("Error del servidor. El backend no está configurado correctamente para manejar archivos. Contacte al administrador.");
        } else {
          throw new Error(`Error: ${response.status} - ${errorData}`);
        }
      }
    } catch (error) {
      console.error('Error creando recorte:', error);
      alert(`Error al crear el recorte: ${error instanceof Error ? error.message : 'Desconocido'}`);
    }
  };

  // Manejador para la imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setRecorte({ ...recorte, imagen: file });
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Limpiar la URL de vista previa al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      {/* Botón explícito fuera del drawer para mayor claridad */}
      <Button 
        className="flex items-center gap-2" 
        onClick={openDrawer}
      >
        <Plus className="h-4 w-4" />
        <span>Nuevo Recorte</span>
      </Button>
      
      {/* Drawer controlado por el estado isOpen */}
      <SideDrawer open={isOpen} onOpenChange={setIsOpen}>
        <SideDrawerContent className="w-full sm:max-w-md">
          <SideDrawerHeader>
            <SideDrawerTitle>Crear Nuevo Recorte</SideDrawerTitle>
          </SideDrawerHeader>
          <div className="p-6">
            <form 
              id="createRecorteForm"
              onSubmit={handleRecorteSubmit} 
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Largo (mm)</label>
                  <input
                    type="number"
                    value={recorte.largo || ''}
                    onChange={(e) => setRecorte({...recorte, largo: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Ancho (mm)</label>
                  <input
                    type="number"
                    value={recorte.ancho || ''}
                    onChange={(e) => setRecorte({...recorte, ancho: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Espesor (mm)</label>
                  <input
                    type="number"
                    value={recorte.espesor || ''}
                    onChange={(e) => setRecorte({...recorte, espesor: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Cantidad</label>
                  <input
                    type="number"
                    value={recorte.cantidad || ''}
                    onChange={(e) => setRecorte({...recorte, cantidad: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Máquina</label>
                <select
                  value={recorte.maquinaId}
                  onChange={(e) => setRecorte({...recorte, maquinaId: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar máquina</option>
                  {maquinas.map((maquina) => (
                    <option key={maquina.id} value={maquina.id}>
                      {maquina.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium">Observaciones</label>
                <textarea
                  value={recorte.observaciones || ''}
                  onChange={(e) => setRecorte({...recorte, observaciones: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Ingrese observaciones adicionales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Imagen</label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {previewUrl && (
                    <div className="relative w-24 h-24">
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setRecorte({ ...recorte, imagen: null });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Verificar si los campos obligatorios están completos para diagnóstico */}
              <div className="text-xs text-gray-500 mb-2">
                {!recorte.largo || !recorte.ancho || !recorte.espesor || !recorte.cantidad || !recorte.maquinaId
                  ? "Por favor complete todos los campos obligatorios"
                  : "Todos los campos obligatorios completos"}
              </div>

              {/* Usar un botón nativo de HTML para garantizar que funcione el envío */}
              <div className="flex gap-2 mt-4">
                <button
                  type="button" // Cambiado a button type para manejar manualmente
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={(e) => {
                    e.preventDefault(); // Prevenir comportamiento por defecto
                    console.log("Botón nativo clickeado - enviando manualmente");
                    handleRecorteSubmit(new Event('submit') as unknown as FormEvent<HTMLFormElement>);
                  }}
                >
                  Crear Recorte
                </button>
              </div>
              
              {/* Mantener el botón de shadcn como respaldo */}
              <div className="hidden">
                <Button type="submit" className="w-full mt-2">
                  Crear Recorte
                </Button>
              </div>
            </form>
          </div>
        </SideDrawerContent>
      </SideDrawer>
    </>
  );
}
