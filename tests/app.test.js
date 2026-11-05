// tests/app.test.js — Test suite for To-Do Life Dashboard pure functions
// Uses Node's built-in test runner (node:test) and fast-check for property-based tests.

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { saveToStorage, loadFromStorage } from '../js/app.js';

// ─── Minimal localStorage shim for Node.js ───────────────────────────────────
// Node does not have localStorage; provide a simple in-memory Map-backed shim.
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => { store.set(key, String(value)); },
  removeItem: (key) => { store.delete(key); },
  clear: () => { store.clear(); },
};

// ─── Tests: saveToStorage / loadFromStorage ───────────────────────────────────

describe('saveToStorage and loadFromStorage', () => {
  beforeEach(() => { store.clear(); });

  it('round-trips a plain object', () => {
    const data = { foo: 'bar', n: 42 };
    saveToStorage('test-key', data);
    const result = loadFromStorage('test-key');
    assert.deepEqual(result, data);
  });

  it('round-trips an array', () => {
    const data = [{ id: '1', text: 'hello', completed: false }];
    saveToStorage('tasks', data);
    assert.deepEqual(loadFromStorage('tasks'), data);
  });

  it('round-trips null', () => {
    saveToStorage('null-key', null);
    assert.equal(loadFromStorage('null-key'), null);
  });

  it('returns null for a missing key', () => {
    assert.equal(loadFromStorage('no-such-key'), null);
  });

  it('returns null when stored value is corrupt JSON', () => {
    store.set('bad', '{not valid json,,}');
    assert.equal(loadFromStorage('bad'), null);
  });

  it('throws on quota error (simulated)', () => {
    const original = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = () => {
      const e = new Error('QuotaExceededError');
      e.name = 'QuotaExceededError';
      throw e;
    };
    try {
      assert.throws(
        () => saveToStorage('key', { x: 1 }),
        { name: 'QuotaExceededError' },
      );
    } finally {
      globalThis.localStorage.setItem = original;
    }
  });
});
