const fs = require("fs");
const TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const rootDir = __dirname;

const lambdaDir = "./src/lambda";
const entries = {};
fs.readdirSync(lambdaDir).forEach((d) => {
   fs.readdirSync(`${lambdaDir}/${d}`).forEach((f) => {
      const entry = `${d}${f[0].toUpperCase()}${f.slice(1)}`;
      entries[entry] = `${lambdaDir}/${d}/${f}/index.ts`;
   });
});

module.exports = {
   entry: entries,
   output: {
      filename: "[name]/index.js",
      path: `${rootDir}/dist`,
      libraryTarget: "commonjs",
      clean: true
   },
   //https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/webpack.html
   target: "node",
   resolve: {
      extensions: [".ts", ".js"],
      plugins: [new TsConfigPathsPlugin()],
      fallback: {
         fs: false,
         tls: false,
         net: false,
         path: false,
         zlib: false,
         http: false,
         https: false,
         stream: false,
         crypto: false,
         util: false,
         url: false,
         dns: false,
         buffer: false,
         module: false,
         os: false,
      },
   },
   module: {
      rules: [
         {
            test: /\.ts?$/,
            exclude: /(node_modules)/,
            use: ["ts-loader", "eslint-loader"],
         },
      ],
   },
};