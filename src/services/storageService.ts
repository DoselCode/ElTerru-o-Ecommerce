import { insforge } from '../lib/insforge';

export const storageService = {
  uploadProductImage: async (file: File | Blob): Promise<string> => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user) throw new Error('No autorizado para subir archivos');

    const ext = file instanceof File ? (file.name.split('.').pop() || 'jpg') : 'jpg';
    const fileName = `products/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await insforge.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    const { data } = insforge.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  }
};
