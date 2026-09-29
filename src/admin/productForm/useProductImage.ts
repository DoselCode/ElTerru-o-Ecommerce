import { useState } from 'react';
import imageCompression from 'browser-image-compression';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;

export const useProductImage = (onError: (message: string) => void, onValid: () => void) => {
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const selectImage = async (file: File) => {
    let processed: File | Blob = file;
    if (COMPRESSIBLE_TYPES.includes(file.type)) {
      try {
        processed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 1200, useWebWorker: true });
      } catch (err) {
        console.warn('Compresión omitida, se usa la imagen original:', err);
      }
    }
    setImageFile(processed);
    setImagePreview(URL.createObjectURL(processed));
    onValid();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // El atributo accept del input se puede saltear, por eso se valida el tipo acá
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError('Tipo no permitido. Solo JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      onError(`La imagen no puede superar ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    await selectImage(file);
  };

  const reset = (preview = '') => {
    setImageFile(null);
    setImagePreview(preview);
  };

  return { imageFile, imagePreview, handleImageChange, reset };
};
