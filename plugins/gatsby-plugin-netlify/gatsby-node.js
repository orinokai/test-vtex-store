'use strict'
// https://www.netlify.com/docs/headers-and-basic-auth/
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.onPreInit = () => {
  console.log('Testing local plugin...')
}
exports.onPostBuild =
  exports.onCreateWebpackConfig =
  exports.pluginOptionsSchema =
    void 0
const fs_1 = require('fs')
const path_1 = require('path')
const gatsby_core_utils_1 = require('gatsby-core-utils')
const webpack_assets_manifest_1 = __importDefault(
  require('webpack-assets-manifest')
)
const build_headers_program_1 = __importDefault(
  require('./build-headers-program')
)
const constants_1 = require('./constants')
const create_redirects_1 = __importDefault(require('./create-redirects'))
const plugin_data_1 = __importDefault(require('./plugin-data'))
const assetsManifest = {}
/** @type {import("gatsby").GatsbyNode["pluginOptionsSchema"]} */
const pluginOptionsSchema = ({ Joi }) => {
  const MATCH_ALL_KEYS = /^/
  // headers is a specific type used by Netlify: https://www.gatsbyjs.com/plugins/gatsby-plugin-netlify/#headers
  const headersSchema = Joi.object()
    .pattern(MATCH_ALL_KEYS, Joi.array().items(Joi.string()))
    .description(`Add more Netlify headers to specific pages`)
  return Joi.object({
    headers: headersSchema,
    allPageHeaders: Joi.array()
      .items(Joi.string())
      .description(`Add more headers to all the pages`),
    mergeSecurityHeaders: Joi.boolean().description(
      `When set to false, turns off the default security headers`
    ),
    mergeLinkHeaders: Joi.boolean().description(
      `When set to false, turns off the default gatsby js headers`
    ),
    mergeCachingHeaders: Joi.boolean().description(
      `When set to false, turns off the default caching headers`
    ),
    transformHeaders: Joi.function()
      .maxArity(2)
      .description(
        `Transform function for manipulating headers under each path (e.g.sorting), etc. This should return an object of type: { key: Array<string> }`
      ),
    generateMatchPathRewrites: Joi.boolean().description(
      `When set to false, turns off automatic creation of redirect rules for client only paths`
    ),
  })
}
exports.pluginOptionsSchema = pluginOptionsSchema
// Inject a webpack plugin to get the file manifests so we can translate all link headers
/** @type {import("gatsby").GatsbyNode["onCreateWebpackConfig"]} */
const onCreateWebpackConfig = ({ actions, stage }) => {
  if (
    stage !== constants_1.BUILD_HTML_STAGE &&
    stage !== constants_1.BUILD_CSS_STAGE
  ) {
    return
  }
  actions.setWebpackConfig({
    plugins: [
      new webpack_assets_manifest_1.default({
        // mutates object with entries
        assets: assetsManifest,
        merge: true,
      }),
    ],
  })
}
exports.onCreateWebpackConfig = onCreateWebpackConfig
/** @type {import("gatsby").GatsbyNode["onPostBuild"]} */
const onPostBuild = async (
  { store, pathPrefix, reporter },
  userPluginOptions
) => {
  const pluginData = (0, plugin_data_1.default)(
    store,
    assetsManifest,
    pathPrefix
  )
  const pluginOptions = { ...constants_1.DEFAULT_OPTIONS, ...userPluginOptions }
  const { redirects, pages, functions = [], program } = store.getState()
  if (
    pages.size > constants_1.PAGE_COUNT_WARN &&
    (pluginOptions.mergeCachingHeaders || pluginOptions.mergeLinkHeaders)
  ) {
    reporter.warn(
      `[gatsby-plugin-netlify] Your site has ${pages.size} pages, which means that the generated headers file could become very large. Consider disabling "mergeCachingHeaders" and "mergeLinkHeaders" in your plugin config`
    )
  }
  reporter.info(`[gatsby-plugin-netlify] Creating SSR/DSG redirects...`)
  let count = 0
  const rewrites = []
  let needsFunctions = functions.length !== 0
  ;[...pages.values()].forEach((page) => {
    const { mode, matchPath, path } = page
    if (mode === `SSR` || mode === `DSG`) {
      needsFunctions = true
      const fromPath =
        matchPath !== null && matchPath !== void 0
          ? matchPath.replace(/\*.*/, '*')
          : path
      const toPath =
        mode === `SSR`
          ? `/.netlify/functions/__ssr`
          : `/.netlify/functions/__dsg`
      count++
      rewrites.push(
        {
          fromPath,
          toPath,
        },
        {
          fromPath: (0, gatsby_core_utils_1.generatePageDataPath)(
            `/`,
            fromPath
          ),
          toPath,
        }
      )
    } else if (
      pluginOptions.generateMatchPathRewrites &&
      matchPath &&
      matchPath !== path
    ) {
      rewrites.push({
        fromPath: matchPath.replace(/\*.*/, '*'),
        toPath: path,
      })
    }
  })
  reporter.info(
    `[gatsby-plugin-netlify] Created ${count} SSR/DSG redirect${
      count === 1 ? `` : `s`
    }...`
  )
  if (!needsFunctions) {
    reporter.info(
      `[gatsby-plugin-netlify] No Netlify functions needed. Skipping...`
    )
    await fs_1.promises.writeFile(
      (0, path_1.join)(
        program.directory,
        `.cache`,
        `.nf-skip-gatsby-functions`
      ),
      ``
    )
  }
  await Promise.all([
    (0, build_headers_program_1.default)(pluginData, pluginOptions, reporter),
    (0, create_redirects_1.default)(pluginData, redirects, rewrites),
  ])
}
exports.onPostBuild = onPostBuild
