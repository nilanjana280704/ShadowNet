/**
 * React Native CLI config.
 * Registers bundled fonts so `npx react-native-asset` links them into the
 * native Android and iOS projects. Run `npx react-native-asset` after adding
 * or removing font files here.
 */
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
};
