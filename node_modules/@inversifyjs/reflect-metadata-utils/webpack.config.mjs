// @ts-check

import path from 'node:path';

import buildWebpackConfig from '@inversifyjs/foundation-webpack-config';

const outputPath = path.resolve(import.meta.dirname, 'lib/esm');

/** @type {!import("webpack").Configuration} */
export default {
  ...buildWebpackConfig(outputPath),
};
