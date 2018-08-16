module.exports = {
  plugins: (loader) => [
    require('postcss-import')(),
    require('postcss-preset-env')(),
    require('cssnano')()
  ]
}