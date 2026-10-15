const { test, expect } = require('@playwright/test');

// ===== HELPER =====

// Helper: Sign up user baru dengan username unik
async function signUpNewUser(page) {
  const username = `testuser_${Date.now()}`;
  const password = 'testpass123';
  
  await page.goto('https://www.demoblaze.com');
  
  // Handle dialog: hanya sekali untuk sign up
  await page.click('#signin2');
  await page.waitForSelector('#signInModal', { state: 'visible' });
  
  const dialogPromise = page.waitForEvent('dialog');
  await page.fill('#sign-username', username);
  await page.fill('#sign-password', password);
  await page.click('button[onclick="register()"]');
  
  const dialog = await dialogPromise;
  console.log('Sign up dialog:', dialog.message());
  await dialog.accept();
  
  // Tunggu modal tertutup
  await page.waitForTimeout(1000);
  
  return { username, password };
}

// Helper: Login dengan user
async function loginUser(page, username, password) {
  await page.click('#login2');
  await page.waitForSelector('#logInModal', { state: 'visible' });
  await page.fill('#loginusername', username);
  await page.fill('#loginpassword', password);
  await page.click('button[onclick="logIn()"]');
  await page.waitForTimeout(1500);
}

// ===== TEST =====

test.describe('DemoBlaze E2E Tests', () => {

  test('E2E-001: Halaman utama dapat diakses', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    await expect(page).toHaveTitle(/STORE/);
    await expect(page.locator('#nava')).toBeVisible();
    await expect(page.locator('.navbar-brand')).toContainText('PRODUCT STORE');
  });

  test('E2E-002: Navigasi ke halaman Contact', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    await page.click('a[data-target="#exampleModal"]');
    await expect(page.locator('#exampleModal')).toBeVisible();
    await expect(page.locator('#recipient-email')).toBeVisible();
    await expect(page.locator('#recipient-name')).toBeVisible();
    await expect(page.locator('#message-text')).toBeVisible();
  });

  test('E2E-003: Navigasi ke halaman About Us', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    await page.click('a[data-target="#videoModal"]');
    await expect(page.locator('#videoModal')).toBeVisible();
  });

  test('E2E-004: Navigasi ke halaman Cart', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    await page.click('#cartur');
    await page.waitForURL('**/cart.html');
    await expect(page).toHaveURL(/cart/);
  });

  test('E2E-005: Sign up user baru', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    await page.click('#signin2');
    await page.waitForSelector('#signInModal', { state: 'visible' });
    
    const username = `user_${Date.now()}`;
    await page.fill('#sign-username', username);
    await page.fill('#sign-password', 'pass123');
    
    // Tangkap dialog dengan waitForEvent
    const dialogPromise = page.waitForEvent('dialog');
    await page.click('button[onclick="register()"]');
    const dialog = await dialogPromise;
    
    expect(dialog.message()).toContain('Sign up successful');
    await dialog.accept();
  });

  test('E2E-006: Login dengan user yang sudah terdaftar', async ({ page }) => {
    const { username, password } = await signUpNewUser(page);
    await loginUser(page, username, password);
    
    await expect(page.locator('#nameofuser')).toContainText('Welcome', { timeout: 5000 });
    await expect(page.locator('#logout2')).toBeVisible();
  });

  test('E2E-007: Login gagal dengan password salah', async ({ page }) => {
    const { username } = await signUpNewUser(page);
    
    // Handle dialog login gagal
    await page.click('#login2');
    await page.waitForSelector('#logInModal', { state: 'visible' });
    await page.fill('#loginusername', username);
    await page.fill('#loginpassword', 'wrongpassword');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.click('button[onclick="logIn()"]');
    const dialog = await dialogPromise;
    
    expect(dialog.message()).toContain('Wrong password');
    await dialog.accept();
  });

  test('E2E-008: Add produk ke cart', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    
    await page.click('a:has-text("Samsung galaxy s6")');
    await page.waitForURL('**/prod.html**');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.click('a:has-text("Add to cart")');
    const dialog = await dialogPromise;
    await dialog.accept();
    
    await page.click('#cartur');
    await page.waitForURL('**/cart.html');
    await page.waitForTimeout(1500);
    
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('E2E-009: Remove produk dari cart', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    
    await page.click('a:has-text("Samsung galaxy s6")');
    await page.waitForURL('**/prod.html**');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.click('a:has-text("Add to cart")');
    const dialog = await dialogPromise;
    await dialog.accept();
    
    await page.click('#cartur');
    await page.waitForURL('**/cart.html');
    await page.waitForTimeout(1500);
    
    const initialRows = await page.locator('tbody tr').count();
    expect(initialRows).toBeGreaterThan(0);
    
    await page.click('a:has-text("Delete")');
    await page.waitForTimeout(1500);
    
    const afterDeleteRows = await page.locator('tbody tr').count();
    expect(afterDeleteRows).toBeLessThan(initialRows);
  });

  test('E2E-010: Checkout berhasil', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    
    // Add produk
    await page.click('a:has-text("Samsung galaxy s6")');
    await page.waitForURL('**/prod.html**');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.click('a:has-text("Add to cart")');
    const dialog = await dialogPromise;
    await dialog.accept();
    
    // Buka cart
    await page.click('#cartur');
    await page.waitForURL('**/cart.html');
    await page.waitForTimeout(1500);
    
    // Klik Place Order
    await page.click('button[data-target="#orderModal"]');
    await page.waitForSelector('#orderModal', { state: 'visible' });
    
    // Isi form
    await page.fill('#name', 'John Doe');
    await page.fill('#country', 'Indonesia');
    await page.fill('#city', 'Jakarta');
    await page.fill('#card', '1234567890');
    await page.fill('#month', '12');
    await page.fill('#year', '2025');
    
    // Klik Purchase
    await page.click('button[onclick="purchaseOrder()"]');
    
    // SweetAlert adalah modal HTML, BUKAN alert native
    await page.waitForSelector('.sweet-alert', { state: 'visible', timeout: 10000 });
    
    // Verifikasi teks SweetAlert
    const sweetAlertText = await page.locator('.sweet-alert h2').textContent();
    expect(sweetAlertText).toContain('Thank you for your purchase');
    
    // Klik OK untuk menutup SweetAlert
    await page.click('.sweet-alert button.confirm');
  });

});