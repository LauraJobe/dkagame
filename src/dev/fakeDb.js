// Development stand-in for firebase/database, shared across tabs via localStorage.
// Used only by `npm run mock` for local testing; never part of the real build.
const KEY = 'fakeDb';
const listeners = new Set();

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};
const save = (tree) => {
  localStorage.setItem(KEY, JSON.stringify(tree));
  listeners.forEach((l) => l());
};
window.addEventListener('storage', (e) => { if (e.key === KEY) listeners.forEach((l) => l()); });

const parts = (p) => p.split('/').filter(Boolean);
function getAt(tree, path) {
  let node = tree;
  for (const k of parts(path)) {
    if (node == null || typeof node !== 'object') return null;
    node = node[k];
  }
  return node === undefined ? null : node;
}
function prune(v) {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== 'object') return v;
  const out = Array.isArray(v) ? [] : {};
  for (const [k, val] of Object.entries(v)) {
    const p = prune(val);
    if (p !== undefined) out[k] = p;
  }
  return Object.keys(out).length ? out : undefined;
}
function setAt(tree, path, value) {
  const ks = parts(path);
  if (!ks.length) return prune(value) || {};
  let node = tree;
  for (let i = 0; i < ks.length - 1; i++) {
    if (node[ks[i]] == null || typeof node[ks[i]] !== 'object') node[ks[i]] = {};
    node = node[ks[i]];
  }
  const v = prune(JSON.parse(JSON.stringify(value ?? null)));
  if (v === undefined) delete node[ks[ks.length - 1]];
  else node[ks[ks.length - 1]] = v;
  return tree;
}

const snap = (path, val) => ({
  exists: () => val !== null && val !== undefined,
  val: () => (val === undefined ? null : JSON.parse(JSON.stringify(val))),
  ref: { path },
  forEach(cb) {
    if (val && typeof val === 'object') for (const k of Object.keys(val)) cb(snap(`${path}/${k}`, val[k]));
  },
});

export const getDatabase = () => ({});
export const ref = (_db, path = '') => ({ path });
export const orderByChild = (k) => ({ type: 'order', k });
export const endAt = (v) => ({ type: 'end', v });
export const query = (r, ...c) => ({ path: r.path, constraints: c });

export async function get(r) {
  let val = getAt(load(), r.path);
  if (r.constraints && val && typeof val === 'object') {
    const order = r.constraints.find((c) => c.type === 'order');
    const end = r.constraints.find((c) => c.type === 'end');
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (!order || !end || (v && v[order.k] != null && v[order.k] <= end.v)) out[k] = v;
    }
    val = out;
  }
  return snap(r.path, val);
}
export async function set(r, value) { save(setAt(load(), r.path, value)); }
export async function remove(r) { save(setAt(load(), r.path, null)); }
export async function update(r, obj) {
  let tree = load();
  for (const [k, v] of Object.entries(obj)) tree = setAt(tree, `${r.path}/${k}`, v);
  save(tree);
}
export function onValue(r, cb) {
  let last;
  const fire = () => {
    const v = getAt(load(), r.path);
    const s = JSON.stringify(v);
    if (s === last) return;
    last = s;
    cb(snap(r.path, v));
  };
  listeners.add(fire);
  setTimeout(fire, 0);
  return () => listeners.delete(fire);
}
