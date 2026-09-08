import assert from 'node:assert/strict';
import { test } from 'node:test';

import { supportsFeatureX } from '../platform.ts';

test('android: API level >= 31 supports feature X', () => {
  assert.equal(supportsFeatureX({ OS: 'android', Version: 31 }), true);
  assert.equal(supportsFeatureX({ OS: 'android', Version: 33 }), true);
});

test('android: API level < 31 does not support feature X', () => {
  assert.equal(supportsFeatureX({ OS: 'android', Version: 30 }), false);
});

test('ios: major version >= 15 supports feature X', () => {
  assert.equal(supportsFeatureX({ OS: 'ios', Version: '15.0' }), true);
  assert.equal(supportsFeatureX({ OS: 'ios', Version: '17.4.1' }), true);
});

test('ios: major version < 15 does not support feature X', () => {
  assert.equal(supportsFeatureX({ OS: 'ios', Version: '14.8' }), false);
});

test('unknown platform never supports feature X', () => {
  assert.equal(supportsFeatureX({ OS: 'web', Version: '1' }), false);
});
