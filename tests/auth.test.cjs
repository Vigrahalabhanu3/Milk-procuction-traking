/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads TypeScript source without adding a test framework. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

// Execute the actual TS modules with controlled HTTP and React hook state.
// No backend accounts are created and no real credentials are used.
function harness(storage = new Map()) {
  let effects = [];
  const timers = [];
  const notifications = [];
  const downloads = [];
  const events = new Map();
  const sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const calls = [], redirects = [], slots = [], cache = new Map();
  let cursor = 0;
  let activeSlots = slots;
  let contextValue;
  let searchQuery = "";
  const formSlots = new Map();
  let reply = () => new Response('{}', { status: 500 });
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in activeSlots)) activeSlots[index] = typeof initial === 'function' ? initial() : initial;
      const ownSlots = activeSlots;
      return [ownSlots[index], value => { ownSlots[index] = typeof value === 'function' ? value(ownSlots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in activeSlots)) activeSlots[index] = { current: initial };
      return activeSlots[index];
    },
    useId() {
      const index = cursor++;
      if (!(index in activeSlots)) activeSlots[index] = `test-id-${index}`;
      return activeSlots[index];
    },
    useContext() { return contextValue; },
    useEffect(effect) { effects.push(effect); },
    useCallback(fn) { return fn; },
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    }}).outputText;
    const localRequire = name => {
      if (name === 'react') return hooks;
      if (name === '@/lib/api/client') return {...load(path.resolve('lib/api/client.ts')), saveReportDownload: file => downloads.push(file)};
      if (name === '@/components/ui/toast') return {useToast: () => ({success: message => notifications.push(message)})};
      if (name === 'react-dom') return {...require('react-dom'), createPortal: children => React.createElement(React.Fragment, null, children)};
      if (name === 'next/navigation') return { useRouter: () => ({ replace: url => redirects.push(url), push: url => redirects.push(url) }), useSearchParams: () => new URLSearchParams(searchQuery) };
      if (name.startsWith('@/')) {
        const base = path.resolve(name.slice(2));
        return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
      }
      if (name.startsWith('.')) {
        const base = path.resolve(path.dirname(file), name);
        return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
      }
      return require(name);
    };
    vm.runInNewContext(code, { exports, require: localRequire, process: {env: {NEXT_PUBLIC_API_BASE_URL: 'http://test-api.local/'}},
      fetch: async (url, options) => { calls.push({url, ...options}); return reply(); },
      Response, Date, console, URL, URLSearchParams, queueMicrotask, Event, document: {body: {}}, window: { sessionStorage,
        addEventListener: (name, callback) => { if (!events.has(name)) events.set(name, new Set()); events.get(name).add(callback); },
        removeEventListener: (name, callback) => events.get(name)?.delete(callback),
        dispatchEvent: event => { for (const callback of events.get(event.type) ?? []) callback(event); return true; }, setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {} },
      localStorage: { setItem() { throw Error('Auth must not persist browser data'); }, getItem() { throw Error('Auth must not read legacy data'); } },
    }, { filename: file });
    return exports;
  }
  const client = load(path.resolve('lib/api/client.ts'));
  const auth = load(path.resolve('lib/auth/auth.service.ts'));
  const context = load(path.resolve('lib/auth/auth-context.tsx'));
  return { auth, client, calls, redirects, storage, notifications, downloads,
    setSearch(query) { searchQuery = query; },
    module(file) { return load(path.resolve(file)); },
    startEffectFromEnd(offset) { return effects.at(-offset)(); },
    startLatestEffect() { return effects.at(-1)(); },
    runTimer() { return timers.shift()(); },
    async hydrate() { this.render(); effects[0](); await Promise.resolve(); return this.render(); },
    render() { effects = []; activeSlots = slots; cursor = 0; contextValue = context.AuthProvider({children: null}).props.value; return contextValue; },
    form(file, exported, props = {}) {
      if (!formSlots.has(file)) formSlots.set(file, []);
      activeSlots = formSlots.get(file); cursor = 0;
      return load(path.resolve(file))[exported](props);
    },
    respond(status, data) { reply = () => new Response(JSON.stringify(data), {status}); },
    respondRaw(status, body, headers = {}) { reply = () => new Response(body, {status, headers}); },
    offline() { reply = () => { throw Error('offline'); }; },
    defer() { let resolve; const pending = new Promise(r => {resolve = r;}); reply = () => pending; return resolve; },
  };
}
const admin = { id: 1, name: 'Administrator', email: 'owner@example.test', farmer_id: null, role: 'admin' };
const farmer = { id: 2, name: 'Farmer', email: null, farmer_id: 'F001', role: 'farmer' };
const credentials = { name: 'New Farmer', farmer_id: 'F-new_1', password: 'test-only', password_confirm: 'test-only' };

for (const [role, identifier, user, key] of [['farmer', 'F001', farmer, 'farmer_id'], ['admin', 'owner@example.test', admin, 'email']]) {
  test(`${role} login uses its exact endpoint/body without a bearer token`, async () => {
    const h = harness(); h.respond(200, {access: 'access-token', refresh: 'discarded-refresh', user});
    await h.render().login(identifier, 'test-only', role);
    assert.equal(h.calls[0].url, `http://test-api.local/api/auth/${role}/login/`);
    assert.deepEqual(JSON.parse(h.calls[0].body), {[key]: identifier, password: 'test-only'});
    assert.equal(h.calls[0].headers.Authorization, undefined);
    assert.equal(h.render().user.role, role);
    assert.equal(h.render().access, 'access-token');
    assert.equal(h.render().refresh, undefined);
  });
}

test('login rejects a successful response for the wrong role without adopting its session', async () => {
  const h = harness(); h.respond(200, {access: 'wrong-token', user: farmer});
  await assert.rejects(h.render().login('anything', 'test-only', 'admin'), e => e.status === 403);
  assert.equal(h.render().user, null);
});

test('admin registration sends its bearer token, keeps the admin session, and returns the created ID', async () => {
  const h = harness(); h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('anything', 'test-only', 'admin');
  h.respond(201, {message: 'Farmer account created.', user: {...farmer, farmer_id: credentials.farmer_id}});
  const result = await h.render().registerFarmer(credentials);
  const request = h.calls[1];
  assert.equal(request.url, 'http://test-api.local/api/auth/register/');
  assert.equal(request.headers.Authorization, 'Bearer admin-token');
  assert.equal(request.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(request.body), credentials);
  assert.equal(result.user.farmer_id, credentials.farmer_id);
  assert.equal(h.render().user.role, 'admin');
  assert.equal(h.render().access, 'admin-token');
});

test('farmer session cannot invoke admin registration', async () => {
  const h = harness(); h.respond(200, {access: 'farmer-token', user: farmer});
  await h.render().login('F001', 'test-only', 'farmer');
  await assert.rejects(h.render().registerFarmer(credentials), e => e.status === 403);
  assert.equal(h.calls.length, 1);
});

for (const user of [admin, farmer]) {
  test(`protected 401 clears ${user.role} state and returns to the appropriate login`, async () => {
    const h = harness(); h.respond(200, {access: 'token', user});
    await h.render().login('identifier', 'test-only', user.role);
    h.respond(401, {detail: 'expired'});
    await assert.rejects(h.render().protectedRequest('/api/auth/register/', {}), e => e.status === 401);
    assert.equal(h.render().user, null);
    assert.equal(h.render().access, null);
    assert.equal(h.render().sessionExpired, true);
    assert.equal(h.redirects.at(-1), user.role === 'admin' ? '/login?role=admin&reason=expired' : '/login?reason=expired');
  });
}

