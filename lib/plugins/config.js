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
require('require-yaml')

module.exports = {
	apply(cogear){
		cogear.hooks.config.tap('Loading configs',()=>{
			this.init(cogear)
		})
	},
	loadConfig(cogear){
		let config = path.join(process.cwd(), "config");
		let defaults = { 
			title: "Cogear.JS – modern static websites generator",
			theme: "default", 
			host: "localhost",
			port: 9000
		}
		try {
			cogear.config = merge(defaults,require(config))
		} catch (e) {
			cogear.config = defaults;
		}
	},
	init(cogear){
		cogear.hooks.banner.call()
		cogear.loader = ora().start().succeed(`Current working dir: ${chalk.bold(process.cwd().replace(os.homedir(),'~'))}`)
		// Set source folder
		cogear.options.src = path.join(process.cwd(), cogear.options.src);
		if(!fs.existsSync(cogear.options.src)){
			ora().fail(`The source directory doesn't exists.\n\n${chalk.bold.underline('Options:')}\n1. Set it with ${chalk.bold('-s')} arg. \nExample: ${chalk.bold('> cogear -s ./src')} \n2. Use ${chalk.bold('> cogear new')} command to generate new site.`)
			process.exit()
		}
		if(!cogear.config) this.loadConfig() // Really loading it in autoloader.js to get plugins
		if(cogear.options.host) cogear.config.host = cogear.options.host
		if(cogear.options.port) cogear.config.port = cogear.options.port
		// Set output folder
		cogear.options.output = path.join(process.cwd(), cogear.options.output);
		cogear.pageFormats = ['md','html','ejs','hbs','pug']
		cogear.buildDir = path.join(process.cwd(), ".build");
		cogear.options.srcPages = path.join(cogear.options.src,'pages')
		
		if(cogear.config.theme !== false){
			cogear.loader.start()
			cogear.loader.info(`Loading theme… ${chalk.bold(cogear.config.theme)}`)
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
					cogear.loader.succeed(`Theme ${chalk.bold(cogear.config.theme)} is loaded!`)
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