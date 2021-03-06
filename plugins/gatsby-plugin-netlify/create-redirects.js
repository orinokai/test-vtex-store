"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const constants_1 = require("./constants");
// eslint-disable-next-line max-statements
async function writeRedirectsFile(pluginData, redirects, rewrites) {
    const { publicFolder } = pluginData;
    if (redirects.length === 0 && rewrites.length === 0)
        return null;
    const FILE_PATH = publicFolder(`_redirects`);
    // https://www.netlify.com/docs/redirects/
    const NETLIFY_REDIRECT_KEYWORDS_ALLOWLIST = new Set([
        `query`,
        `conditions`,
        `headers`,
        `signed`,
        `edge_handler`,
        `Language`,
        `Country`,
    ]);
    // Map redirect data to the format Netlify expects
    redirects = redirects.map((redirect) => {
        const { fromPath, isPermanent, redirectInBrowser, force, toPath, statusCode, ...rest } = redirect;
        let status = isPermanent ? `301` : `302`;
        if (statusCode)
            status = String(statusCode);
        if (force)
            status = `${status}!`;
        // The order of the first 3 parameters is significant.
        // The order for rest params (key-value pairs) is arbitrary.
        const pieces = [fromPath, toPath, status];
        for (const key in rest) {
            const value = rest[key];
            if (typeof value === `string` && value.includes(` `)) {
                console.warn(`Invalid redirect value "${value}" specified for key "${key}". ` + `Values should not contain spaces.`);
            }
            else if (NETLIFY_REDIRECT_KEYWORDS_ALLOWLIST.has(key)) {
                pieces.push(`${key}=${value}`);
            }
        }
        return pieces.join(`  `);
    });
    rewrites = rewrites.map(({ fromPath, toPath }) => `${fromPath}  ${toPath}  200`);
    let commentFound = false;
    // Websites may also have statically defined redirects
    // In that case we should append to them (not overwrite)
    // Make sure we aren't just looking at previous build results though
    const fileExists = (0, fs_extra_1.existsSync)(FILE_PATH);
    let fileContents = ``;
    if (fileExists) {
        fileContents = await (0, fs_extra_1.readFile)(FILE_PATH, `utf8`);
        commentFound = fileContents.includes(constants_1.HEADER_COMMENT);
    }
    let data;
    if (commentFound) {
        const [theirs] = fileContents.split(`\n${constants_1.HEADER_COMMENT}\n`);
        data = theirs;
    }
    else {
        data = fileContents;
    }
    return (0, fs_extra_1.writeFile)(FILE_PATH, [data, constants_1.HEADER_COMMENT, ...redirects, ...rewrites].join(`\n`));
}
exports.default = writeRedirectsFile;
