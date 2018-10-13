
# Changelog

## v1.2.16 
* Remove -y option from CLI. If name is given no questions would be asked by interface.

## v1.2.2
* Moved to Commander.JS for cli arguments processing.
* Added nicey WebpackBar to display compiling process.
* Updated performance measurements.
* Huge speed upgrades for Webpack with HardSourceWebpackPlugin.

## v1.2.0

* Added new hooks for cogear-plugin-blog.
* Added watcher for config.yaml which re-compiles all pages on config
changes.
* Refactor core plugins for webpack.
* Refactor preload and build.
* Resources in dev mode are being linked now (just serve static byexpress from given folders) instead of copied.

## v1.1

* Replaced [HTMLWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/) because its extremly slow if page count is over thousand with simple _webpack-compiled_ assets injection.
* Changed workflow from `Webpack → Build` to `Preload → Webpack → Build`.
* Make almost all processing operations asynchronously – huge speed performance.<br>Build of __10.000 pages__ _(~ 3 pages per day in 10 years)_ tooks __14s__ now.
