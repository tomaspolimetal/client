'use client'
import { useState, FormEvent, useEffect } from 'react';
import { useSocket } from "../../context/SocketProvider";
import config from "@/config/config";

interface Maquina {
  nombre: string;
}

interface Recorte {
  largo: number;
  ancho: number;
  espesor: number;
  cantidad: number;
  maquinaId: string;
  imagen?: File | null;
}

export default function Create() {
  const [status, setStatus] = useState("🔴 Desconectado");
  const [maquinas, setMaquinas] = useState<Array<{ id: string; nombre: string }>>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Estado para el formulario de máquina
  const [maquina, setMaquina] = useState<Maquina>({
    nombre: ''
  });

  // Estado para el formulario de recorte
  const [recorte, setRecorte] = useState<Recorte>({
    largo: 0,
    ancho: 0,
    espesor: 0,
    cantidad: 0,
    maquinaId: '',
    imagen: null
  });

  const { socket } = useSocket();

  // Efecto para manejar la conexión del socket y cargar máquinas
  useEffect(() => {
    if (!socket) return;
    
    socket.on("connect", () => {
      setStatus("🟢 Conectado");
      // Cargar lista de máquinas al conectar
      fetch(`${config.API_BASE_URL}/api/maquinas`)
        .then(res => res.json())
        .then(data => setMaquinas(data))
        .catch(err => console.error('Error cargando máquinas:', err));
    });

    socket.on("disconnect", () => {
      setStatus("🔴 Desconectado");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  // Manejador para crear máquina
  const handleMaquinaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/maquinas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maquina)
      });
      if (response.ok) {
        const newMaquina = await response.json();
        setMaquinas([...maquinas, newMaquina]);
        setMaquina({ nombre: '' ,});
        alert('Máquina creada exitosamente');
      }
    } catch (error) {
      console.error('Error creando máquina:', error);
      alert('Error al crear la máquina');
    }
  };

  // Manejador para crear recorte
  const handleRecorteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('largo', recorte.largo.toString());
      formData.append('ancho', recorte.ancho.toString());
      formData.append('espesor', recorte.espesor.toString());
      formData.append('cantidad', recorte.cantidad.toString());
      formData.append('maquinaId', recorte.maquinaId);
      if (recorte.imagen) {
        formData.append('imagen', recorte.imagen);
      }

      const response = await fetch(`${config.API_BASE_URL}/api/recortes`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setRecorte({
          largo: 0,
          ancho: 0,
          espesor: 0,
          cantidad: 0,
          maquinaId: '',
          imagen: null
        });
        alert('Recorte creado exitosamente');
      }
    } catch (error) {
      console.error('Error creando recorte:', error);
      alert('Error al crear el recorte');
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="status">{status}</div>

        {/* Formulario para crear recorte */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-700 ">Crear Recorte</h2>
          <form onSubmit={handleRecorteSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Largo (mm)</label>
                <input
                  type="number"
                  value={recorte.largo || ''}
                  onChange={(e) => setRecorte({...recorte, largo: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ancho (mm)</label>
                <input
                  type="number"
                  value={recorte.ancho || ''}
                  onChange={(e) => setRecorte({...recorte, ancho: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Espesor (mm)</label>
                <input
                  type="number"
                  value={recorte.espesor || ''}
                  onChange={(e) => setRecorte({...recorte, espesor: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                <input
                  type="number"
                  value={recorte.cantidad || ''}
                  onChange={(e) => setRecorte({...recorte, cantidad: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Máquina</label>
              <select
                value={recorte.maquinaId}
                onChange={(e) => setRecorte({...recorte, maquinaId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
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
              <label className="block text-sm font-medium text-gray-700">Imagen</label>
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
            <button
              type="submit"
              className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Crear Recorte
            </button>
          </form>
        </div>
      </div>
    
  );
}