"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGE_COUNT_WARN = exports.PAGE_DATA_DIR = exports.HEADER_COMMENT = exports.COMMON_BUNDLES = exports.ROOT_WILDCARD = exports.LINK_REGEX = exports.CACHING_HEADERS = exports.IMMUTABLE_CACHING_HEADER = exports.SECURITY_HEADERS = exports.DEFAULT_OPTIONS = exports.NETLIFY_HEADERS_FILENAME = exports.BUILD_CSS_STAGE = exports.BUILD_HTML_STAGE = void 0;
const lodash_1 = __importDefault(require("lodash"));
// Gatsby values
exports.BUILD_HTML_STAGE = `build-html`;
exports.BUILD_CSS_STAGE = `build-css`;
// Plugin values
exports.NETLIFY_HEADERS_FILENAME = `_headers`;
exports.DEFAULT_OPTIONS = {
    headers: {},
    mergeSecurityHeaders: true,
    mergeLinkHeaders: true,
    mergeCachingHeaders: true,
    transformHeaders: lodash_1.default.identity,
    generateMatchPathRewrites: true, // generate rewrites for client only paths
};
exports.SECURITY_HEADERS = {
    "/*": [
        `X-Frame-Options: DENY`,
        `X-XSS-Protection: 1; mode=block`,
        `X-Content-Type-Options: nosniff`,
        `Referrer-Policy: same-origin`,
    ],
};
exports.IMMUTABLE_CACHING_HEADER = `Cache-Control: public, max-age=31536000, immutable`;
exports.CACHING_HEADERS = {
    "/static/*": [exports.IMMUTABLE_CACHING_HEADER],
    "/sw.js": [`Cache-Control: no-cache`],
};
exports.LINK_REGEX = /^(Link: <\/)(.+)(>;.+)/;
exports.ROOT_WILDCARD = `/*`;
exports.COMMON_BUNDLES = [`commons`, `app`];
exports.HEADER_COMMENT = `## Created with gatsby-plugin-netlify`;
exports.PAGE_DATA_DIR = `page-data/`;
exports.PAGE_COUNT_WARN = 1000;
