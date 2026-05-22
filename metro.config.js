const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This repo includes agent/docs/workspace folders that are not part of the
// mobile app. Blocking them keeps Expo Go startup focused on the game bundle
// instead of crawling the embedded mission-control app and memory files.
config.resolver.blockList = [
  /workspace[\\/].*$/,
  /docs[\\/].*$/,
  /memory[\\/].*$/,
  /artifacts[\\/].*$/,
  /\.openclaw[\\/].*$/,
];

module.exports = config;
