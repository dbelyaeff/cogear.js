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
	apply(){
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
		cogear.on('cli',async(options)=>{
			await this.init(options)
		})
		cogear.emit('cli',defaults)	
	},
	async init(defaults){
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
				cogear.package = require(path.join(cogear.baseDir,'package.json'))
				console.log(cogear.package.version)
				process.exit()
				break;
			case "d":
			case "deploy":
				cogear.mode = "deploy"
				await cogear.emit('init')
				cogear.emit('deploy')
				break;
			case "n":
			case "new":
				await cogear.emit('generators.init','site')
				cogear.emit('generators.site')
				break;
			case "p":
			case "plugin":
				await cogear.emit('generators.init','plugin')
				cogear.emit('generators.plugin')
				break;
			case "t":
			case "theme":
				await cogear.emit('generators.init','theme')
				cogear.emit('generators.theme')
				break;
			case "b":
			case "build":
				cogear.mode = "build"
				await cogear.emit('init')
				cogear.options.open = false
				cogear.on('webpack.afterEmit',async(compilation)=>{
					await cogear.emit('build',compilation)
				})
				await cogear.emit('webpack',{
					mode: 'production',
				})
				break;
			case "prod":
			case "production":
				cogear.mode = "production"
				await cogear.emit('init')
				cogear.on('webpack.done',async (compilation)=>{
					if(!cogear.webpackFirstDone){
						await cogear.emit('build',compilation)
					}
				})
				await cogear.emit('webpack',{
					mode: cogear.mode
				})
				break;
			case "dev":
			case "development":
			case undefined:
				cogear.mode = "development"
				await cogear.emit('init')
				cogear.on('webpack.done',async(compilation)=>{
					if(!cogear.webpackFirstDone){
						await cogear.emit('build',compilation)
					}
				})
				await cogear.emit('webpack',{
					mode: cogear.mode
				})
				break;
			case "h":
			case "help":
			default:
				await cogear.emit('help',{
					help: require('../help.js')
				})
				process.exit()
		}		
	}
}