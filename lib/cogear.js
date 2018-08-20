'use strict'
const { SyncHook, AsyncSeriesHook, AsyncParallelHook } = require("tapable");

const path = require('path');

/**
 * Cogear – static sites generator build with Node.JS and Webpack
 */
module.exports = class Cogear {
	constructor() {
		// Set cogear as global variable
		global.cogear = this
		this.baseDir = path.dirname(__dirname)
		this.hooks = {
			cli: new SyncHook(["defaults"]),
			banner: new SyncHook(),
			init: new SyncHook(),
			config: new SyncHook(),
			death: new SyncHook(),
			build: new AsyncSeriesHook(),
			buildDone: new SyncHook(), // When `cogear build` command is finished
			clearBuild: new SyncHook(),
			buildPage: new AsyncParallelHook(["file"]),
			beforeParse: new SyncHook(["parser"]),
			afterParse: new SyncHook(["parser"]),
			webpack: new SyncHook(["config"]), // To hook config
			webpackProd: new SyncHook(["startServer"]),
			webpackDev: new SyncHook(),
			help: new SyncHook(["help"]),
			generators: {
				init: new SyncHook(["type"]),
				site: new SyncHook(),
				plugin: new SyncHook(),
				theme: new SyncHook(),
			},
			deploy: new SyncHook()
		}
		this
		.load('utils')
		.load('init')
		.load('config')
		.load('help')
		.load('death')
		.load('build')
		.load('clearBuild')
		.load('buildPage')
		// .load('loadPagesForWebpack')
		.load('openBrowser')
		.load('webpack.dev')
		.load('webpack.prod')
		.load('generators/init')
		.load('generators/site')
		.load('generators/plugin')
		.load('generators/theme')
		.load('autoloader')	
		.load('deploy')
		.load('cli')
	}
	/**
	 * Load plugin
	 */
	load(plugin){
		this.use(require(path.join(this.baseDir,'lib','plugins',...plugin.split('/'))))
		return this
	}
	/**
	 * Use a plugin
	 *
	 * @param Object Plugin
	 */
	use(Plugin) {
		Plugin.apply();
		return this;
	}
}