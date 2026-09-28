import { insforge } from '../lib/insforge';
import { RegisterState } from '../admin/AdminContext';

export const registerService = {
  getGlobalRegister: async (): Promise<RegisterState> => {
    const { data, error } = await insforge.database
      .from('registers')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { status: 'cerrada', efectivo: 0, transferencia: 0, tarjeta: 0 };
    }
    return {
      status: data.status,
      efectivo: Number(data.efectivo),
      transferencia: Number(data.transferencia),
      tarjeta: Number(data.tarjeta)
    };
  },

  upsertGlobalRegister: async (reg: RegisterState): Promise<void> => {
    const { error } = await insforge.database.from('registers').upsert([{
      id: 'global',
      status: reg.status,
      efectivo: reg.efectivo,
      transferencia: reg.transferencia,
      tarjeta: reg.tarjeta,
      updated_at: new Date().toISOString()
    }]);
    if (error) throw error;
  }
};
