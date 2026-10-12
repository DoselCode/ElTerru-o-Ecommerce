import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test.describe('Security & Stock: Input Validation and Sanitization', () => {
  // Solo se habilita si tenemos las variables para entrar como admin
  test.skip('El formulario rechaza stock y precio negativo en el Frontend', async ({ app, agent }) => {
    // Esto es un test UI agentic
    await app.open('/admin/stock');
    
    // Asumiendo que hay una forma de saltarse el login en test o nos logueamos:
    // await agent.act('log in with valid admin credentials');
    // Por simplicidad, este test es figurativo para el setup de e2e.
    
    await agent.act('click on "Nuevo Producto"');
    await agent.act('fill "Stock" with "-50"');
    await agent.act('fill "Precio" with "-100"');
    await agent.act('click "Guardar"');
    
    // Verificamos si el UI lanza error
    await agent.assert('hay un mensaje de error indicando que el stock o precio no pueden ser negativos');
  });

  test.skip('El formulario sanitiza etiquetas HTML peligrosas (XSS)', async ({ app, agent }) => {
    await app.open('/admin/stock');
    await agent.act('click on "Nuevo Producto"');
    await agent.act('fill "Nombre" with "<img src=x onerror=alert(1)> Vino Loco"');
    await agent.act('fill "Stock" with "10"');
    await agent.act('fill "Precio" with "5000"');
    await agent.act('click "Guardar"');
    
    // Validar que el alert no saltó o que el título escapó los caracteres
    await agent.assert('the product name is safely rendered as plain text without executing an alert');
  });
});
