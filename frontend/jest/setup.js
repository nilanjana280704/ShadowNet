/* eslint-env jest */
/**
 * Jest setup — mocks native-backed modules so component render tests run in the
 * JS environment. react-native-svg and lucide-react-native render via native
 * SVG; here they resolve to plain Views.
 */

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Svg = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }, props.children)
  );
  return new Proxy(
    { __esModule: true, default: Svg },
    { get: (target, prop) => (prop in target ? target[prop] : Svg) }
  );
});

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((k) => Promise.resolve(k in store ? store[k] : null)),
      setItem: jest.fn((k, v) => {
        store[k] = v;
        return Promise.resolve();
      }),
      removeItem: jest.fn((k) => {
        delete store[k];
        return Promise.resolve();
      }),
      multiRemove: jest.fn((keys) => {
        keys.forEach((k) => delete store[k]);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
    },
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Glyph = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }, props.children)
  );
  return new Proxy(
    { __esModule: true },
    { get: (target, prop) => (prop in target ? target[prop] : Glyph) }
  );
});
