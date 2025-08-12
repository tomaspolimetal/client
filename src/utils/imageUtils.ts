/**
 * Utilidades para manejar imágenes en la aplicación
 */

/**
 * Determina si una imagen es una URL o un string base64
 * y retorna la URL apropiada para el atributo src
 * @param imagen - String que puede ser una URL relativa o un string base64
 * @param apiBaseUrl - URL base de la API para construir URLs completas
 * @returns URL completa para usar en el atributo src de img
 */
export function getImageSrc(imagen: string | undefined, apiBaseUrl: string): string | null {
  if (!imagen) return null;
  
  // Si la imagen ya es un data URL (base64), la retornamos tal como está
  if (imagen.startsWith('data:')) {
    return imagen;
  }
  
  // Si la imagen es un string base64 sin el prefijo data:, lo agregamos
  if (isBase64String(imagen)) {
    return `data:image/jpeg;base64,${imagen}`;
  }
  
  // Si es una URL relativa (como /uploads/filename), construimos la URL completa
  if (imagen.startsWith('/')) {
    return `${apiBaseUrl}${imagen}`;
  }
  
  // Si es una URL completa, la retornamos tal como está
  if (imagen.startsWith('http')) {
    return imagen;
  }
  
  // Por defecto, asumimos que es una URL relativa
  return `${apiBaseUrl}/${imagen}`;
}

/**
 * Verifica si un string es un string base64 válido
 * @param str - String a verificar
 * @returns true si es un string base64 válido
 */
function isBase64String(str: string): boolean {
  try {
    // Un string base64 válido debe:
    // 1. Tener longitud múltiplo de 4 (después de remover padding)
    // 2. Contener solo caracteres base64 válidos
    // 3. Tener padding correcto
    
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    
    // Verificar que solo contenga caracteres base64 válidos
    if (!base64Regex.test(str)) {
      return false;
    }
    
    // Verificar longitud (debe ser múltiplo de 4)
    if (str.length % 4 !== 0) {
      return false;
    }
    
    // Intentar decodificar para verificar que es base64 válido
    atob(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Crea una URL de vista previa para un archivo
 * @param file - Archivo seleccionado
 * @returns URL de vista previa
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Libera una URL de vista previa creada con createPreviewUrl
 * @param url - URL a liberar
 */
export function revokePreviewUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}