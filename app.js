(() => {
  'use strict';
  const C = window.ShootCore, $ = id => document.getElementById(id), KEY = 'shoot-companion-v1';
  let state = C.fresh(), ready = false, overlay = null, blocked = false, revision = 0, savedRevision = 0;
  let queue = Promise.resolve(), lastSide = -Infinity;
  // Select storage once. A failing native store never silently becomes browser storage.
  const nativeStore = window.creationStorage?.plain;
  const storageName = nativeStore ? 'R1' : 'Browser';
  const store = nativeStore || { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) };
  const text = (id, value) => { $(id).textContent = value; };
  const encode = value => btoa(JSON.stringify(value)); // State consists of ASCII IDs, not arbitrary user text.
  const deadline = promise => {
    let timer;
    return Promise.race([Promise.resolve(promise), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Storage timed out')), 4000); })]).finally(() => clearTimeout(timer));
  };
  function status(message, error = false) { text('save-state', message); $('save-state').dataset.error = String(error); }
  function render() {
    const c = C.current(state), shots = state.mode === 'shots';
    text('template-name', c.template.name);
    text('progress', c.session.done.length === c.template.shots.length ? 'All shots done' : c.session.done.length + '/' + c.template.shots.length + ' done');
    text('category', c.item[1]); text('position', (c.index + 1) + ' / ' + c.list.length);
    text('title', c.item[2]); text('detail', shots ? c.item[3] : '');
    $('detail').hidden = !shots; $('deck').classList.toggle('is-prompt', !shots);
    text('item-status', c.complete ? (shots ? 'Captured' : 'Asked') : (shots ? 'To capture' : 'Not asked'));
    $('deck').classList.toggle('is-complete', c.complete);
    text('mark', c.complete ? 'Undo' : (shots ? 'Mark done' : 'Asked'));
    $('mark').setAttribute('aria-pressed', String(c.complete));
    $('tab-shots').setAttribute('aria-selected', String(shots)); $('tab-prompts').setAttribute('aria-selected', String(!shots));
    $('deck').setAttribute('aria-labelledby', shots ? 'tab-shots' : 'tab-prompts');
    $('prev').disabled = !ready || c.index === 0; $('next').disabled = !ready || c.index === c.list.length - 1;
    $('mark').disabled = $('menu-open').disabled = $('tab-shots').disabled = $('tab-prompts').disabled = !ready;
    $('app').setAttribute('aria-busy', String(!ready));
    $('deck').scrollTop = 0;
    document.querySelectorAll('[data-template]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.template === state.template)));
    text('input-hint', window.closeWebView || nativeStore ? 'Wheel / click' : 'Arrows / Enter');
  }
  function save() {
    revision++; const thisRevision = revision, snapshot = encode(state);
    if (blocked) { status('Not saved: Menu > Save again', true); return queue; }
    status('Saving...');
    queue = queue.then(async () => {
      if (blocked) return;
      try {
        await deadline(store.setItem(KEY, snapshot)); savedRevision = thisRevision;
        if (savedRevision === revision) status(storageName + ' saved');
      } catch (e) { blocked = true; status('Save failed: Menu > Save again', true); text('menu-status', e.message + '. Current progress is still in memory.'); }
    });
    return queue;
  }
  function change(fn) { if (!ready || overlay) return; fn(); render(); save(); }
  function setMode(mode) { change(() => { state.mode = mode; }); }
  function move(delta) { change(() => C.move(state, delta)); }
  function mark() { change(() => C.toggle(state)); }
  function openOverlay(name) {
    if (!ready) return;
    overlay = name;
    for (const id of ['menu', 'confirm', 'help']) $(id).hidden = id !== name;
    // Prevent keyboard and screen-reader focus from reaching controls behind a modal.
    for (const element of $('app').children) if (element.tagName !== 'SECTION') element.inert = !!name;
    if (name) $(name).querySelector('button')?.focus(); else $('menu-open').focus();
  }
  C.templates.forEach(template => {
    const button = document.createElement('button'); button.textContent = template.name; button.dataset.template = template.id;
    button.addEventListener('click', () => { state.template = template.id; openOverlay(null); render(); save(); });
    $('templates').appendChild(button);
  });
  $('tab-shots').addEventListener('click', () => setMode('shots'));
  $('tab-prompts').addEventListener('click', () => setMode('prompts'));
  $('prev').addEventListener('click', () => move(-1)); $('next').addEventListener('click', () => move(1)); $('mark').addEventListener('click', mark);
  $('menu-open').addEventListener('click', () => openOverlay('menu')); $('menu-close').addEventListener('click', () => openOverlay(null));
  $('new-session').addEventListener('click', () => openOverlay('confirm')); $('reset-cancel').addEventListener('click', () => openOverlay('menu'));
  $('reset-confirm').addEventListener('click', () => { C.reset(state); openOverlay(null); render(); save(); });
  $('help-open').addEventListener('click', () => openOverlay('help')); $('help-close').addEventListener('click', () => openOverlay('menu'));
  $('retry-save').addEventListener('click', () => { blocked = false; text('menu-status', 'Saving the current in-memory session.'); save(); });
  $('exit').addEventListener('click', async () => {
    $('exit').disabled = true;
    await queue;
    if (blocked || savedRevision !== revision) { text('menu-status', 'Not saved. Use Save again before exiting.'); $('exit').disabled = false; return; }
    try { if (window.closeWebView) window.closeWebView.postMessage(''); else text('menu-status', 'Saved. You can close this browser tab.'); }
    catch (e) { text('menu-status', 'Could not exit: ' + e.message); }
    $('exit').disabled = false;
  });
  window.addEventListener('scrollUp', () => move(-1)); window.addEventListener('scrollDown', () => move(1));
  window.addEventListener('sideClick', () => {
    if (!ready || overlay) return;
    const now = performance.now();
    if (now - lastSide < 250) return; // Native double-click is two clicks about 50 ms apart.
    lastSide = now; mark();
  });
  window.addEventListener('keydown', event => {
    if (overlay) {
      if (event.key === 'Escape') { event.preventDefault(); openOverlay(overlay === 'menu' ? null : 'menu'); }
      else if (event.key === 'Tab') {
        const buttons = [...$(overlay).querySelectorAll('button:not(:disabled)')], first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); move(event.key === 'ArrowUp' ? -1 : 1); }
    else if (['Enter', ' '].includes(event.key) && !['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'].includes(document.activeElement?.tagName)) { event.preventDefault(); mark(); }
  });
  // Each action queues its save immediately; page exit is not used as the sole save trigger.
  async function init() {
    status('Loading...'); render();
    try {
      const raw = await deadline(store.getItem(KEY));
      if (raw !== null && raw !== undefined) state = C.validate(JSON.parse(atob(raw)));
      status(raw ? storageName + ' restored' : storageName + ': new session');
    } catch (e) { blocked = true; status('Load failed: Menu > Save again', true); text('menu-status', e.message + '. Save again replaces stored data with the current session.'); }
    finally { ready = true; render(); }
  }
  init();
})();
