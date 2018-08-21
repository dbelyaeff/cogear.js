'use strict'
const Hook = require("./utils/hook");

const path = require('path');
const Emittery = require('emittery'); // Async event emitter
/**
 * Cogear – static sites generator build with Node.JS and Webpack
 */
module.exports = class Cogear extends Emittery {
	constructor() {
		super()
		// Set cogear as global variable
		global.cogear = this
		// Set package root
		this.baseDir = path.dirname(__dirname)
		// Load plugins
		this
		.load('utils')
		.load('init')
		.load('config')
		.load('help')
		.load('death')
		.load('resources')
		.load('clear')
		.load('theme')
		.load('preload')
		.load('webpack.dev')
		.load('webpack.prod')
		.load('build')
		.load('openBrowser')
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