test('a stale login remains usable and failed login does not expire an existing session', async () => {
  const h = harness(); h.respond(200, {access: 'old-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin');
  h.respond(401, {detail: 'invalid'});
  await assert.rejects(h.render().login('F001', 'wrong', 'farmer'), e => e.status === 401);
  assert.equal(h.calls[1].headers.Authorization, undefined);
  assert.equal(h.render().access, 'old-token');
  assert.equal(h.redirects.length, 0);
});

test('an old protected 401 cannot invalidate a newer login', async () => {
  const h = harness(); h.respond(200, {access: 'old', user: admin});
  await h.render().login('identifier', 'test-only', 'admin');
  const resolveOld = h.defer();
  const oldRequest = h.render().protectedRequest('/api/auth/register/', {});
  h.respond(200, {access: 'new', user: admin});
  await h.render().login('identifier', 'test-only', 'admin');
  resolveOld(new Response('{}', {status: 401}));
  await assert.rejects(oldRequest, e => e.status === 401);
  assert.equal(h.render().access, 'new');
  assert.equal(h.redirects.length, 0);
});

test('400 field errors remain available to render under the correct fields', async () => {
  const h = harness(); h.respond(400, {farmer_id: ['Already exists.'], password_confirm: ['Passwords do not match.']});
  await assert.rejects(h.auth.login('F001', 'test-only', 'farmer'), e =>
    e.status === 400 && e.fields.farmer_id[0] === 'Already exists.' && e.fields.password_confirm[0] === 'Passwords do not match.');
});

for (const status of [403, 429]) {
  test(`${status} is surfaced without logging the admin out`, async () => {
    const h = harness(); h.respond(200, {access: 'admin-token', user: admin});
    await h.render().login('identifier', 'test-only', 'admin');
    h.respond(status, {});
    await assert.rejects(h.render().registerFarmer(credentials), e => e.status === status && e.message.startsWith(`${status}:`));
    assert.equal(h.render().user.role, 'admin');
  });
}

test('registration validates farmer ID bounds/characters and matching passwords', () => {
  const h = harness();
  for (const id of ['A', 'F001', 'F-1_2', 'a'.repeat(32)]) assert.equal(Object.keys(h.auth.validateFarmer({...credentials, farmer_id: id})).length, 0);
  for (const id of ['', 'a'.repeat(33), 'F 001', 'F.001', 'é']) assert.ok(h.auth.validateFarmer({...credentials, farmer_id: id}).farmer_id);
  assert.ok(h.auth.validateFarmer({...credentials, password_confirm: 'different'}).password_confirm);
});

test('network failures are surfaced safely', async () => {
  const h = harness(); h.offline();
  await assert.rejects(h.auth.login('F001', 'test-only', 'farmer'), e => e.status === 0 && /Unable to reach/.test(e.message));
});

function elements(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  const own = predicate(tree) ? [tree] : [];
  return own.concat(React.Children.toArray(tree.props?.children).flatMap(child => elements(child, predicate)));
}

test('registration form blocks duplicate submissions, clears passwords, and displays the created ID', async () => {
  const h = harness(); h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  const form = () => h.form('app/admin/register-farmer/page.tsx', 'default');
  let tree = form();
  for (const input of elements(tree, node => node.type === 'input')) {
    input.props.onChange({target: {value: input.props.name === "village" ? "  Test Village  " : credentials[input.props.name]}});
  }
  tree = form();
  const submit = elements(tree, node => node.type === 'form')[0].props.onSubmit;
  const resolve = h.defer();
  const first = submit({preventDefault() {}});
  const second = submit({preventDefault() {}});
  assert.equal(h.calls.length, 2); // Login plus exactly one registration.
  assert.equal(JSON.parse(h.calls[1].body).village, "Test Village");
  resolve(new Response(JSON.stringify({message: 'Farmer account created.', user: {...farmer, farmer_id: credentials.farmer_id}}), {status: 201}));
  await Promise.all([first, second]);
  tree = form();
  for (const input of elements(tree, node => node.type === 'input' && node.props.type === 'password')) assert.equal(input.props.value, '');
  const rendered = require('react-dom/server').renderToStaticMarkup(tree);
  assert.match(rendered, /Farmer account created/);
  assert.match(rendered, /F-new_1/);
  assert.equal(h.render().user.role, 'admin');
});

test('farmer login form prevents duplicates and redirects after a matching role response', async () => {
  const h = harness(); h.render();
  const form = () => h.form('components/auth/login-form.tsx', 'LoginForm', {role: 'farmer'});
  let tree = form();
  for (const input of elements(tree, node => node.type === 'input')) input.props.onChange({target: {value: input.props.name === 'password' ? 'test-only' : 'F001'}});
  tree = form();
  const submit = elements(tree, node => node.type === 'form')[0].props.onSubmit;
  const resolve = h.defer();
  const first = submit({preventDefault() {}});
  const second = submit({preventDefault() {}});
  assert.equal(h.calls.length, 1);
  resolve(new Response(JSON.stringify({access: 'token', user: farmer}), {status: 200}));
  await Promise.all([first, second]);
  assert.equal(h.redirects.at(-1), '/farmer/dashboard');
});

for (const user of [admin, farmer]) {
  test(`${user.role} session survives a page reload with its original expiry`, async () => {
    const storage = new Map();
    const first = harness(storage);
    first.respond(200, {access: 'session-token', refresh: 'not-stored', user});
    await first.render().login('identifier', 'test-only-secret', user.role);
    const saved = storage.get('dairyflow_auth_session_v1');
    assert.ok(saved);
    assert.ok(!saved.includes('test-only-secret'));
    assert.ok(!saved.includes('not-stored'));
    const second = harness(storage);
    assert.equal(second.render().isLoading, true);
    const restored = await second.hydrate();
    assert.equal(restored.isLoading, false);
    assert.equal(restored.access, 'session-token');
    assert.equal(restored.user.role, user.role);
    assert.equal(JSON.parse(storage.get('dairyflow_auth_session_v1')).expiresAt, JSON.parse(saved).expiresAt);
    assert.equal(second.redirects.length, 0);
  });
}

test('expired or malformed saved sessions are cleared during restoration', async () => {
  for (const saved of ['invalid-json', JSON.stringify({access: 'expired', user: admin, expiresAt: Date.now() - 1000}), JSON.stringify({access: 'invalid', user: {...admin, role: 'user'}, expiresAt: Date.now() + 10000})]) {
    const storage = new Map([['dairyflow_auth_session_v1', saved]]);
    const h = harness(storage);
    const restored = await h.hydrate();
    assert.equal(restored.user, null);
    assert.equal(restored.isLoading, false);
    assert.equal(storage.size, 0);
  }
});

for (const action of ['logout', '401']) {
  test(`${action} removes the saved session so refresh cannot restore it`, async () => {
    const storage = new Map();
    const h = harness(storage);
    h.respond(200, {access: 'token', user: admin});
    await h.render().login('identifier', 'test-only', 'admin');
    if (action === 'logout') h.render().logout();
    else {
      h.respond(401, {});
      await assert.rejects(h.render().registerFarmer(credentials));
    }
    assert.equal(storage.size, 0);
    assert.equal((await harness(storage).hydrate()).user, null);
  });
}

test('farmer directory uses authenticated GET and encodes combined filters', async () => {
  const h = harness(); h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  h.respond(200, {count: 0, next: null, previous: null, results: [], summary: {total: 4, active: 3, inactive: 1}});
  const query = {search: ' Srinu & F01 ', status: 'active', page: 2, pageSize: 20};
  const hook = () => h.form('lib/hooks/use-admin-farmers.ts', 'useAdminFarmers', query);
  assert.equal(hook().isLoading, true);
  h.startLatestEffect(); await h.runTimer();
  const request = h.calls.at(-1);
  assert.equal(request.method, 'GET');
  assert.equal(request.headers.Authorization, 'Bearer admin-token');
  assert.equal(request.body, undefined);
  const url = new URL(request.url);
  assert.equal(url.pathname, '/api/admin/farmers/');
  assert.equal(url.searchParams.get('search'), 'Srinu & F01');
  assert.equal(url.searchParams.get('status'), 'active');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('page_size'), '20');
  assert.equal(hook().data.summary.total, 4);
  assert.equal(hook().data.count, 0);
});

