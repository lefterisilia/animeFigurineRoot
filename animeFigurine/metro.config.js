const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for 3D model file formats
config.resolver.assetExts.push(
  // 3D model formats
  'glb',
  'gltf',
  'obj',
  'mtl',
  // Texture formats
  'hdr',
  'ktx'
);

module.exports = config;
