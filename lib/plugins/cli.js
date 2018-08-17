const path = require("path"),
	getopts = require("getopts"),
	boxen = require("boxen");
	ora = require("ora"),
	glob = require("glob"),
	fs = require("fs"),
	fse = require("fs-extra"),
	mkdirp = require("mkdirp"),
	// plural = require("plural"),
	chalk = require("chalk"),
	now = require("performance-now"),
	merge = require("webpack-merge"),
	prettyMs = require("pretty-ms"),
	util = require('util'),
	death = require('death'),
	del = require('del'),
	jsonfile = require('jsonfile');

module.exports = {
	apply(cogear){
		let defaults = {
			alias: {
				s: "src",
				o: "output",
				h: "host",
				p: "port",
				h: "help",
				b: "open",
				w: "verbose",
			},
			default: {
				src: "src",
				output: "public",
				host: "localhost",
				port: 9000,
				quiet: true,
				open: true,
				verbose: false,
			}
		}
		cogear.hooks.cli.tap('Command line interface',(options)=>{
			this.init(cogear,options)
		})
		cogear.hooks.cli.call(defaults)	
	},
	init(cogear, defaults){
		cogear.options = getopts(process.argv.slice(2), defaults);
		if(cogear.options.help){
			cogear.options._[0] = 'help'
		}
		if(cogear.options.v){
			cogear.options._[0] = 'version'
		}
		if(cogear.options.n){
			cogear.options.open = false
		}
		switch (cogear.options._[0]) {
			case "v":
			case "version":
				console.log(cogear.package.version)
				process.exit()
				break;
			case "d":
			case "deploy":
				cogear.hooks.config.call()
				cogear.hooks.deploy.call()
				break;
			case "n":
			case "new":
				cogear.hooks.generators.init.call()
				cogear.hooks.generators.site.call()
				break;
			case "p":
			case "plugin":
				cogear.hooks.generators.init.call('plugin')
				cogear.hooks.generators.plugin.call()
				break;
			case "t":
			case "theme":
				cogear.hooks.generators.init.call('theme')
				cogear.hooks.generators.theme.call()
				break;
			case "b":
			case "build":
				cogear.hooks.init.call()
				cogear.hooks.build.call()
				cogear.hooks.webpackProd.call(false)
				break;
			case "p":
			case "production":
				cogear.options.mode = "production"
				cogear.hooks.init.call()
				cogear.hooks.build.call()
				cogear.hooks.webpackProd.call()
				break;
			case "dev":
			case "development":
			case undefined:
				cogear.options.mode = "development"
				cogear.hooks.init.call()
				cogear.hooks.build.call()
				cogear.hooks.webpackDev.call()
				break;
			case "h":
			case "help":
			default:
				cogear.hooks.help.call(require('../help.js'))
				process.exit()
		}		
	}
}