test('farmer directory renders server summary and matched count without invented milk data', async () => {
  const h = harness(); h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  const page = () => h.form('app/admin/farmers/page.tsx', 'default');
  page();
  h.respond(200, {count: 1, next: null, previous: null,
    results: [{id: 3, farmer_id: 'F01', name: 'V.Srinu', village: '', is_active: true, status: 'active', date_joined: '2026-10-29T12:09:19.189026Z'}],
    summary: {total: 31, active: 25, inactive: 6}});
  h.startLatestEffect(); await h.runTimer();
  const markup = require('react-dom/server').renderToStaticMarkup(page());
  assert.match(markup, /V.Srinu/);
  assert.match(markup, /F01/);
  assert.match(markup, /Village not provided/);
  assert.match(markup, /1 results/);
  assert.match(markup, />31</);
  assert.match(markup, />25</);
  assert.match(markup, />6</);
  assert.ok(!markup.includes('Earnings'));
  assert.ok(!markup.includes('Today&#x27;s Milk'));
});

test('late search responses cannot replace newer directory results', async () => {
  const h = harness(); h.respond(200, {access: 'token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  h.form('lib/hooks/use-admin-farmers.ts', 'useAdminFarmers', {search: 'old'});
  const cleanup = h.startLatestEffect();
  const resolveOld = h.defer();
  const pending = h.runTimer();
  cleanup();
  const query = {search: 'new'};
  const hook = () => h.form('lib/hooks/use-admin-farmers.ts', 'useAdminFarmers', query);
  hook(); h.startLatestEffect();
  h.respond(200, {count: 7, results: [], summary: {total: 10, active: 8, inactive: 2}, next: null, previous: null});
  await h.runTimer();
  resolveOld(new Response(JSON.stringify({count: 99}), {status: 200}));
  await pending;
  assert.equal(hook().data.count, 7);
});

test('farmer-role sessions never request the admin directory', async () => {
  const h = harness(); h.respond(200, {access: 'farmer-token', user: farmer});
  await h.render().login('F001', 'test-only', 'farmer'); h.render();
  h.form('lib/hooks/use-admin-farmers.ts', 'useAdminFarmers', {});
  h.startLatestEffect();
  assert.equal(h.calls.length, 1); // Only the farmer login; no admin request.
});

test('separate collection form uses live farmer options and shift selection', async () => {
  const h = harness(); h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  const page = () => h.form('app/admin/add-collection/page.tsx', 'default');
  page();
  h.respond(200, {count: 2, results: [{id: 4, farmer_id: 'F02', name: 'V.Bhanu', village: 'MSG'}, {id: 3, farmer_id: 'F01', name: 'V.Srinu', village: ''}]});
  h.startLatestEffect(); await h.runTimer();
  let tree = page();
  const farmerSelect = elements(tree, node => node.props?.id === 'collection-farmer')[0];
  assert.ok(farmerSelect.props.options.some(option => option.label === 'V.Srinu (F01)'));
  assert.equal(farmerSelect.props.options.find(option => option.value === '3').label, 'V.Srinu (F01)');
  farmerSelect.props.onChange('3');
  tree = page();
  assert.equal(elements(tree, node => node.props?.id === 'collection-farmer')[0].props.value, '3');
  elements(tree, node => node.props?.id === 'collection-shift')[0].props.onChange('Evening');
  for (const [id, value] of [['collection-quantity', '10'], ['collection-rate', '42']]) {
    elements(tree, node => node.type === 'input' && node.props.id === id)[0].props.onChange({target: {value}});
  }
  tree = page();
  const markup = require('react-dom/server').renderToStaticMarkup(tree);
  assert.match(markup, /₹420/);
  assert.match(markup, /unsaved preview/);
  const save = elements(tree, node => node.props?.type === 'submit')[0];
  assert.equal(save.props.disabled, false);
  assert.equal(h.calls.length, 2); // Login plus farmer lookup only.
  assert.equal(h.calls[1].url, 'http://test-api.local/api/admin/farmers/options/');
  assert.equal(h.calls[1].method, 'GET');
  assert.equal(h.calls[1].headers.Authorization, 'Bearer admin-token');
  assert.match(markup, /V.Srinu/);
});

test('styled dropdown opens, searches, selects the API ID, and closes', () => {
  const h = harness();
  const selected = [];
  const props = {id: 'farmer-dropdown', value: '', searchable: true,
    options: [{value: '4', label: 'V.Bhanu (F02)', description: 'MSG'}, {value: '3', label: 'V.Srinu (F01)'}],
    onChange: value => selected.push(value)};
  const render = () => h.form('components/ui/select-dropdown.tsx', 'SelectDropdown', props);
  let tree = render();
  elements(tree, node => node.props?.role === 'combobox')[0].props.onClick();
  tree = render();
  assert.equal(elements(tree, node => node.props?.role === 'option').length, 2);
  elements(tree, node => node.type === 'input')[0].props.onChange({target: {value: 'F01'}});
  tree = render();
  const options = elements(tree, node => node.props?.role === 'option');
  assert.equal(options.length, 1);
  options[0].props.onClick();
  assert.deepEqual(selected, ['3']);
  assert.equal(elements(render(), node => node.props?.role === 'listbox').length, 0);
});

test('styled dropdown supports arrow selection, Enter, and Escape', () => {
  const h = harness(); const selected = [];
  const render = () => h.form('components/ui/select-dropdown.tsx', 'SelectDropdown', {
    id: 'shift-dropdown', value: '', options: [{value: 'Morning', label: 'Morning shift'}, {value: 'Evening', label: 'Evening shift'}], onChange: value => selected.push(value),
  });
  function key(name) { render().props.onKeyDown({key: name, preventDefault() {}, stopPropagation() {}}); }
  key('ArrowDown'); key('ArrowDown'); key('Enter');
  assert.deepEqual(selected, ['Evening']);
  key('ArrowDown'); key('Escape');
  assert.equal(elements(render(), node => node.props?.role === 'listbox').length, 0);
});

test('migrated account and page-size dropdowns preserve server filters and numeric pagination', async () => {
  const h = harness(); h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  const page = () => h.form('app/admin/farmers/page.tsx', 'default');
  let tree = page();
  elements(tree, node => node.props?.id === 'account-status')[0].props.onChange('inactive');
  h.respond(200, {count: 1, next: null, previous: null, results: [], summary: {total: 5, active: 4, inactive: 1}});
  tree = page(); h.startLatestEffect(); await h.runTimer();
  assert.equal(new URL(h.calls.at(-1).url).searchParams.get('status'), 'inactive');
  tree = page();
  const sizes = elements(tree, node => node.props?.id === 'farmers-pageSize')[0];
  assert.deepEqual(Array.from(sizes.props.options, option => option.value), ['10', '20', '50']);
  sizes.props.onChange('50');
  page(); h.startLatestEffect(); await h.runTimer();
  const url = new URL(h.calls.at(-1).url);
  assert.equal(url.searchParams.get('page_size'), '50');
  assert.equal(url.searchParams.get('page'), '1');
  assert.equal(url.searchParams.get('status'), 'inactive');
});

async function collectionForm(h) {
  h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  const render = () => h.form('app/admin/add-collection/page.tsx', 'default');
  render();
  h.respond(200, {count: 1, results: [{id: 4, farmer_id: 'F02', name: 'V.Bhanu', village: 'MSG'}]});
  h.startLatestEffect(); await h.runTimer();
  let tree = render();
  elements(tree, node => node.props?.id === 'collection-farmer')[0].props.onChange('4');
  elements(tree, node => node.props?.id === 'collection-shift')[0].props.onChange('Morning');
  for (const [id, value] of [['collection-date', '2026-10-29'], ['collection-quantity', '10.25'], ['collection-rate', '42.50']]) {
    elements(tree, node => node.type === 'input' && node.props.id === id)[0].props.onChange({target: {value}});
  }
  return {render, submit: () => elements(render(), node => node.type === 'form')[0].props.onSubmit({preventDefault() {}})};
}

test('collection POST uses database ID, decimal strings, lowercase shift and nullable readings, then clears only on 201', async () => {
  const h = harness(); const form = await collectionForm(h);
  const resolve = h.defer();
  const first = form.submit(); const second = form.submit();
  assert.equal(h.calls.length, 3);
  assert.equal(h.notifications.length, 0);
  const request = h.calls.at(-1);
  assert.equal(request.url, 'http://test-api.local/api/admin/milk-collections/');
  assert.equal(request.headers.Authorization, 'Bearer admin-token');
  assert.equal(request.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(request.body), {farmer: 4, collection_date: '2026-10-29', shift: 'morning', quantity_litres: '10.25', rate_per_litre: '42.50', fat: null, snf: null, clr: null, temperature: null, notes: ''});
  resolve(new Response(JSON.stringify({id: 8, amount: '435.63'}), {status: 201}));
  await Promise.all([first, second]);
  assert.equal(h.notifications.length, 1);
  assert.equal(h.redirects.at(-1), '/admin/collections');
  const tree = form.render();
  assert.equal(elements(tree, node => node.props?.id === 'collection-farmer')[0].props.value, '');
  assert.equal(elements(tree, node => node.type === 'input' && node.props.id === 'collection-quantity')[0].props.value, '');
});

test('collection POST preserves provided quality decimals and renders 400 field errors without clearing', async () => {
  const h = harness(); const form = await collectionForm(h);
  for (const [id, value] of [['collection-fat', '4.50'], ['collection-snf', '8.50'], ['collection-clr', '28.00'], ['collection-temperature', '25.00']]) {
    elements(form.render(), node => node.type === 'input' && node.props.id === id)[0].props.onChange({target: {value}});
  }
  h.respond(400, {farmer: ['Farmer is inactive.'], quantity_litres: ['Invalid volume.'], fat: ['Reading is not valid.']});
  await form.submit();
  assert.equal(JSON.parse(h.calls.at(-1).body).fat, '4.50');
  const tree = form.render();
  const markup = require('react-dom/server').renderToStaticMarkup(tree);
  assert.match(markup, /Farmer is inactive/); assert.match(markup, /Invalid volume/); assert.match(markup, /Reading is not valid/);
  assert.equal(elements(tree, node => node.type === 'input' && node.props.id === 'collection-quantity')[0].props.value, '10.25');
  assert.equal(h.notifications.length, 0);
});

for (const status of [200, 403, 429]) {
  test(`collection POST does not report success for ${status}`, async () => {
    const h = harness(); const form = await collectionForm(h);
    h.respond(status, {}); await form.submit();
    assert.equal(h.notifications.length, 0);
    assert.equal(elements(form.render(), node => node.type === 'input' && node.props.id === 'collection-quantity')[0].props.value, '10.25');
    assert.equal(h.redirects.length, 0);
  });
}

test('collection filters use exact date or range, and farmer requests never include ownership identifiers', () => {
  const h = harness(); const {collectionsPath} = h.module('lib/services/milk-collections-api.ts');
  let url = new URL(collectionsPath('admin', {date: '2026-10-29', date_from: '2026-10-01', date_to: '2026-10-31', shift: 'Evening', farmer: '4', search: ' Srinu ', page: 2, page_size: 20}), 'http://test.local');
  assert.equal(url.pathname, '/api/admin/milk-collections/');
  assert.equal(url.searchParams.get('date'), '2026-10-29');
  assert.equal(url.searchParams.has('date_from'), false);
  assert.equal(url.searchParams.get('shift'), 'evening');
  assert.equal(url.searchParams.get('farmer'), '4');
  assert.equal(url.searchParams.get('search'), 'Srinu');
  url = new URL(collectionsPath('farmer', {farmer: '4', search: 'not-allowed', date_from: '2026-10-01', date_to: '2026-10-31', page: 2, page_size: 20}), 'http://test.local');
  assert.equal(url.pathname, '/api/farmer/milk-collections/');
  assert.equal(url.searchParams.has('farmer'), false); assert.equal(url.searchParams.has('search'), false);
  assert.equal(url.searchParams.get('date_from'), '2026-10-01'); assert.equal(url.searchParams.get('page'), '2');
});

for (const user of [admin, farmer]) {
  test(`${user.role} list uses its own token and renders server totals independently of page rows`, async () => {
    const h = harness(); h.respond(200, {access: `${user.role}-token`, user});
    await h.render().login('identifier', 'test-only', user.role); h.render();
    const ledger = () => h.form('components/collections/collection-ledger.tsx', 'CollectionLedger', {role: user.role});
    ledger(); h.startLatestEffect();
    h.respond(200, {count: 40, next: 'http://test.local/next', previous: null,
      results: [{id: 8, farmer: 4, farmer_name: 'V.Bhanu', farmer_id: 'F02', village: 'MSG', created_at: '2026-10-29T13:30:00Z', collection_date: '2026-10-29', shift: 'morning', quantity_litres: '10.25', rate_per_litre: '42.50', amount: '435.63', fat: null, snf: '8.50'}],
      summary: {quantity_litres: '500.25', amount: '22000.40'}});
    await h.runTimer();
    const request = h.calls.at(-1);
    assert.equal(new URL(request.url).pathname, `/api/${user.role}/milk-collections/`);
    assert.equal(request.method, 'GET'); assert.equal(request.headers.Authorization, `Bearer ${user.role}-token`);
    assert.equal(new URL(request.url).searchParams.has('farmer'), false);
    const tree = ledger(); const markup = require('react-dom/server').renderToStaticMarkup(tree);
    assert.match(markup, /500.25 L/); assert.match(markup, /22,000.40/); assert.match(markup, /435.63/); assert.match(markup, /Not recorded/);
    elements(tree, node => node.props?.['aria-label'] === 'Next collections page')[0].props.onClick();
    ledger(); h.startLatestEffect(); await h.runTimer();
    assert.equal(new URL(h.calls.at(-1).url).searchParams.get('page'), '2');
    elements(ledger(), node => node.props?.id === 'milk-shift')[0].props.onChange('evening');
    ledger(); h.startLatestEffect(); await h.runTimer();
    const filtered = new URL(h.calls.at(-1).url);
    assert.equal(filtered.searchParams.get('page'), '1'); assert.equal(filtered.searchParams.get('shift'), 'evening');
  });
}

for (const status of [401, 403]) {
  test(`milk collection GET handles ${status} without showing mock records`, async () => {
    const h = harness(); h.respond(200, {access: 'farmer-token', user: farmer});
    await h.render().login('F001', 'test-only', 'farmer'); h.render();
    const ledger = () => h.form('components/collections/collection-ledger.tsx', 'CollectionLedger', {role: 'farmer'});
    ledger(); h.startLatestEffect(); h.respond(status, {}); await h.runTimer();
    if (status === 401) { assert.equal(h.render().user, null); assert.equal(h.redirects.at(-1), '/login?reason=expired'); }
    else { assert.match(require('react-dom/server').renderToStaticMarkup(ledger()), /403: Forbidden/); assert.equal(h.render().user.role, 'farmer'); }
  });
}

async function notificationForm(h, audience = 'specific') {
  h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  const render = () => h.form('app/admin/notifications/page.tsx', 'default');
  render(); h.startLatestEffect();
  h.respond(200, {count: 1, results: [{id: 4, farmer_id: 'F02', name: 'V.Bhanu', village: 'MSG'}]});
  await h.runTimer();
  let tree = render();
  elements(tree, node => node.type === 'button' && node.props['aria-pressed'] === false)[0].props.onClick();
  tree = render();
  elements(tree, node => node.props?.id === 'notification-farmer')[0].props.onChange('4');
  if (audience === 'all') {
    elements(render(), node => node.type === 'button' && node.props['aria-pressed'] === false)[0].props.onClick();
  }
  tree = render();
  elements(tree, node => node.type === 'input' && node.props.id === 'notification-title')[0].props.onChange({target: {value: 'Collection recorded'}});
  elements(tree, node => node.type === 'textarea')[0].props.onChange({target: {value: 'Your morning collection has been recorded.'}});
  elements(tree, node => node.props?.id === 'notification-category')[0].props.onChange(audience === 'all' ? 'general' : 'milk_collection');
  return {render, submit: () => elements(render(), node => node.type === 'form')[0].props.onSubmit({preventDefault() {}})};
}

for (const audience of ['all', 'specific']) {
  test(`notification dispatch ${audience} uses exact API body and database ID, with success only after 201`, async () => {
    const h = harness(); const form = await notificationForm(h, audience);
    const resolve = h.defer(); const first = form.submit(); const second = form.submit();
    assert.equal(h.calls.length, 3); assert.equal(h.notifications.length, 0);
    const request = h.calls.at(-1);
    assert.equal(request.url, 'http://test-api.local/api/admin/notifications/');
    assert.equal(request.method, 'POST'); assert.equal(request.headers.Authorization, 'Bearer admin-token');
    assert.equal(request.headers['Content-Type'], 'application/json');
    const body = JSON.parse(request.body);
    assert.deepEqual(body, {audience, title: 'Collection recorded', message: 'Your morning collection has been recorded.', category: audience === 'all' ? 'general' : 'milk_collection', ...(audience === 'specific' ? {farmer: 4} : {})});
    resolve(new Response(JSON.stringify({id: 9}), {status: 201}));
    await Promise.all([first, second]);
    assert.equal(h.notifications.length, 1); assert.equal(h.render().user.role, 'admin');
    const tree = form.render();
    const markup = require('react-dom/server').renderToStaticMarkup(tree);
    assert.match(markup, /Notification saved to the database/);
    assert.ok(!markup.includes('Delivered'));
    assert.equal(elements(tree, node => node.type === 'input' && node.props.id === 'notification-title')[0].props.value, '');
  });
}

for (const status of [200, 400, 401, 403, 429]) {
  test(`notification dispatch handles ${status} without false success`, async () => {
    const h = harness(); const form = await notificationForm(h);
    h.respond(status, {farmer: ['Invalid recipient.'], title: ['Invalid title.']});
    await form.submit();
    assert.equal(h.notifications.length, 0);
    const tree = form.render();
    assert.equal(elements(tree, node => node.type === 'input' && node.props.id === 'notification-title')[0].props.value, 'Collection recorded');
    if (status === 400) {
      assert.ok(elements(tree, node => node.props?.id === 'notification-error-farmer').length);
      assert.ok(elements(tree, node => node.props?.id === 'notification-error-title').length);
    }
    if (status === 401) { assert.equal(h.render().user, null); assert.equal(h.redirects.at(-1), '/login?role=admin&reason=expired'); }
    else assert.equal(h.render().user.role, 'admin');
  });
}

test('farmer notifications load on page open with only the farmer token and follow safe pagination links', async () => {
  const h = harness(); h.respond(200, {access: 'farmer-token', user: farmer});
  await h.render().login('F001', 'test-only', 'farmer'); h.render();
  const render = () => h.form('app/farmer/notifications/page.tsx', 'default');
  render(); h.startLatestEffect();
  const notification = {id: 1, audience: 'all', farmer: null, title: 'Milk collection update', message: 'Evening milk collection starts at 6 PM.', category: 'general', created_at: '2026-10-29T16:45:00Z'};
  h.respond(200, {count: 2, next: 'http://127.0.0.1:8000/api/farmer/notifications/?page=2', previous: null, results: [notification, {...notification, id: 2, audience: 'specific', farmer: 2, title: 'Your collection', category: 'milk_collection'}]});
  await h.runTimer();
  const request = h.calls.at(-1);
  assert.equal(request.url, 'http://test-api.local/api/farmer/notifications/');
  assert.equal(request.method, 'GET'); assert.equal(request.headers.Authorization, 'Bearer farmer-token');
  assert.equal(request.body, undefined);
  const tree = render(); const markup = require('react-dom/server').renderToStaticMarkup(tree);
  assert.match(markup, /Milk collection update/); assert.match(markup, /Your collection/); assert.match(markup, /All farmers/); assert.match(markup, /For you/);
  assert.ok(!markup.includes('Unread')); assert.ok(!markup.includes('Mark all as read'));
  elements(tree, node => node.props?.['aria-label'] === 'Next notifications page')[0].props.onClick();
  render(); h.startLatestEffect(); await h.runTimer();
  assert.equal(h.calls.at(-1).url, 'http://test-api.local/api/farmer/notifications/?page=2');
  assert.equal(h.module('lib/services/notifications-api.ts').notificationPagePath('http://external.test/not-the-api'), null);
});

for (const status of [401, 403]) {
  test(`farmer notifications handle ${status} correctly`, async () => {
    const h = harness(); h.respond(200, {access: 'farmer-token', user: farmer});
    await h.render().login('F001', 'test-only', 'farmer'); h.render();
    const render = () => h.form('app/farmer/notifications/page.tsx', 'default');
    render(); h.startLatestEffect(); h.respond(status, {}); await h.runTimer();
    if (status === 401) { assert.equal(h.render().user, null); assert.equal(h.redirects.at(-1), '/login?reason=expired'); }
    else assert.match(require('react-dom/server').renderToStaticMarkup(render()), /403: Forbidden/);
  });
}

const monthlyTotals = {days_supplied: 2, collection_count: 3, morning_collections: 2, evening_collections: 1, quantity_litres: '17.25', earnings: '725.63'};
const monthlyFarmer = {month: '2026-10', currency: 'INR', farmer: {id: 4, farmer_id: 'F02', name: 'V.Bhanu', village: 'MSG'}, summary: monthlyTotals, daily_breakdown: [
  {date: '2026-10-01', quantity_litres: '15.25', earnings: '635.63', collection_count: 2, morning_collections: 1, evening_collections: 1},
  {date: '2026-10-02', quantity_litres: '2.00', earnings: '90.00', collection_count: 1, morning_collections: 1, evening_collections: 0},
]};
const monthlyAdmin = {count: 41, next: 'http://test.local/next', previous: null, results: [{id: 4, farmer_id: 'F02', name: 'V.Bhanu', village: 'MSG', is_active: true, ...monthlyTotals}], month: '2026-10', currency: 'INR', summary: {...monthlyTotals, days_supplied: 20, collection_count: 90, total_farmers: 100, farmers_with_collections: 41, quantity_litres: '500.25', earnings: '22000.40'}};

async function monthlyPage(h, user, access = `${user.role}-token`) {
  h.respond(200, {access, user});
  await h.render().login('identifier', 'test-only', user.role); h.render();
  const render = () => h.form('components/payments/monthly-earnings.tsx', 'MonthlyEarnings', {role: user.role});
  const tree = render();
  elements(tree, node => node.props?.id === 'earnings-month')[0].props.onChange({target: {value: '2026-10'}});
  render(); render.cleanup = h.startLatestEffect();
  return render;
}

test('admin monthly earnings use server-wide summary, exact month and pagination instead of summing visible rows', async () => {
  const h = harness(); const render = await monthlyPage(h, admin);
  h.respond(200, monthlyAdmin); await h.runTimer();
  const request = h.calls.at(-1); const url = new URL(request.url);
  assert.equal(url.pathname, '/api/admin/payments/monthly/');
  assert.equal(url.searchParams.get('month'), '2026-10');
  assert.equal(url.searchParams.get('page'), '1'); assert.equal(url.searchParams.get('page_size'), '20');
  assert.equal(request.method, 'GET'); assert.equal(request.headers.Authorization, 'Bearer admin-token');
  const tree = render(); const markup = require('react-dom/server').renderToStaticMarkup(tree);
  assert.equal(elements(tree, node => node.props?.title === 'Total Farmers')[0].props.value, 100);
  assert.equal(elements(tree, node => node.props?.title === 'Farmers Supplied')[0].props.value, 41);
  assert.match(markup, /500.25 L/); assert.match(markup, /22,000.40/); assert.match(markup, /725.63/); assert.match(markup, /V.Bhanu/); assert.match(markup, /MSG/);
  assert.match(markup, /distinct calendar dates across all farmers/);
  assert.ok(!markup.includes('Payment marked')); assert.ok(!markup.includes('Paid Disbursements'));
  elements(tree, node => node.props?.['aria-label'] === 'Next earnings page')[0].props.onClick();
  render(); h.startLatestEffect(); await h.runTimer();
  assert.equal(new URL(h.calls.at(-1).url).searchParams.get('page'), '2');
  elements(render(), node => node.props?.id === 'earnings-month')[0].props.onChange({target: {value: '2026-09'}});
  render(); h.startLatestEffect(); await h.runTimer();
  assert.equal(new URL(h.calls.at(-1).url).searchParams.get('month'), '2026-09');
  assert.equal(new URL(h.calls.at(-1).url).searchParams.get('page'), '1');
});

test('farmer monthly earnings use only their token, distinct-day totals and API-ordered daily breakdown', async () => {
  const h = harness(); const render = await monthlyPage(h, farmer);
  h.respond(200, monthlyFarmer); await h.runTimer();
  const request = h.calls.at(-1); const url = new URL(request.url);
  assert.equal(request.url, 'http://test-api.local/api/farmer/payments/monthly/?month=2026-10');
  assert.equal(request.headers.Authorization, 'Bearer farmer-token'); assert.equal(request.body, undefined);
  assert.equal(url.searchParams.has('farmer'), false); assert.equal(url.searchParams.has('farmer_id'), false); assert.equal(url.searchParams.has('page'), false);
  const tree = render();
  assert.equal(elements(tree, node => node.props?.title === 'Days Supplied')[0].props.value, 2);
  const markup = require('react-dom/server').renderToStaticMarkup(tree);
  assert.match(markup, /725.63/); assert.match(markup, /17.25 L/); assert.match(markup, /635.63/); assert.match(markup, /90.00/);
  assert.ok(markup.indexOf('1 Oct 2026') < markup.indexOf('2 Oct 2026'));
  assert.match(markup, /do not indicate money received/); assert.ok(!markup.includes('Download Settlement Voucher'));
});

for (const status of [400, 401, 403]) {
  test(`monthly earnings surface ${status} correctly`, async () => {
    const h = harness(); const render = await monthlyPage(h, farmer);
    h.respond(status, {month: ['Invalid reporting month.']}); await h.runTimer();
    if (status === 401) { assert.equal(h.render().user, null); assert.equal(h.redirects.at(-1), '/login?reason=expired'); }
    else {
      const markup = require('react-dom/server').renderToStaticMarkup(render());
      assert.match(markup, new RegExp(`${status}:`));
      if (status === 400) assert.match(markup, /Invalid reporting month/);
    }
  });
}

test('farmer empty monthly earnings render real zero totals and reject an empty month without fetching', async () => {
  const h = harness(); const render = await monthlyPage(h, farmer);
  h.respond(200, {...monthlyFarmer, summary: {days_supplied: 0, collection_count: 0, morning_collections: 0, evening_collections: 0, quantity_litres: '0.00', earnings: '0.00'}, daily_breakdown: []});
  await h.runTimer();
  let tree = render(); const markup = require('react-dom/server').renderToStaticMarkup(tree);
  assert.match(markup, /No milk collections this month/);
  assert.equal(elements(tree, node => node.props?.title === 'Days Supplied')[0].props.value, 0);
  elements(tree, node => node.props?.id === 'earnings-month')[0].props.onChange({target: {value: ''}});
  tree = render(); const before = h.calls.length;
  h.startLatestEffect();
  assert.equal(h.calls.length, before);
  assert.match(require('react-dom/server').renderToStaticMarkup(tree), /Choose a valid month/);
});

test('late monthly responses cannot overwrite a newly selected month', async () => {
  const h = harness(); const render = await monthlyPage(h, farmer);
  const resolveOld = h.defer(); const old = h.runTimer();
  render.cleanup();
  elements(render(), node => node.props?.id === 'earnings-month')[0].props.onChange({target: {value: '2026-09'}});
  render(); h.startLatestEffect();
  h.respond(200, {...monthlyFarmer, month: '2026-09', summary: {...monthlyTotals, earnings: '99.00'}});
  await h.runTimer();
  resolveOld(new Response(JSON.stringify(monthlyFarmer), {status: 200})); await old;
  const markup = require('react-dom/server').renderToStaticMarkup(render());
  assert.match(markup, /₹99.00/);
  assert.ok(!markup.includes('₹725.63'));
});

const dashboardResponse = {
  date: '2026-10-29', timezone: 'Asia/Kolkata', currency: 'INR',
  payments: {pending_amount: null, next_disbursement_date: null, status: 'not_available'},
  farmer: {id: 4, name: 'API Farmer Name', farmer_id: 'F02', village: 'MSG', chilling_center: null},
  today: {quantity_litres: '10.25', morning_litres: '10.25', evening_litres: '0.00', earnings: '435.63', collection_count: 1, morning_time: null, evening_time: null},
  production: {range: '7d', date_from: '2026-10-23', date_to: '2026-10-29', quantity_litres: '10.25', earnings: '435.63', days_supplied: 1, base_union_rate: null, trend: [{date: '2026-10-29', quantity_litres: '10.25', earnings: '435.63', morning_litres: '10.25', evening_litres: '0.00'}], average_daily_yield_litres: '5.50', average_fat: null},
  recent_collections: [{id: 1, farmer: 4, farmer_name: 'API Farmer Name', farmer_id: 'F02', village: 'MSG', created_at: '2026-10-29T13:30:00Z', collection_date: '2026-10-29', shift: 'morning', quantity_litres: '10.25', rate_per_litre: '42.50', amount: '435.63', fat: null, snf: '8.50'}],
};

async function dashboardPage(h) {
  h.respond(200, {access: 'farmer-token', user: farmer});
  await h.render().login('F001', 'test-only', 'farmer'); h.render();
  const render = () => h.form('app/farmer/dashboard/page.tsx', 'default');
  render(); const cleanup = h.startLatestEffect();
  return {render, cleanup};
}

test('farmer dashboard maps API totals and identity without sending a farmer ID or fabricating pending values', async () => {
  const h = harness(); const {render} = await dashboardPage(h);
  h.respond(200, dashboardResponse); await h.runTimer();
  assert.equal(h.calls.at(-1).url, 'http://test-api.local/api/farmer/dashboard/?range=7d');
  assert.equal(h.calls.at(-1).headers.Authorization, 'Bearer farmer-token');
  assert.equal(h.calls.at(-1).method, 'GET'); assert.equal(h.calls.at(-1).body, undefined);
  const tree = render();
  assert.equal(elements(tree, node => node.props?.title === "Today's Milk")[0].props.value, '10.25 L');
  assert.equal(elements(tree, node => node.props?.title === 'Evening')[0].props.value, '0.00 L');
  assert.equal(elements(tree, node => node.props?.title === "Today's Earnings")[0].props.value, '₹435.63');
  assert.equal(elements(tree, node => node.props?.title === 'Pending Payment')[0].props.value, '—');
  const markup = require('react-dom/server').renderToStaticMarkup(tree);
  assert.match(markup, /API Farmer Name/); assert.match(markup, /F02/); assert.match(markup, /5.50 L/); assert.match(markup, /Fat: —/);
  assert.ok(!markup.includes('07:30')); assert.ok(!markup.includes('Disbursal on')); assert.ok(!markup.includes('Grade A+'));
});

test('dashboard tabs request 30d and 3m directly from the backend', async () => {
  const h = harness(); const {render} = await dashboardPage(h);
  h.respond(200, dashboardResponse); await h.runTimer();
  for (const [label, range] of [['30 Days', '30d'], ['3 Months', '3m']]) {
    elements(render(), node => node.type === 'button' && node.props.children === label)[0].props.onClick();
    render(); h.startLatestEffect(); await h.runTimer();
    assert.equal(h.calls.at(-1).url, `http://test-api.local/api/farmer/dashboard/?range=${range}`);
  }
  assert.match(require('react-dom/server').renderToStaticMarkup(render()), /Three calendar months, including the current month/);
});

for (const status of [401, 403]) {
  test(`dashboard handles ${status} without displaying mock production`, async () => {
    const h = harness(); const {render} = await dashboardPage(h);
    h.respond(status, {}); await h.runTimer();
    if (status === 401) { assert.equal(h.render().user, null); assert.equal(h.redirects.at(-1), '/login?reason=expired'); }
    else assert.match(require('react-dom/server').renderToStaticMarkup(render()), /403: Forbidden/);
  });
}

test('dashboard empty production and recent collections show clear empty states', async () => {
  const h = harness(); const {render} = await dashboardPage(h);
  h.respond(200, {...dashboardResponse, production: {...dashboardResponse.production, trend: []}, recent_collections: []});
  await h.runTimer();
  const markup = require('react-dom/server').renderToStaticMarkup(render());
  assert.match(markup, /No production data for this range/); assert.match(markup, /No milk collections recorded yet/);
});

test('confirmed dashboard date-based chart maps quantity, shift volumes and earnings with null-safe details', async () => {
  const h = harness(); const {render} = await dashboardPage(h);
  const response = {...dashboardResponse,
    farmer: {...dashboardResponse.farmer, name: 'V.Bhanu'},
    today: {quantity_litres: '15.00', earnings: '600.00', morning_litres: '10.00', evening_litres: '5.00', collection_count: 2, morning_time: null, evening_time: null},
    production: {...dashboardResponse.production, quantity_litres: '15.00', earnings: '600.00', average_daily_yield_litres: '2.14', average_fat: '4.50', trend: [{date: '2026-10-29', quantity_litres: '15.00', earnings: '600.00', morning_litres: '10.00', evening_litres: '5.00'}]},
  };
  h.respond(200, response); await h.runTimer();
  const tree = render();
  const chart = elements(tree, node => Array.isArray(node.props?.data) && node.props.data[0]?.date === '2026-10-29')[0];
  assert.equal(chart.props.data[0].volume, 15);
  const axis = elements(tree, node => node.props?.dataKey === 'date')[0];
  assert.equal(axis.props.tickFormatter('2026-10-29'), '29 Oct');
  const tooltip = elements(tree, node => typeof node.props?.content === 'function')[0];
  const content = tooltip.props.content({active: true, payload: [{payload: response.production.trend[0]}]});
  const markup = require('react-dom/server').renderToStaticMarkup(content);
  assert.match(markup, /29 Oct 2026/); assert.match(markup, /15.00 L/); assert.match(markup, /10.00 L/); assert.match(markup, /5.00 L/); assert.match(markup, /600.00/);
  assert.equal(elements(tree, node => node.props?.title === 'Morning')[0].props.subvalue, 'Shift timing: —');
  assert.equal(elements(tree, node => node.props?.title === 'Pending Payment')[0].props.subvalue, 'Payout date: —');
  const fullMarkup = require('react-dom/server').renderToStaticMarkup(tree);
  assert.match(fullMarkup, /2.14 L/); assert.match(fullMarkup, /4.50%/);
  const labels = h.module('lib/services/farmer-dashboard-api.ts');
  assert.equal(labels.productionDateLabel('2026-10-29', '3m', true), '29 Oct 2026');
  assert.equal(labels.productionDateLabel('2026-10', '3m', true), 'Oct 2026');
});

const reportSummary = {days_supplied: 2, collection_count: 30, farmers_supplied: 5, morning_collections: 20, evening_collections: 10, morning_litres: '300.00', evening_litres: '200.00', quantity_litres: '500.00', average_fat: null, average_snf: '8.50', earnings: '22000.40'};
const reportFixtures = {
  daily: {count: 41, next: 'http://test.local/next', previous: null, currency: 'INR', results: [{date: '2026-10-29', morning_litres: '10.25', evening_litres: '7.00', quantity_litres: '17.25', average_fat: '4.50', average_snf: '8.50', earnings: '725.63', farmers_supplied: 1, collection_count: 3}], summary: reportSummary},
  farmer: {count: 1, next: null, previous: null, currency: 'INR', results: [{farmer: 4, farmer_id: 'F02', name: 'V.Bhanu', village: 'MSG', days_supplied: 2, collection_count: 3, morning_collections: 2, evening_collections: 1, quantity_litres: '17.25', average_fat: '4.50', average_snf: '8.50', earnings: '725.63'}], summary: reportSummary},
  quality: {count: 1, next: null, previous: null, currency: 'INR', results: [{id: 12, collection_date: '2026-10-29', farmer: 4, farmer_id: 'F02', farmer_name: 'V.Bhanu', village: 'MSG', shift: 'evening', quantity_litres: '5.00', fat: null, snf: null, clr: null, temperature: null}], summary: {...reportSummary, average_fat: null, average_snf: null}},
  earnings: {...monthlyAdmin, results: [{...monthlyAdmin.results[0], is_active: false}]},
  monthly: {month: '2026-10', currency: 'INR', summary: {...reportSummary, total_farmers: 10, farmers_with_collections: 5}},
};
const reportOrder = ['daily', 'farmer', 'earnings', 'quality', 'monthly'];
function reportAction(tree, type, label) {
  const cards = elements(tree, node => node.props?.hover === true);
  return elements(cards[reportOrder.indexOf(type)], node => node.props?.onClick && React.Children.toArray(node.props.children).some(child => child === label))[0].props.onClick;
}
async function reportsPage(h) {
  h.respond(200, {access: 'admin-token', user: admin});
  await h.render().login('identifier', 'test-only', 'admin'); h.render();
  const render = () => h.form('app/admin/reports/page.tsx', 'default');
  let tree = render();
  h.startEffectFromEnd(2); h.respond(200, {count: 1, results: [{id: 4, farmer_id: 'F02', name: 'V.Bhanu', village: 'MSG'}]}); await h.runTimer();
  tree = render();
  for (const [id, value] of [['report-from', '2026-10-01'], ['report-to', '2026-10-31'], ['report-month', '2026-10']]) elements(tree, node => node.props?.id === id)[0].props.onChange({target: {value}});
  return render;
}

for (const type of reportOrder) {
  test(`${type} report previews use the documented authenticated GET endpoint and actual API rows`, async () => {
    const h = harness(); const render = await reportsPage(h);
    reportAction(render(), type, 'View')();
    render(); h.startLatestEffect(); h.respond(200, reportFixtures[type]); await h.runTimer();
    const request = h.calls.at(-1); const url = new URL(request.url);
    const endpoint = type === 'earnings' ? '/api/admin/payments/monthly/' : `/api/admin/reports/${{daily: 'daily-milk', farmer: 'farmer-production', quality: 'milk-quality', monthly: 'monthly-summary'}[type]}/`;
    assert.equal(url.pathname, endpoint); assert.equal(request.method, 'GET'); assert.equal(request.headers.Authorization, 'Bearer admin-token');
    assert.equal(url.searchParams.get(type === 'earnings' || type === 'monthly' ? 'month' : 'date_from'), '2026-10' + (type === 'earnings' || type === 'monthly' ? '' : '-01'));
    const markup = require('react-dom/server').renderToStaticMarkup(render());
    assert.ok(!markup.includes('Certified')); assert.ok(!markup.includes('Government'));
    if (type === 'quality') { assert.match(markup, /V.Bhanu/); assert.match(markup, /—/); assert.ok(!markup.includes('Quality grade')); }
    else if (type !== 'monthly') assert.match(markup, /725.63/);
    if (type === 'daily') { assert.match(markup, /22,000.40/); assert.match(markup, /500.00/); }
    if (type === 'monthly') { assert.match(markup, /Total farmers/); assert.match(markup, /22,000.40|22000.40/); }
  });
}

for (const type of reportOrder) {
  test(`${type} report CSV downloads preserve the blob/BOM and filename, exporting all filtered rows`, async () => {
    const h = harness(); const render = await reportsPage(h);
    elements(render(), node => node.props?.id === 'report-farmer')[0].props.onChange('4');
    elements(render(), node => node.props?.id === 'report-shift')[0].props.onChange('evening');
    elements(render(), node => node.props?.id === 'report-search')[0].props.onChange({target: {value: ' Bhanu '}});
    const csv = '\uFEFFFarmer,Value,Fat\r\nV.Bhanu,725.63,\r\n';
    h.respondRaw(200, csv, {'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="backend_report.csv"'});
    await reportAction(render(), type, 'Export CSV')();
    const request = h.calls.at(-1); const url = new URL(request.url);
    assert.equal(request.headers.Authorization, 'Bearer admin-token'); assert.equal(request.method, 'GET'); assert.equal(request.body, undefined);
    assert.equal(url.searchParams.get('format'), 'csv'); assert.equal(url.searchParams.has('page'), false); assert.equal(url.searchParams.has('page_size'), false);
    if (['daily', 'farmer', 'quality'].includes(type)) {
      assert.equal(url.searchParams.get('farmer'), '4'); assert.equal(url.searchParams.get('shift'), 'evening'); assert.equal(url.searchParams.get('search'), 'Bhanu');
    } else { assert.equal(url.searchParams.has('farmer'), false); assert.equal(url.searchParams.has('shift'), false); assert.equal(url.searchParams.get('month'), '2026-10'); }
    assert.equal(h.downloads.length, 1); assert.equal(h.downloads[0].filename, 'backend_report.csv');
    const bytes = new Uint8Array(await h.downloads[0].blob.arrayBuffer());
    assert.deepEqual(Array.from(bytes.slice(0, 3)), [239, 187, 191]);
    assert.equal(h.notifications.length, 1);
  });
}

test('report export prevents duplicates and displays 400 field errors without downloading a file', async () => {
  const h = harness(); const render = await reportsPage(h);
  const resolve = h.defer(); const action = reportAction(render(), 'daily', 'Export CSV');
  const first = action(); const second = action();
  assert.equal(h.calls.length, 3);
  resolve(new Response(JSON.stringify({date_to: ['Date range is invalid.']}), {status: 400}));
  await Promise.all([first, second]);
  assert.equal(h.downloads.length, 0); assert.equal(h.notifications.length, 0);
  assert.match(require('react-dom/server').renderToStaticMarkup(render()), /Date range is invalid/);
});

for (const status of [401, 403, 429]) {
  test(`report CSV export handles ${status} without treating JSON errors as CSV`, async () => {
    const h = harness(); const render = await reportsPage(h);
    h.respond(status, {}); await reportAction(render(), 'daily', 'Export CSV')();
    assert.equal(h.downloads.length, 0);
    if (status === 401) { assert.equal(h.render().user, null); assert.equal(h.redirects.at(-1), '/login?role=admin&reason=expired'); }
    else assert.match(require('react-dom/server').renderToStaticMarkup(render()), new RegExp(`${status}:`));
  });
}

test('report view pagination resets when filters change and invalid dates do not make a request', async () => {
  const h = harness(); const render = await reportsPage(h);
  reportAction(render(), 'daily', 'View')(); render(); h.startLatestEffect(); h.respond(200, reportFixtures.daily); await h.runTimer();
  elements(render(), node => node.props?.['aria-label'] === 'Next report page')[0].props.onClick();
  render(); h.startLatestEffect(); await h.runTimer();
  assert.equal(new URL(h.calls.at(-1).url).searchParams.get('page'), '2');
  elements(render(), node => node.props?.id === 'report-search')[0].props.onChange({target: {value: 'Srinu'}});
  render(); h.startLatestEffect(); await h.runTimer();
  assert.equal(new URL(h.calls.at(-1).url).searchParams.get('page'), '1');
  elements(render(), node => node.props?.id === 'report-from')[0].props.onChange({target: {value: '2026-11-30'}});
  const before = h.calls.length;
  await reportAction(render(), 'daily', 'Export CSV')();
  assert.equal(h.calls.length, before); assert.equal(h.downloads.length, 0);
  assert.match(require('react-dom/server').renderToStaticMarkup(render()), /End date must be on or after/);
});

test('report filenames support UTF-8 and safe fallbacks; farmer sessions cannot download admin reports', async () => {
  const h = harness();
  assert.equal(h.client.downloadFilename("attachment; filename*=UTF-8''milk%20report.csv", 'fallback.csv'), 'milk report.csv');
  assert.equal(h.client.downloadFilename(null, 'fallback.csv'), 'fallback.csv');
  assert.equal(h.client.downloadFilename('attachment; filename="../../report.csv"', 'fallback.csv'), 'report.csv');
  h.respond(200, {access: 'farmer-token', user: farmer}); await h.render().login('F001', 'test-only', 'farmer');
  await assert.rejects(h.render().downloadReport('/api/admin/reports/daily-milk/?format=csv', 'report.csv'), error => error.status === 403);
  assert.equal(h.calls.length, 1);
});


test('single login screen switches account type and resets the form by role', () => {
  const h = harness();
  const file = 'components/auth/login-screen.tsx';
  let screen = h.form(file, 'LoginScreen');
  const group = screen.props.children[1];
  const tabs = group.props.children;
  assert.equal(tabs[0].props['aria-pressed'], true);
  assert.equal(screen.props.children[3].props.role, 'farmer');
  tabs[1].props.onClick();
  assert.equal(h.redirects.at(-1), '/login?role=admin');
  h.setSearch('role=admin');
  screen = h.form(file, 'LoginScreen');
  assert.equal(screen.props.children[3].props.role, 'admin');
  assert.equal(screen.props.children[3].key, 'admin');
  screen.props.children[3].props.onBusyChange(true);
  screen = h.form(file, 'LoginScreen');
  assert.ok(screen.props.children[1].props.children.every(tab => tab.props.disabled));
});
