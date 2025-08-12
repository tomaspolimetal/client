# Recortes App - Cliente

Aplicación web para gestión de recortes de materiales con interfaz moderna desarrollada en Next.js.

## 🚀 Características

- ✅ Gestión de recortes con imágenes
- ✅ Administración de clientes y máquinas
- ✅ Interfaz responsive con Tailwind CSS
- ✅ Comunicación en tiempo real con Socket.IO
- ✅ Componentes UI modernos con shadcn/ui

## 🛠️ Tecnologías

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI
- **Socket.IO** - Comunicación en tiempo real
- **Lucide React** - Iconos

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend de la aplicación ejecutándose

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd client
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con las URLs de tu backend:
   ```env
   NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://tu-backend.onrender.com
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter

## 🌐 Despliegue en Vercel

1. **Conectar con GitHub**
   - Sube el código a GitHub
   - Conecta tu repositorio con Vercel

2. **Configurar variables de entorno en Vercel**
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://tu-backend.onrender.com
   ```

3. **Desplegar**
   - Vercel desplegará automáticamente desde la rama main

## 📁 Estructura del Proyecto

```
src/
├── app/                 # Páginas de la aplicación (App Router)
│   ├── cliente/        # Gestión de clientes
│   ├── create/         # Crear recortes
│   ├── recortes/       # Lista de recortes
│   └── historial/      # Historial
├── components/         # Componentes reutilizables
│   ├── ui/            # Componentes UI base
│   └── *.tsx          # Componentes específicos
├── config/            # Configuración centralizada
├── context/           # Contextos de React
├── hooks/             # Hooks personalizados
├── lib/               # Utilidades
└── utils/             # Funciones auxiliares
```

## 🔌 Configuración del Backend

Esta aplicación requiere un backend compatible. Asegúrate de que tu backend:

- Tenga CORS configurado para tu dominio
- Soporte Socket.IO para comunicación en tiempo real
- Tenga los endpoints necesarios para recortes, clientes y máquinas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
