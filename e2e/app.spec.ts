import { expect, test } from '@playwright/test';

test.describe('TalentFlow E2E Journey', () => {
  test('debe cargar la vista de registro de candidato y sus pestañas', async ({ page }) => {
    await page.goto('/');

    // Debe mostrar el título principal de la pantalla de Registro
    await expect(page.locator('app-registro ion-title')).toContainText('TalentFlow — Registro');

    // Debe mostrar la barra de navegación con ambas pestañas
    const tabRegistro = page.locator('ion-tab-button[tab="registro"]');
    const tabCandidatos = page.locator('ion-tab-button[tab="candidatos"]');
    await expect(tabRegistro).toBeVisible();
    await expect(tabCandidatos).toBeVisible();

    // Debe contener las tarjetas principales del formulario
    await expect(page.locator('ion-card-title').first()).toBeVisible();

    // Navegar a la pestaña de Candidatos
    await tabCandidatos.click();
    await expect(page).toHaveURL(/.*tabs\/candidatos/);
    await expect(page.locator('app-candidatos ion-title')).toContainText('Candidatos Postulados');
  });
});
