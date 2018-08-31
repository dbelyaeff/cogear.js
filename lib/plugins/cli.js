const commander = require('commander')
const path = require("path");
const getopts = require("getopts");
const boxen = require("boxen");
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
const death = require('death');
const del = require('del');
const jsonfile = require('jsonfile');
const {performance} = require('perf_hooks')

global.performance = performance

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
				n: "no-open",
			},
			default: {
				src: "src",
				output: "public",
				host: "localhost",
				port: 9000,
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
		if(cogear.options.n){
			cogear.options.open = false
		}
		if(cogear.options.port && typeof cogear.options.port !== 'number'){
			cogear.options.port = 0 // Random port
		}

		cogear.package = require(path.join(cogear.baseDir,'package.json'))
		commander.usage(`${chalk.bold.whiteBright('cogear')} [command] [options]`)
		commander
			.version(cogear.package.version,'-v, --version','Show version number.')
			.option('-s, --source [string]','custom source directory.')
			.option('-o, --output [string]','custom output directory.')
			// .option('-c, --config [string]','custom config file.')
			.option('-p, --port   [int]','port to serve site on.',parseInt)
			.option('-h, --host   [string]','host to serve site on.')
			.option('-n, --no-open','do not open browser window automatically after built.')
			.option('-w, --verbose','verbose Webpack output.')
			.option('-y, --yes','ignore all questions (for generators).')
		
		commander
			.command('development')
			.alias('dev')
			.description('Development mode with hot-reload (default).')
			.action(this.development)

		commander
			.command('production')
			.alias('prod')
			.description('Production mode: build and serve.')
			.action(async()=>{
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
			})

		commander
			.command('build')
			.alias('b')
			.description('Build mode: just build.')
			.action(async()=>{
				cogear.mode = "build"
				await cogear.emit('init')
				cogear.options.open = false
				cogear.on('webpack.afterEmit',async(compilation)=>{
					await cogear.emit('build',compilation)
				})
				await cogear.emit('webpack',{
					mode: 'production',
				})
			})
		
		commander
			.command('deploy <preset>')
			.alias('d')
			.description('Deploy mode: build (if not) and deploy.')
			.action(async()=>{
				cogear.mode = "deploy"
				await cogear.emit('init')
				await cogear.emit('deploy')
			})
		
		commander
			.command('new <site-name>')
			.alias('init')
			.option('-y','Ignore questions.')
			.description('Generate new site.')
			.action(async()=>{
				await cogear.emit('generators.init','site')
				cogear.emit('generators.site')
			})
	
		commander
			.command('plugin <plugin-name>')
			.alias('p')
			.option('-y','Ignore questions.')
			.description('Generate new plugin.')
			.action(async()=>{
				await cogear.emit('generators.init','plugin')
				cogear.emit('generators.plugin')
			})

		commander
			.command('theme <theme-name>')
			.alias('t')
			.option('-y','Ignore questions.')
			.description('Generate new theme.')
			.action(async()=>{
				await cogear.emit('generators.init','theme')
				cogear.emit('generators.theme')
			})
		
		await cogear.emit('commander',commander)
		if(cogear.options.help){
			commander.help((help)=>{
				return boxen(`\n${chalk.bold.whiteBright('Cogear.JS – modern static websites generator.')}\n\nv${cogear.package.version}\n\n(help)\n\n${chalk.bold.whiteBright('https://cogearjs.org')}`, {
					padding: {top: 1, bottom: 1,left: 8,right: 8},
					margin: 0,
					dimBorder: true,
					align: "center",
					borderStyle: "single-double",
					borderColor: "magenta"
				}) + `
${chalk.white('Runs in development mode by default (without [command]).')}
${help}
More info: ${chalk.bold.whiteBright('https://cogearjs.org')}
`
			})
		}
		commander.parse(process.argv)
		if(!commander.args.length){
			await this.development()
		}
	},
	async development(){
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
	},
}