/**
 * Converts a File or Blob into a clean base64 string and its verified mimeType
 */
export async function fileToBase64(file: File | Blob): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (file.type && !file.type.startsWith('image/')) {
      reject(new Error(`Invalid file format (${file.type}). Please select a valid JPEG, PNG, or WebP image.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result) {
        reject(new Error('Failed to read image file data.'));
        return;
      }

      // Check for data: URI prefix
      const match = result.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        resolve({
          mimeType: match[1],
          base64: match[2],
        });
      } else if (result.startsWith('data:')) {
        // Non-image data URI received (e.g., text/html)
        reject(new Error('Selected file is not a valid image format.'));
      } else {
        const mimeType = file.type?.startsWith('image/') ? file.type : 'image/jpeg';
        resolve({ base64: result, mimeType });
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Loads an image URL (local asset, relative path, or external URL) and converts to clean base64
 */
export async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  // If already a valid image data URI
  if (url.startsWith('data:image/')) {
    const match = url.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], base64: match[2] };
    }
  }

  // Load via HTMLImageElement and render to offscreen canvas
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to create 2D canvas context');
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
        resolve({ base64, mimeType: 'image/jpeg' });
      } catch {
        // If canvas is tainted or fails, fallback to direct fetch with validation
        fetchBlobFallback(url).then(resolve).catch(reject);
      }
    };

    img.onerror = () => {
      fetchBlobFallback(url).then(resolve).catch(reject);
    };

    img.src = url;
  });
}

async function fetchBlobFallback(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load specimen image (HTTP ${response.status}).`);
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Received unexpected content-type (${contentType || 'unknown'}). Expected an image.`);
  }
  const blob = await response.blob();
  return fileToBase64(blob);
}

/**
 * Resizes an image file/blob to a maximum dimension while maintaining aspect ratio and image clarity
 */
export async function optimizeImageForUpload(
  file: File | Blob,
  maxDimension = 1400
): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (file.type && !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file format. Please upload a JPEG, PNG, or WebP photo.'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2D canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.92);
      const cleanBase64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
      resolve({ base64: cleanBase64, mimeType, dataUrl });
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
