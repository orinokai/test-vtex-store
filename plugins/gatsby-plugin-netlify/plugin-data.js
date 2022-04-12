"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrefixer = void 0;
const path_1 = __importDefault(require("path"));
function buildPrefixer(prefix, ...paths) {
    return (...subpaths) => path_1.default.join(prefix, ...paths, ...subpaths);
}
exports.buildPrefixer = buildPrefixer;
// This function assembles data across the manifests and store to match a similar
// shape of `static-entry.js`. With it, we can build headers that point to the correct
// hashed filenames and ensure we pull in the componentChunkName.
function makePluginData(store, assetsManifest, pathPrefix) {
    const { program, pages, components } = store.getState();
    const publicFolder = buildPrefixer(program.directory, `public`);
    const stats = require(publicFolder(`webpack.stats.json`));
    // Get all the files, not just the first
    const chunkManifest = stats.assetsByChunkName;
    // We combine the manifest of JS and the manifest of assets to make a lookup table.
    const manifest = { ...assetsManifest, ...chunkManifest };
    return {
        pages,
        components,
        manifest,
        pathPrefix,
        publicFolder,
    };
}
exports.default = makePluginData;
