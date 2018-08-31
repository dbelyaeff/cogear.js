const path = require("path");
const ora = require("ora");
const glob = require("glob");
const fs = require("fs");
const fse = require("fs-extra");
const mkdirp = require("mkdirp");
const chalk = require("chalk");
const now = require("performance-now");
const merge = require("webpack-merge");
const prettyMs = require("pretty-ms");
const util = require('util');
const del = require('del');
const os = require('os')
const decache = require('decache')
require('require-yaml')


module.exports = {
	apply(){
		cogear.flags = {}
		cogear.on('config',async ()=>{
			await this.init()
		})
		cogear.on('build.done',async()=>{
			// Config watcher
			if(cogear.mode == 'development'){
				if(this.watcher) return
				this.watcher = require('chokidar').watch(require.resolve(path.join(process.cwd(), "config")))
				this.watcher.on('change',async file=>{
					decache(require.resolve(path.join(process.cwd(),"config")))
					await this.loadConfig()
					cogear.loader.info('Config has changed…')
					await cogear.emit('preload',cogear.webpackConfig) // Re-preload all pages
					await cogear.emit('build',cogear.compilation) // Rebuild all pages
					cogear.hotMiddleware.publish({ action: "reload" });
				})	
			}

		})
	},
	async loadConfig(){
		return new Promise((resolve,reject)=>{
			let defaults = { 
				title: "Cogear.JS – modern static websites generator",
				theme: "default", 
				host: "localhost",
				port: 9000,
				notify: true
			}
			try {
				cogear.config = merge(defaults,require(path.join(process.cwd(), "config")))
			} catch (e) {
				cogear.config = defaults;
			}
			resolve()
		})
	},
	async init(){
		await cogear.emit('banner')
		await cogear.emit('banner.after')
		cogear.loader = cogear.loader || ora()
		cogear.loader.succeed(`Current working dir: ${chalk.bold(process.cwd().replace(os.homedir(),'~'))}`)
		// Set source folder
		cogear.options.src = path.join(process.cwd(), cogear.options.src);
		if(!fs.existsSync(cogear.options.src)){
			cogear.loader.fail(`The source directory doesn't exists.\n\n${chalk.bold.underline('Options:')}\n1. Set it with ${chalk.bold('-s')} arg. \nExample: ${chalk.bold('> cogear -s ./src')} \n2. Use ${chalk.bold('> cogear new')} command to generate new site.`)
			process.exit()
		}
		if(!cogear.config){
			await this.loadConfig() // Really loading it in autoloader.js to get plugins
		}
		if(cogear.options.host) cogear.config.host = cogear.options.host
		if(cogear.options.port) cogear.config.port = cogear.options.port
		// Set output folder
		cogear.options.output = path.join(process.cwd(), cogear.options.output);
		cogear.pageFormats = ['md','html','ejs','hbs','pug']
		// cogear.buildDir = path.join(process.cwd(), ".build");
		cogear.options.srcPages = path.join(cogear.options.src,'pages')
		
		if(cogear.config.theme !== false){
			cogear.loader.start()
			cogear.loader.text = `Loading theme… ${chalk.bold(cogear.config.theme)}`
			let themeDirs = [
			path.join(process.cwd(),'themes',cogear.config.theme), // Local ./theme folder
			path.join(process.cwd(),'themes','cogear-theme-' + cogear.config.theme.replace("cogear-theme-",'')), // node_modules folder, npm package
			path.join(process.cwd(),'node_modules','cogear-theme-' + cogear.config.theme.replace("cogear-theme-",'')) // node_modules folder, npm package
			]
			themeDirs.some((themePath) => {
				if(fs.existsSync(themePath)){
					let configPath = path.join(themePath, "config")
					cogear.themeDir = themePath		
					let defaultConfig = {
						autoload: true
					}
					try {
						cogear.themeConfig = merge(defaultConfig,require(configPath))
					}
					catch (e) {
						cogear.themeConfig = defaultConfig
					} 
					cogear.loader.succeed(`Theme ${chalk.bold(cogear.config.theme)}.`)
					return true
				}
			})
			if(!cogear.themeDir){
				cogear.loader.warn(`Theme ${chalk.bold(cogear.config.theme)} is not found.\nInstall ${chalk.bold('cogear-theme-default')} npm package or any other.\nI'll try to use source dir ${chalk.bold('layouts')} folders.\nMore info: https://cogearjs.org/docs/themes`)
			}
		} else {
			cogear.loader.info(`Theme is disabled.`)
		}
	}
}