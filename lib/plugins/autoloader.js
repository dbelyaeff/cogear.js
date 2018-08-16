const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const plural = require("plural")
const glob = require("glob")
const { loadConfig } = require("./config")
module.exports = {
	apply(cogear){
		// To look for config-defined plugins
		loadConfig(cogear)
		// Load cogear package.json
		cogear.package = cogear.requirePackageJSON()
		let localPluginsPath = path.join(process.cwd(),'plugins')
		let plugins = []
		if(cogear.config.plugins){
			cogear.config.plugins.forEach(plugin=>{
				cogear.use(require(require.resolve(plugin,{
					paths: [
						localPluginsPath
					]
				})))
				plugins.push(plugin)
			})
		}
		else {
			if(fs.existsSync(localPluginsPath)){
				let localPlugins = glob.sync("*/package.json",{cwd:localPluginsPath})
				localPlugins.forEach( pkg => {
					let plugin = path.basename(path.dirname(pkg))
					cogear.use(require(require.resolve(plugin,{
						paths: [
							localPluginsPath
						]
					})))
					plugins.push(plugin)
				})
			}
			// Load current site package.json
			let packagePath = path.join(process.cwd(),'package.json')
			if(fs.existsSync(packagePath)){
				package = cogear.requirePackageJSON(packagePath)
				let npmPlugins = Object.keys(package.dependencies).filter(plugin => plugin.indexOf('cogear-plugin-') !== -1);
				npmPlugins.forEach( plugin => {	
					cogear.use(require(require.resolve(plugin,{
						paths: [
							path.join(process.cwd())
						]
					})))
					plugins.push(plugin)
				})
			} 
		}
		
		cogear.hooks.init.tap('Log loaded plugins',()=>{
			let loader = ora().start()
			loader.succeed(`Current site ${chalk.bold('package.json')} is loaded.`)
			if(plugins.length){
				loader.info(`Found ${plugins.length} ${plural('plugin',plugins.length)}…`)
				plugins.forEach( plugin => {	
					loader.succeed(`Plugin ${chalk.bold(plugin)} is loaded.`)
					loader.start()		
				})
				loader.succeed('All plugins are loaded.');
			}
		})
	}
}