/**
 * Módulo de integración con Google Drive Picker API y Google Identity Services.
 */

// Tipos para las APIs globales de Google cargadas dinámicamente
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_APP_ID = import.meta.env.VITE_GOOGLE_APP_ID || '';

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

let gapiLoaded = false;
let gisLoaded = false;
let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Carga dinámicamente el script de Google API (gapi)
 */
export const loadGapiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gapiLoaded && window.gapi) {
      resolve();
      return;
    }
    if (document.getElementById('google-api-script')) {
      const checkGapi = setInterval(() => {
        if (window.gapi) {
          clearInterval(checkGapi);
          window.gapi.load('picker', () => {
            gapiLoaded = true;
            resolve();
          });
        }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-api-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('picker', () => {
        gapiLoaded = true;
        resolve();
      });
    };
    script.onerror = () => reject(new Error('No se pudo cargar Google API script (gapi).'));
    document.body.appendChild(script);
  });
};

/**
 * Carga dinámicamente el script de Google Identity Services (GIS)
 */
export const loadGisScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gisLoaded && window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    if (document.getElementById('google-gis-script')) {
      const checkGis = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(checkGis);
          gisLoaded = true;
          resolve();
        }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services script.'));
    document.body.appendChild(script);
  });
};

/**
 * Solicita el Token de Acceso OAuth 2.0 mediante Google Identity Services
 */
export const getOAuthToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID no está configurado en las variables de entorno.'));
      return;
    }

    // Si ya tenemos un token válido en memoria
    if (accessToken && Date.now() < tokenExpiresAt - 60000) {
      resolve(accessToken);
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(`Error de autenticación con Google: ${tokenResponse.error_description || tokenResponse.error}`));
            return;
          }
          accessToken = tokenResponse.access_token;
          const expiresIn = Number(tokenResponse.expires_in) || 3600;
          tokenExpiresAt = Date.now() + expiresIn * 1000;
          resolve(tokenResponse.access_token);
        },
      });

      tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
    } catch (err: any) {
      reject(new Error(`Error al inicializar cliente de autenticación: ${err?.message || err}`));
    }
  });
};

export interface PickedGoogleDriveFile {
  file: File;
  name: string;
  id: string;
  previewUrl: string;
}

/**
 * Abre el selector oficial de Google Drive (Picker) configurado para imágenes y carpetas.
 * Descarga la imagen seleccionada y la devuelve como objeto File listo para usar.
 */
export const openGoogleDrivePicker = async (): Promise<PickedGoogleDriveFile | null> => {
  if (!GOOGLE_API_KEY) {
    throw new Error('VITE_GOOGLE_API_KEY no está configurado en las variables de entorno.');
  }
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('VITE_GOOGLE_CLIENT_ID no está configurado en las variables de entorno.');
  }

  // 1. Cargar scripts de Google
  await Promise.all([loadGapiScript(), loadGisScript()]);

  // 2. Obtener Token de Acceso
  const token = await getOAuthToken();

  // 3. Crear y abrir Google Picker
  return new Promise((resolve, reject) => {
    try {
      // Vista 1: Todas las imágenes y fotos
      const photosView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
        .setMode(window.google.picker.DocsViewMode.GRID);

      // Vista 2: Explorador de Google Drive con carpetas e imágenes
      const driveExplorerView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
        .setIncludeFolders(true)
        .setMimeTypes('image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/bmp,image/svg+xml,application/vnd.google-apps.folder')
        .setMode(window.google.picker.DocsViewMode.GRID);

      const pickerBuilder = new window.google.picker.PickerBuilder()
        .setOrigin(window.location.protocol + '//' + window.location.host)
        .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
        .setOAuthToken(token)
        .addView(photosView)
        .addView(driveExplorerView)
        .addView(new window.google.picker.DocsUploadView())
        .setDeveloperKey(GOOGLE_API_KEY)
        .setTitle('Seleccionar imagen desde Google Drive')
        .setSize(1050, 650);

      if (GOOGLE_APP_ID) {
        pickerBuilder.setAppId(GOOGLE_APP_ID);
      }

      pickerBuilder.setCallback(async (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0];
          const fileId = doc.id;
          let fileName = doc.name || 'producto.jpg';
          let mimeType = doc.mimeType || 'image/jpeg';

          try {
            let blob: Blob | null = null;

            const isHeicOrRaw =
              fileName.toLowerCase().endsWith('.heic') ||
              fileName.toLowerCase().endsWith('.heif') ||
              fileName.toLowerCase().endsWith('.cr2') ||
              fileName.toLowerCase().endsWith('.nef') ||
              fileName.toLowerCase().endsWith('.dng');

            // 1. Intentar descarga directa del archivo con Google Drive API v3
            try {
              const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                blob = await response.blob();
              } else {
                console.warn(`Drive API status ${response.status}, intentando fallback por thumbnail...`);
              }
            } catch (fetchErr) {
              console.warn('Error en fetch directo de Drive API:', fetchErr);
            }

            // 2. Si es HEIC/RAW (no compatible con navegadores) o falló la descarga directa,
            // usamos la versión renderizada en JPEG de alta resolución de Google
            const highResThumbUrl = doc.thumbnails?.[0]?.url
              ? doc.thumbnails[0].url.replace(/=s\d+/, '=s1600')
              : `https://lh3.googleusercontent.com/d/${fileId}=s1600`;

            if ((!blob || isHeicOrRaw) && highResThumbUrl) {
              try {
                const thumbRes = await fetch(highResThumbUrl);
                if (thumbRes.ok) {
                  blob = await thumbRes.blob();
                  mimeType = 'image/jpeg';
                  fileName = fileName.replace(/\.(heic|heif|cr2|nef|dng)$/i, '.jpg');
                }
              } catch (thumbErr) {
                console.warn('Error descargando thumbnail de alta resolución:', thumbErr);
              }
            }

            if (!blob || blob.size === 0) {
              throw new Error('No se pudo obtener el contenido de la imagen de Google Drive.');
            }

            // Normalizar MIME type
            if (!mimeType || mimeType === 'application/octet-stream') {
              if (fileName.toLowerCase().endsWith('.png')) mimeType = 'image/png';
              else if (fileName.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
              else mimeType = 'image/jpeg';
            }

            const safeBlob = new Blob([blob], { type: mimeType });
            const file = new File([safeBlob], fileName, { type: mimeType });

            // 3. Generar DataURL robusto para la vista previa
            const previewUrl = await new Promise<string>((res) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  res(reader.result);
                } else {
                  res(URL.createObjectURL(file));
                }
              };
              reader.onerror = () => {
                if (highResThumbUrl) res(highResThumbUrl);
                else res(URL.createObjectURL(file));
              };
              reader.readAsDataURL(safeBlob);
            });

            resolve({
              file,
              name: fileName,
              id: fileId,
              previewUrl,
            });
          } catch (processErr: any) {
            console.error('Error procesando archivo de Google Drive:', processErr);
            reject(processErr);
          }
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null);
        }
      });

      const picker = pickerBuilder.build();
      picker.setVisible(true);
    } catch (err: any) {
      reject(new Error(`Error al abrir Google Picker: ${err?.message || err}`));
    }
  });
};
