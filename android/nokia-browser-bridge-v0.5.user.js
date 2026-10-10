// ==UserScript==
// @name         Moksha Nokia Browser Bridge - Read Only
// @namespace    https://mokshagoa.com/automation
// @version      0.5.0
// @description  Paired Firefox worker for Selenium tests and human-assisted Instagram/VK signup navigation (no passwords, OTP or account submission).
// @match        https://www.selenium.dev/selenium/web/*
// @match        https://selenium.dev/selenium/web/*
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @match        https://vk.com/*
// @match        https://m.vk.com/*
// @downloadURL  https://raw.githubusercontent.com/karanzing1992/mokshasitemap/main/android/nokia-browser-bridge-v0.5.user.js
// @updateURL    https://raw.githubusercontent.com/karanzing1992/mokshasitemap/main/android/nokia-browser-bridge-v0.5.user.js
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      saczglesalubroyaucqe.supabase.co
// ==/UserScript==

(() => {
  'use strict';
  if (window.top !== window.self || document.getElementById('moksha-nokia-bridge')) return;
  const ENDPOINT = 'https://saczglesalubroyaucqe.supabase.co/functions/v1/nokia-browser-bridge';
  const DEVICE = 'nokia-c01plus-firefox';
  const KEY = 'moksha_nokia_bridge_token_v1';
  const ARMED_KEY = 'moksha_nokia_bridge_armed_v1';
  const ALLOWED_URL = 'https://www.selenium.dev/selenium/web/web-form.html';
  const CONFIRM_URL = 'https://www.selenium.dev/selenium/web/submitted-form.html';
  const PENDING_KEY = 'moksha_nokia_browser_submit_pending_v03';
  const NAV_PENDING_KEY = 'moksha_nokia_browser_nav_pending_v04';
  const SOCIAL_NAV_KEY = 'moksha_nokia_social_nav_pending_v05';
  const SOCIAL_HOSTS = new Set(['www.instagram.com','instagram.com','vk.com','m.vk.com']);
  const SOCIAL_URLS = {
    instagram: 'https://www.instagram.com/accounts/emailsignup/',
    vk: 'https://vk.com/join'
  };
  let workerToken = '';
  let armed = false;
  let scriptError = '';
  try {
    workerToken = typeof GM_getValue === 'function' ? GM_getValue(KEY, '') : '';
    armed = typeof GM_getValue === 'function' ? Boolean(GM_getValue(ARMED_KEY, false)) : false;
    if (typeof GM_xmlhttpRequest !== 'function' || typeof GM_setValue !== 'function' || typeof GM_getValue !== 'function') {
      scriptError = 'Userscript permissions unavailable. Open Violentmonkey and check site access.';
    }
  } catch (e) {
    scriptError = 'Script permission error: ' + String(e.message || e);
  }
  let busy = false;
  let timer = null;
  let succeeded = 0;
  let failed = 0;
  let lastJob = '—';

  const panel = document.createElement('aside');
  panel.id = 'moksha-nokia-bridge';
  panel.setAttribute('aria-label', 'Nokia browser bridge');
  panel.style.cssText = [
    'position:fixed','top:8px','left:8px','right:auto','bottom:auto','z-index:2147483647',
    'box-sizing:border-box','width:min(310px,calc(100vw - 16px))','max-height:70vh','overflow:auto',
    'background:#102623','color:white','border:1px solid #4f9787',
    'border-radius:12px','padding:12px','box-shadow:0 4px 18px #0006',
    'font:13px/1.45 system-ui,sans-serif','text-align:left'
  ].join(';');
  panel.innerHTML = `
    <div style="font-weight:700;font-size:15px">Nokia · Browser Bridge v0.5</div>
    <div id="mnb-state" style="margin:6px 0;color:#b8d3cb">Initializing...</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button type="button" id="mnb-pair">Pair</button>
      <button type="button" id="mnb-ping">Ping</button>
      <button type="button" id="mnb-toggle">Start</button>
    </div>
    <div id="mnb-stats" style="margin-top:7px;color:#b8d3cb"></div>
    <div id="mnb-log" style="max-height:92px;overflow:auto;margin-top:6px;font-size:11px;white-space:pre-wrap"></div>
  `;
  (document.body || document.documentElement).appendChild(panel);
  for (const el of panel.querySelectorAll('button')) {
    el.style.cssText = 'background:#d0ecdc;border:0;border-radius:7px;padding:8px 10px;color:#102623;font-weight:650;cursor:pointer';
  }
  const byId = id => panel.querySelector('#' + id);
  const state = byId('mnb-state');
  const stats = byId('mnb-stats');
  const logbox = byId('mnb-log');

  function log(message) {
    const date = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.textContent = `${date} ${message}`;
    logbox.prepend(line);
    while (logbox.children.length > 8) logbox.lastChild.remove();
  }
  function render() {
    const connected = Boolean(workerToken);
    state.textContent = scriptError || (connected ? (armed ? 'Paired · Listening for jobs' : 'Paired · Paused') : 'Not paired · No account automation');
    byId('mnb-toggle').textContent = armed ? 'Stop' : 'Start';
    byId('mnb-toggle').disabled = !connected;
    byId('mnb-ping').disabled = !connected || Boolean(scriptError);
    byId('mnb-pair').disabled = Boolean(scriptError);
    stats.textContent = `Success ${succeeded} · Failed ${failed} · Last ${lastJob}`;
  }
  function api(body, useAuth = true) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'POST', url: ENDPOINT, timeout: 20000,
        headers: {
          'content-type': 'application/json',
          ...(useAuth && workerToken ? {'x-nokia-worker': workerToken} : {})
        },
        data: JSON.stringify(body),
        onload: r => {
          let json;
          try { json = JSON.parse(r.responseText); }
          catch { return reject(new Error('Non-JSON bridge response')); }
          if (r.status < 200 || r.status >= 300 || !json.ok) {
            return reject(new Error(json.error || `HTTP ${r.status}`));
          }
          resolve(json);
        },
        ontimeout: () => reject(new Error('Bridge timeout')),
        onerror: () => reject(new Error('Network request failed'))
      });
    });
  }
  function snapshot() {
    if (![ALLOWED_URL, CONFIRM_URL].includes(location.origin + location.pathname)) {
      throw new Error('Unsupported page; Selenium demo only');
    }
    const controls = Array.from(document.querySelectorAll('button,input,textarea,select,a[href]'))
      .filter(el => !panel.contains(el))
      .slice(0, 45)
      .map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        name: (el.getAttribute('aria-label') || el.getAttribute('name') || el.getAttribute('id') || el.textContent || '').trim().slice(0,90),
        // Never transmit input values, passwords, login tokens or cookies.
        visible: Boolean(el.getClientRects().length)
      }));
    let body = (document.body.innerText || '');
    const panelText = panel.innerText || '';
    if (panelText) body = body.replace(panelText, '');
    return {url: location.origin + location.pathname, title: document.title,
      visible_text: body.replace(/\s+/g,' ').trim().slice(0,4000), controls,
      observed_at: new Date().toISOString(), browser: 'Firefox Android userscript'};
  }
  function socialSnapshot() {
    if (!SOCIAL_HOSTS.has(location.hostname)) throw new Error('Social host not approved');
    // Never transmit typed values, page body, cookies, account identifiers, password or OTP fields.
    const controls = Array.from(document.querySelectorAll('button, a[href], input, select'))
      .filter(el => !panel.contains(el) && Boolean(el.getClientRects().length))
      .slice(0, 35)
      .map(el => {
        const type = String(el.getAttribute('type') || '').toLowerCase();
        const secure = ['password','email','tel','number','hidden'].includes(type);
        return {
          tag: el.tagName.toLowerCase(), type,
          label: secure ? '[protected input]' :
            String(el.getAttribute('aria-label') || el.getAttribute('placeholder') ||
              el.getAttribute('name') || (el.matches('button') ? el.textContent : '') || '').trim().slice(0,75)
        };
      });
    return {
      verified: true, host: location.hostname, path: location.pathname,
      title: String(document.title || '').slice(0,100),
      controls, observed_at: new Date().toISOString(),
      notice: 'No form input values or private page content collected'
    };
  }
  async function finishPendingSocialNavigation() {
    const pending = GM_getValue(SOCIAL_NAV_KEY, null);
    if (!pending) return false;
    if (Date.now() - Number(pending.at || 0) > 85000) {
      GM_setValue(SOCIAL_NAV_KEY,null);
      log('Social navigation timed out');
      return false;
    }
    const targetHost = pending.site === 'instagram' ? 'www.instagram.com' : 'vk.com';
    if (location.hostname !== targetHost) return true;
    const result = {
      navigated: true, target: pending.site,
      host: location.hostname, path: location.pathname,
      signup_page_visible: pending.site === 'instagram'
        ? location.pathname.startsWith('/accounts/emailsignup')
        : location.pathname.startsWith('/join'),
      at: new Date().toISOString(),
      note: 'Navigation only. No signup fields submitted or account created.'
    };
    await api({action:'complete', job_id:pending.id,lease_token:pending.lease,
      status:'completed',result});
    GM_setValue(SOCIAL_NAV_KEY,null);
    succeeded++;
    lastJob = '#' + pending.id + ': social navigation';
    log(lastJob);render();
    return true;
  }
  function formTextField() {
    if (location.origin + location.pathname !== ALLOWED_URL) throw new Error('Open Selenium web-form page');
    const input = document.querySelector('input[name="my-text"]');
    if (!input || input.type !== 'text' || input.disabled || input.readOnly) throw new Error('Selenium input not available');
    return input;
  }
  function setNativeValue(el, text) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (setter) setter.call(el, text); else el.value = text;
    el.dispatchEvent(new InputEvent('input', {bubbles:true, data:text, inputType:'insertText'}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  }
  function inspectTestForm() {
    const el = formTextField();
    const submit = el.form?.querySelector('button[type=submit],button:not([type]),input[type=submit]');
    if (!submit || !submit.getClientRects().length) throw new Error('Visible submit control not found');
    if (!el.getClientRects().length) throw new Error('Text input is not visible');
    return {verified:true,url:location.origin + location.pathname,title:document.title,
      text_field:'input[name=my-text]',submit_control:submit.tagName.toLowerCase(),
      at:new Date().toISOString()};
  }
  async function finishPendingNavigation() {
    const pending = GM_getValue(NAV_PENDING_KEY, null);
    if (!pending) return false;
    const age = Date.now() - Number(pending.at || 0);
    if (age > 85000) {
      GM_setValue(NAV_PENDING_KEY,null);
      log('Navigation verification timed out; server lease may retry');
      return false;
    }
    if (location.origin + location.pathname !== ALLOWED_URL) return true;
    let result;
    try { result = inspectTestForm(); }
    catch { return true; }
    await api({action:'complete',job_id:pending.id,lease_token:pending.lease,
      status:'completed',result:{...result,checkpoint:'navigation verified after document load'}});
    GM_setValue(NAV_PENDING_KEY,null);
    succeeded++;
    lastJob = `#${pending.id}: navigated`;
    log(lastJob);render();
    return true;
  }
  async function finishPending() {
    const pending = GM_getValue(PENDING_KEY, null);
    if (!pending) return false;
    const age = Date.now() - Number(pending.at || 0);
    if (age > 85000) {
      GM_setValue(PENDING_KEY, null);
      log('Submission confirmation timed out; job may retry');
      return false;
    }
    if (location.origin + location.pathname !== CONFIRM_URL) return true;
    if (!/Received!/.test(document.body?.innerText || '')) {
      log('Waiting for Selenium confirmation');
      return true;
    }
    const result = {verified:true, received:true, title:document.title, url:location.origin + location.pathname,
      checkpoint:'form submitted; confirmation text observed', at:new Date().toISOString()};
    await api({action:'complete',job_id:pending.id,lease_token:pending.lease,status:'completed',result});
    GM_setValue(PENDING_KEY, null);
    succeeded++;
    lastJob = `#${pending.id}: completed`; log(lastJob);render();
    return true;
  }
  async function execute(job) {
    const isSocialNavigation = job.action === 'open_instagram_signup' || job.action === 'open_vk_signup';
    if (isSocialNavigation) {
      if (job.allowed_host !== 'www.selenium.dev' || location.hostname !== 'www.selenium.dev')
        throw new Error('Signup navigation must start from the approved Selenium page');
      const site = job.action === 'open_instagram_signup' ? 'instagram' : 'vk';
      GM_setValue(SOCIAL_NAV_KEY,{id:job.id,lease:job.lease_token,at:Date.now(),site});
      try { location.assign(SOCIAL_URLS[site]); }
      catch(e) {GM_setValue(SOCIAL_NAV_KEY,null);throw e;}
      return {__deferred:true,navigation:true};
    }
    if (job.action === 'social_snapshot') {
      if (!SOCIAL_HOSTS.has(job.allowed_host) || location.hostname !== job.allowed_host)
        throw new Error('Wrong or unapproved social host');
      return socialSnapshot();
    }
    if (job.allowed_host !== 'www.selenium.dev') throw new Error('Host not approved');
    if (location.hostname !== job.allowed_host) throw new Error('Wrong browser host');
    switch (job.action) {
      case 'ping': return {pong:true, page: location.origin + location.pathname, at: new Date().toISOString()};
      case 'snapshot': return snapshot();
      case 'verify_form': return inspectTestForm();
      case 'navigate_form': {
        const here = location.origin + location.pathname;
        if (![ALLOWED_URL, CONFIRM_URL].includes(here)) throw new Error('Navigation source is not approved');
        GM_setValue(NAV_PENDING_KEY,{id:job.id,lease:job.lease_token,at:Date.now()});
        try { location.assign(ALLOWED_URL); }
        catch(e) {GM_setValue(NAV_PENDING_KEY,null);throw e;}
        return {__deferred:true,navigation:true};
      }

      case 'fill_test': {
        const el = formTextField();
        const text = `Nokia remote test ${job.id}`;
        setNativeValue(el, text);
        const actual = el.value;
        if (actual !== text) throw new Error('Form value failed verification');
        return {verified:true, element:'input[name=my-text]', value:actual,
          page:location.origin + location.pathname, at:new Date().toISOString()};
      }
      case 'submit_test': {
        const el = formTextField();
        const text = `Nokia submit test ${job.id}`;
        setNativeValue(el, text);
        if (el.value !== text) throw new Error('Form fill verification failed');
        const form = el.form;
        if (!form) throw new Error('Selenium form not detected');
        GM_setValue(PENDING_KEY, {id:job.id,lease:job.lease_token,at:Date.now()});
        try {
          if (typeof form.requestSubmit === 'function') form.requestSubmit();
          else {
            const submit = form.querySelector('button[type=submit],button:not([type]),input[type=submit]');
            if (!submit) throw new Error('Submit control missing');
            submit.click();
          }
        } catch(e) {
          GM_setValue(PENDING_KEY,null);
          throw e;
        }
        return {__deferred:true};
      }
      default: throw new Error('Unsupported or unapproved test command');
    }
  }
  async function cycle() {
    if (!armed || !workerToken || busy || document.visibilityState === 'hidden') return;
    busy = true;
    try {
      if (await finishPendingSocialNavigation()) return;
      if (await finishPendingNavigation()) return;
      if (await finishPending()) return;
      const poll = await api({action:'poll'});
      const job = poll.job;
      if (!job) return;
      log(`Received ${job.action} #${job.id}`);
      let status = 'completed', result = null, error = null;
      try { result = await execute(job); }
      catch (e) { status = 'failed'; error = String(e.message || e); }
      if (result?.__deferred && status === 'completed') {
        lastJob=`#${job.id}: ${result.navigation ? 'navigating' : 'submitting'}`; log(result.navigation ? 'Navigating to Selenium form' : 'Waiting for confirmation after navigation'); return;
      }
      await api({action:'complete',job_id:job.id,lease_token:job.lease_token,status,result,error});
      if (status === 'completed') succeeded++; else failed++;
      lastJob = `#${job.id}: ${status}`;
      log(lastJob);
    } catch (e) {
      failed++;
      log(String(e.message || e));
      if (/Not paired|Unauthorized/.test(String(e.message || e))) {
        armed = false;
        GM_setValue(ARMED_KEY,false);
      }
    } finally { busy = false; render(); }
  }
  function start() {
    if (timer) clearInterval(timer);
    timer = setInterval(cycle, 6000);
    cycle();
  }
  byId('mnb-pair').addEventListener('click', async () => {
    const code = window.prompt('Paste the 40-character Nokia pairing code:');
    if (!code) return;
    try {
      const result = await api({action:'pair',code:code.trim(),worker_id:DEVICE},false);
      workerToken = result.worker_token;
      GM_setValue(KEY,workerToken);
      armed = false;
      GM_setValue(ARMED_KEY,false);
      log('Paired with private Nokia job queue');
    } catch(e) {log('Pair error: ' + (e.message||e));}
    render();
  });
  byId('mnb-ping').addEventListener('click', async () => {
    try {
      const result = await api({action:'ping'});
      log('Server online: ' + result.server_time);
    } catch(e) {log('Ping error: ' + (e.message||e));}
  });
  byId('mnb-toggle').addEventListener('click', () => {
    armed = !armed;
    GM_setValue(ARMED_KEY,armed);
    render();
    if(armed)cycle();
  });
  render();
  start();
  log(scriptError || ('Loaded on ' + location.hostname + location.pathname + '. Paired storage preserved. Social actions are navigation/inspection only.'));
})();