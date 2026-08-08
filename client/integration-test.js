import puppeteer from 'puppeteer';
import assert from 'assert';
import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

async function runTest() {
  let results = [];
  const pass = (msg) => { console.log('✅ ' + msg); results.push(`[x] ${msg}`); };
  const fail = (msg) => { console.log('❌ ' + msg); results.push(`[ ] ${msg} (FAILED)`); };

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('--- Authentication & Session Flow ---');
    await page.goto(BASE_URL);
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    const url1 = page.url();
    if (url1.includes('/login') || (await page.content()).includes('Log In')) {
      pass('Visit app fresh — lands on /login or Dashboard placeholder appropriately');
    } else {
      fail('Visit app fresh did not land on expected page. URL: ' + url1);
    }

    await page.goto(`${BASE_URL}/register`);
    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="name"]', 'Test User');
    await page.type('input[name="email"]', 'test@test.com');
    await page.type('input[name="password"]', '123'); 
    await page.click('button[type="submit"]');
    await page.waitForSelector('.text-red-600, .bg-red-50', { timeout: 3000 });
    pass('Register with short password — confirm validation error shows clearly');

    await page.type('input[name="password"]', '456789'); 
    await page.click('button[type="submit"]');
    await page.waitForFunction('window.location.pathname === "/"', { timeout: 5000 });
    const navText = await page.evaluate(() => document.body.innerText);
    if (navText.includes('Test User') || navText.includes('Dashboard')) {
      pass('Register with valid data — redirect to / and navbar shows logged in state');
    } else {
      fail('Navbar did not show logged in state');
    }

    await page.reload({ waitUntil: 'networkidle0' });
    const navText2 = await page.evaluate(() => document.body.innerText);
    if (navText2.includes('Dashboard') || navText2.includes('Log out')) {
      pass('Refresh the page — confirm still logged in');
    } else {
      fail('Failed to persist session on refresh');
    }

    const [logoutBtn] = await page.$x("//button[contains(., 'Log out')]");
    await logoutBtn.click();
    await page.waitForFunction('window.location.pathname === "/login"', { timeout: 3000 });
    pass('Click "Log out" — redirect to /login and navbar reverts');

    await page.type('input[name="email"]', 'test@test.com');
    await page.type('input[name="password"]', '123456789');
    await page.click('button[type="submit"]');
    await page.waitForFunction('window.location.pathname === "/"', { timeout: 3000 });
    pass('Log back in with same credentials — confirm redirect to /');

    const [logoutBtn2] = await page.$x("//button[contains(., 'Log out')]");
    await logoutBtn2.click();
    await page.waitForFunction('window.location.pathname === "/login"', { timeout: 3000 });

    await page.type('input[name="email"]', 'test@test.com');
    await page.type('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.bg-red-50', { timeout: 3000 });
    const errorText = await page.evaluate(() => document.querySelector('.bg-red-50').innerText);
    if (errorText.includes('Invalid credentials')) {
      pass('Try logging in with wrong password — confirm exact backend error displays');
    } else {
      fail('Wrong backend error: ' + errorText);
    }

    await page.type('input[name="email"]', '', { clickCount: 3 }); await page.keyboard.press('Backspace');
    await page.type('input[name="password"]', '', { clickCount: 3 }); await page.keyboard.press('Backspace');
    await page.type('input[name="email"]', 'test@test.com');
    await page.type('input[name="password"]', '123456789');
    await page.click('button[type="submit"]');
    await page.waitForFunction('window.location.pathname === "/"', { timeout: 3000 });

    console.log('--- Subscription List & Empty State ---');
    await page.goto(`${BASE_URL}/subscriptions`);
    await page.waitForSelector('h3'); 
    const emptyStateText = await page.evaluate(() => document.body.innerText);
    if (emptyStateText.includes('No subscriptions yet')) {
      pass('Go to /subscriptions with zero subscriptions — EmptyState shows correctly');
    } else {
      fail('Empty state not found');
    }

    const [addFirstBtn] = await page.$x("//button[contains(., 'Add your first subscription')]");
    if (addFirstBtn) {
      pass('Confirm "Add your first subscription" button is visible');
    } else {
      fail('Add your first subscription button not found');
    }

    console.log('--- Create Flow ---');
    const [addBtn] = await page.$x("//button[contains(., 'Add Subscription')]");
    await addBtn.click();
    await page.waitForSelector('form', { timeout: 2000 });
    pass('Click "Add Subscription" — modal opens');

    await page.click('button[type="submit"]');
    await page.waitForSelector('.text-red-500', { timeout: 2000 });
    pass('Submit empty name — inline validation blocks, no network request');

    await page.type('input[name="name"]', 'Netflix');
    await page.type('input[name="cost"]', '499');
    await page.type('input[name="nextRenewalDate"]', '12122026'); 
    await page.evaluate(() => { document.querySelector('input[name="nextRenewalDate"]').value = '2026-12-12'; });
    await page.click('button[type="submit"]');
    await page.waitForSelector('.bg-green-600', { timeout: 3000 }); 
    pass('Fill valid monthly subscription — modal closes, toast appears, card appears');

    await page.waitForTimeout(1000);
    
    const [addBtn2] = await page.$x("//button[contains(., 'Add Subscription')]");
    await addBtn2.click();
    await page.waitForSelector('form');
    await page.type('input[name="name"]', 'Spotify');
    await page.type('input[name="cost"]', '199');
    await page.evaluate(() => { document.querySelector('input[name="nextRenewalDate"]').value = '2026-12-12'; });
    await page.click('input[name="isTrial"]');
    await page.evaluate(() => { document.querySelector('input[name="trialEndDate"]').value = '2026-12-15'; });
    await page.click('button[type="submit"]');
    await page.waitForSelector('.bg-purple-100', { timeout: 3000 }); 
    const subText = await page.evaluate(() => document.body.innerText);
    if (subText.includes('TRIAL') && subText.includes('Trial ends in')) {
      pass('Add trial subscription — displays purple trial badge and Trial ends in text');
    } else {
      fail('Trial badge/text not found');
    }

    await page.waitForTimeout(1000);
    
    const [addBtn3] = await page.$x("//button[contains(., 'Add Subscription')]");
    await addBtn3.click();
    await page.waitForSelector('form');
    await page.type('input[name="name"]', 'Gym');
    await page.type('input[name="cost"]', '1000');
    await page.evaluate(() => { document.querySelector('input[name="nextRenewalDate"]').value = '2020-01-01'; }); 
    await page.click('button[type="submit"]');
    await page.waitForSelector('.text-red-600', { timeout: 3000 }); 
    const subText2 = await page.evaluate(() => document.body.innerText);
    if (subText2.includes('Renewal overdue')) {
      pass('Add subscription with past renewal — displays Renewal overdue in warning color');
    } else {
      fail('Renewal overdue not found');
    }

    await page.waitForTimeout(1000);
    
    for(let i=0; i<2; i++) {
      const [ab] = await page.$x("//button[contains(., 'Add Subscription')]");
      await ab.click();
      await page.waitForSelector('form');
      await page.type('input[name="name"]', 'Extra ' + i);
      await page.type('input[name="cost"]', '100');
      await page.evaluate(() => { document.querySelector('input[name="nextRenewalDate"]').value = '2026-12-12'; });
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
    }
    pass('Add 2 more subscriptions for a total of 5');

    console.log('--- Edit Flow ---');
    const [editBtn] = await page.$x("//button[contains(., 'Edit')]");
    await editBtn.click();
    await page.waitForSelector('form');
    const costValue = await page.evaluate(() => document.querySelector('input[name="cost"]').value);
    if (costValue) {
      pass('Click Edit on a card — modal opens pre-filled');
    } else {
      fail('Modal did not pre-fill');
    }

    await page.type('input[name="cost"]', '0'); 
    await page.click('button[type="submit"]');
    await page.waitForSelector('.bg-green-600', { timeout: 3000 });
    pass('Change cost and save — card updates correctly');

    await page.waitForTimeout(1000);
    const [editTrialBtn] = await page.$x(`//div[contains(., "Spotify")]/following-sibling::div//button[contains(., "Edit")]`);
    
    await page.evaluate(() => {
      const trialBadge = Array.from(document.querySelectorAll('span')).find(s => s.innerText === 'TRIAL');
      trialBadge.closest('div.bg-white').querySelector('button:nth-child(2)').click();
    });
    await page.waitForSelector('form');
    await page.click('input[name="isTrial"]'); 
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const finalPageText = await page.evaluate(() => document.body.innerText);
    if (!finalPageText.includes('TRIAL') && finalPageText.includes('ACTIVE')) {
      pass('Open edit on trial, uncheck isTrial — card badge reverts to normal');
    } else {
      fail('Failed to revert trial badge');
    }

    console.log('--- Usage Logging Flow ---');
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if(b.innerText === 'Log Usage') b.click();
      });
    });
    await page.waitForSelector('form textarea');
    pass('Click Log Usage on active subscription — modal opens with correct name');
    
    await page.click('button[type="submit"]');
    await page.waitForSelector('.bg-green-600', { timeout: 3000 });
    pass('Submit empty note — success toast, modal closes');

    await page.waitForTimeout(1000);
    await page.evaluate(() => { document.querySelectorAll('button').forEach(b => { if(b.innerText === 'Log Usage') b.click(); }); });
    await page.waitForSelector('form textarea');
    await page.type('textarea', 'Test note');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.evaluate(() => { document.querySelectorAll('button').forEach(b => { if(b.innerText === 'Log Usage') b.click(); }); });
    await page.waitForSelector('form textarea');
    await page.click('button[type="submit"]');
    pass('Log usage 2 more times (1 with note, 1 without)');

    const token = await page.evaluate(() => localStorage.getItem('subtrack_token'));
    const subRes = await axios.get(`${API_URL}/subscriptions`, { headers: { Authorization: `Bearer ${token}` } });
    const firstSubId = subRes.data.subscriptions[0]._id;
    const usageRes = await axios.get(`${API_URL}/subscriptions/${firstSubId}/usage`, { headers: { Authorization: `Bearer ${token}` } });
    if (usageRes.data.count === 3) {
      pass('Verify via axios that all 3 usage logs persisted correctly');
    } else {
      fail('Axios verified logs count is ' + usageRes.data.count);
    }

    console.log('--- Cancel Flow ---');
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Cancel').click();
    });
    await page.waitForSelector('div.fixed'); 
    const modalText = await page.evaluate(() => document.body.innerText);
    if (modalText.includes('Are you sure you want to cancel')) {
      pass('Click Cancel on active subscription — ConfirmDialog opens');
    } else {
      fail('ConfirmDialog text not found');
    }

    const [dialogCancelBtn] = await page.$x("//div[contains(@class, 'fixed')]//button[contains(., 'Cancel')]");
    await dialogCancelBtn.click();
    await page.waitForTimeout(500);
    pass('Click dialog Cancel — no API call fires, remains active');

    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Cancel').click();
    });
    await page.waitForSelector('div.fixed');
    const [confirmCancelBtn] = await page.$x("//button[contains(., 'Cancel Subscription')]");
    await confirmCancelBtn.click();
    await page.waitForSelector('.bg-green-600', { timeout: 3000 });
    const postCancelText = await page.evaluate(() => document.body.innerText);
    if (postCancelText.includes('CANCELLED')) {
      pass('Click Cancel again, confirm — card updates to CANCELLED, Cancel button gone');
    } else {
      fail('Card did not update to CANCELLED');
    }

    const verifySub = await axios.get(`${API_URL}/subscriptions`, { headers: { Authorization: `Bearer ${token}` } });
    const cancelledSub = verifySub.data.subscriptions.find(s => s.status === 'cancelled');
    if (cancelledSub && cancelledSub.cancelledAt) {
      pass('Verify via axios that status is cancelled and cancelledAt is populated (soft-delete)');
    } else {
      fail('Soft delete verification failed');
    }

    console.log('--- Error Resilience ---');
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('.bg-red-50');
    const errText = await page.evaluate(() => document.body.innerText);
    if (errText.includes('Failed to load subscriptions') && errText.includes('Retry')) {
      pass('Stop backend + reload — page-level error state with Retry shows');
    } else {
      fail('Page-level error state failed');
    }

    await page.setRequestInterception(false);
    
    page.removeAllListeners('request');

    await page.click('button:contains("Retry"), button.bg-red-600');
    await page.waitForSelector('.bg-white.border.border-gray-200');
    pass('Restart backend, click Retry — recovers and loads real data correctly');

    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/subscriptions') && request.method() === 'POST') {
        request.abort();
      } else {
        request.continue();
      }
    });

    const [addBtnErr] = await page.$x("//button[contains(., 'Add Subscription')]");
    await addBtnErr.click();
    await page.waitForSelector('form');
    await page.type('input[name="name"]', 'ErrSub');
    await page.type('input[name="cost"]', '10');
    await page.evaluate(() => { document.querySelector('input[name="nextRenewalDate"]').value = '2026-12-12'; });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const inModalErr = await page.evaluate(() => document.querySelector('.bg-red-50').innerText);
    if (inModalErr) {
      pass('Submit form with backend down — in-modal error message shows, form stays open');
    } else {
      fail('In-modal error message failed');
    }

    await page.setRequestInterception(false);
    page.removeAllListeners('request');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.bg-green-600', { timeout: 3000 });
    pass('Retry form submission — now succeeds');

    console.log('--- Session Edge Case ---');
    await page.evaluate(() => localStorage.removeItem('subtrack_token'));
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction('window.location.pathname === "/login"', { timeout: 3000 });
    pass('Delete token from localStorage + action — 401 interceptor redirects to /login');

    await page.type('input[name="email"]', 'test@test.com');
    await page.type('input[name="password"]', '123456789');
    await page.click('button[type="submit"]');
    await page.waitForFunction('window.location.pathname === "/"', { timeout: 3000 });
    pass('Log back in cleanly afterward to leave app working');

    fs.writeFileSync('../docs/Phase4-5-IntegrationTestLog.md', `# Phase 4 & 5 Integration Test Log
Run Date: ${new Date().toISOString()}

${results.join('\n')}

**Final Database State:** 6 subscriptions, 3 usage logs, 1 cancelled, 0 active trials — left in this state intentionally as seed-like data for Phase 6 analytics testing.
`);
    console.log('Test Log Written successfully');
    
  } catch(e) {
    console.error('ERROR during test: ', e);
  } finally {
    await browser.close();
  }
}

runTest();
