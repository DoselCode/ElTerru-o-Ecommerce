import { backend } from './backend';

/**
 * Cliente único de backend (InsForge en dev, Supabase en prod según variables de entorno).
 * Se mantiene el alias `insforge` para retrocompatibilidad total con los servicios existentes.
 */
export const insforge = backend;
export { backend };
export default backend;
