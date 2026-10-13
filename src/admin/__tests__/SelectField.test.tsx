// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SelectField } from '../productForm/FormField';

afterEach(cleanup);

const options = [
  { id: 'a', name: 'ALCARAZ' },
  { id: 'b', name: 'DANKON' },
  { id: 'c', name: 'El Conquistador' },
];

const setup = (value = '') => {
  const onChange = vi.fn();
  render(
    <SelectField label="Proveedor" name="provider_id" value={value} onChange={onChange} options={options} placeholder={{ label: 'Ninguno' }} />
  );
  return onChange;
};

describe('SelectField', () => {
  it('muestra el placeholder y lista las opciones al abrir', () => {
    setup();
    expect(screen.getByRole('combobox').textContent).toContain('Ninguno');
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('filtra por texto y emite el cambio con name y value', () => {
    const onChange = setup();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.change(screen.getByLabelText('Buscar Proveedor'), { target: { value: 'conq' } });
    const found = screen.getAllByRole('option');
    expect(found).toHaveLength(1);
    fireEvent.click(found[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target).toMatchObject({ name: 'provider_id', value: 'c' });
  });

  it('permite limpiar la selección con la opción vacía', () => {
    const onChange = setup('b');
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Ninguno' }));
    expect(onChange.mock.calls[0][0].target.value).toBe('');
  });
});
