module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['react-native-gesture-handler/jestSetup', '<rootDir>/jest/setup.js'],
  fakeTimers: { enableGlobally: true },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community|-firebase|-async-storage)?/|@react-navigation/|react-native-.*|react-redux|@reduxjs/|immer|redux|redux-thunk|reselect)',
  ],
};
