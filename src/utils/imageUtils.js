/**
 * Lee y comprime una imagen subida desde la PC usando HTML5 Canvas
 * para poder guardarla de forma ligera en LocalStorage (~60-140 KB).
 */
export const compressImageToDataUrl = (file, maxDimension = 1200, quality = 0.8) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    // Si es un SVG pequeño, conservarlo directo como Data URL
    if (file.type === 'image/svg+xml' && file.size < 250 * 1024) {
      const svgReader = new FileReader();
      svgReader.onload = () => resolve(svgReader.result);
      svgReader.onerror = () => reject(new Error('No se pudo leer el archivo SVG.'));
      svgReader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error leyendo archivo de imagen.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Intentar WebP para máxima compresión, fallback a JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
