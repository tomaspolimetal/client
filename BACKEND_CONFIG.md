# Configuración del Backend para Subida de Archivos

## Problema Identificado

El error 500 que estás experimentando al subir imágenes indica que el backend en Render no está configurado correctamente para manejar archivos FormData. Este es un problema común cuando se despliega una aplicación que maneja archivos.

## Configuraciones Necesarias en el Backend

### 1. Configurar Body Parser para Archivos Grandes

En tu archivo principal del backend (app.js o server.js), asegúrate de tener:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();

// Aumentar los límites de body-parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
```

### 2. Configurar Multer para Manejo de Archivos

```javascript
// Configuración de multer para archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Asegúrate de que esta carpeta exista
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: function (req, file, cb) {
    // Validar tipos de archivo
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});
```

### 3. Configurar la Ruta de Recortes

```javascript
// Ruta para crear recortes con imagen
app.post('/api/recortes', upload.single('imagen'), async (req, res) => {
  try {
    const { largo, ancho, espesor, cantidad, maquinaId, observaciones } = req.body;
    
    // Crear el objeto recorte
    const recorteData = {
      largo: parseFloat(largo),
      ancho: parseFloat(ancho),
      espesor: parseFloat(espesor),
      cantidad: parseInt(cantidad),
      maquinaId,
      observaciones: observaciones || null,
      imagen: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    // Guardar en la base de datos
    const nuevoRecorte = await Recorte.create(recorteData);
    
    res.status(201).json(nuevoRecorte);
  } catch (error) {
    console.error('Error creando recorte:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});
```

### 4. Servir Archivos Estáticos

```javascript
// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));
```

### 5. Configurar CORS para Archivos

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://tu-dominio-vercel.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 6. Manejo de Errores Global

```javascript
// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'Archivo demasiado grande',
        message: 'El archivo excede el límite de 10MB' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Campo de archivo inesperado',
        message: 'El campo de archivo no coincide con lo esperado' 
      });
    }
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message 
  });
});
```

## Consideraciones para Render.com

### 1. Variables de Entorno
Asegúrate de configurar las siguientes variables de entorno en Render:

```
NODE_ENV=production
PORT=10000
```

### 2. Crear Directorio de Uploads
En tu `package.json`, agrega un script para crear el directorio de uploads:

```json
{
  "scripts": {
    "start": "mkdir -p uploads && node server.js",
    "dev": "mkdir -p uploads && nodemon server.js"
  }
}
```

### 3. Dependencias Necesarias
Asegúrate de tener estas dependencias en tu `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "multer": "^1.4.5",
    "body-parser": "^1.20.0",
    "cors": "^2.8.5",
    "path": "^0.12.7"
  }
}
```

## Solución Temporal

Mientras configuras el backend, he actualizado el frontend para:

1. **Validar el tamaño del archivo** antes de enviarlo (límite de 10MB)
2. **Mostrar mensajes de error más descriptivos** para diferentes tipos de errores
3. **Manejar específicamente el error 500** con un mensaje claro

## Próximos Pasos

1. Implementa las configuraciones del backend mencionadas arriba
2. Redespliega tu backend en Render
3. Prueba la subida de archivos nuevamente
4. Si persisten los problemas, revisa los logs de Render para más detalles

## Logs de Render

Para diagnosticar mejor el problema:
1. Ve a tu dashboard de Render
2. Selecciona tu servicio backend
3. Ve a la pestaña "Logs"
4. Intenta subir un archivo y observa los errores en tiempo real

Esto te dará información más específica sobre qué está fallando en el backend.