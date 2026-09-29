import { insforge } from '../lib/insforge';
import { RegisterState, EMPTY_REGISTER } from '../admin/types';

export const registerService = {
  getGlobalRegister: async (): Promise<RegisterState> => {
    const { data, error } = await insforge.database
      .from('registers')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error) throw error;
    if (!data) return EMPTY_REGISTER;
    return {
      status: data.status,
      efectivoInicial: Number(data.efectivo_inicial || 0),
      openedAt: data.opened_at || null,
      numero: Number(data.numero || 0),
      saldoProxima: Number(data.saldo_proxima || 0),
      movimientos: Array.isArray(data.movimientos) ? data.movimientos : []
    };
  },

  upsertGlobalRegister: async (reg: RegisterState): Promise<void> => {
    const { error } = await insforge.database.from('registers').upsert([{
      id: 'global',
      status: reg.status,
      efectivo_inicial: reg.efectivoInicial,
      opened_at: reg.openedAt,
      numero: reg.numero,
      saldo_proxima: reg.saldoProxima,
      movimientos: reg.movimientos,
      updated_at: new Date().toISOString()
    }]);
    if (error) throw error;
  }
};
