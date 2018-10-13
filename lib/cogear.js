const path = require('path');
const Emittery = require('emittery'); // Async event emitter
require('typescript-require'); // Add TypeScript support
require('coffee-register'); // Add CoffeeScript support
/**
 * Cogear – static sites generator build with Node.JS and Webpack
 */
module.exports = class Cogear extends Emittery {
  constructor() {
    super();
    // Set Cogear.JS as global object
    global.cogear = this;
    // Set package root
    this.baseDir = path.dirname(__dirname);
    // Load plugins
    this
      .load('utils')
      .load('init')
      .load('config')
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
      .load('deploy')
      .load('autoloader')	
      .load('cli');
  }
  /**
   * Load plugin
   * @param {String} plugin 
   */
  load(plugin){
    this.use(require(path.join(this.baseDir,'lib','plugins',...plugin.split('/'))));
    return this;
  }
  /**
   * Use plugin
   * @param {*} Plugin 
   */
  use(Plugin) {
    Plugin.apply();
    return this;
  }
};