const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const ora = require('ora');
const {forEach} = require('p-iteration');
const chalk = require('chalk');
const now = require("performance-now");
const prettyMs = require("pretty-ms");
const express = require('express')
module.exports = {
	apply(){
		cogear.on('webpack',async()=>{
			if(['production','build','deploy'].includes(cogear.mode)){
				await cogear.emit('resources')
				await this.copy()
			}
		})
		cogear.on('server.init',async()=>{
			if(!['development'].includes(cogear.mode)) return
			cogear.loader.start("Linking resources…")
			await this.init()
			if(cogear.resources.length > 0){
				await forEach(cogear.resources,async dir=>{
					cogear.server.use(express.static(dir))
				})
				cogear.loader.succeed(`${chalk.whiteBright.bold('Resources')} are linked.`)
			}
			else {
				cogear.loader.info(`${chalk.whiteBright.bold('Resources')} folder is not found.`)
			}
		})
	},
	async init(){
		let directory = cogear.config.resourcesDir || 'resources'
		cogear.resources = cogear.config.resources || [directory]
		if(!Array.isArray(cogear.resources)){
			cogear.loader.fail(`Given resources config param is not array.`)
			process.exit()
		}
		cogear.resources = cogear.resources.map(dir => {
			return path.join(cogear.options.src,dir)
		})
		if(cogear.themeDir){
			cogear.resources.push(path.join(cogear.themeDir,directory))
		}
		cogear.resources = cogear.resources.filter(dir => fs.existsSync(dir))
	},	
	async copy(){
		let start = now()
		cogear.loader.start("Loading resources…")
		await this.init()
		await forEach(cogear.resources,async dir=>{
			try {
				await fse.copy(
					dir,
					cogear.options.output
				)
			} catch (e){
				// console.error(e)
			}
		})
		cogear.loader.succeed("Resources are copied to the output folder.")
	},
	// clearFile(file){
	// 	cogear.resources.forEach(resourcePath=>{
	// 		file = file.replace(resourcePath,'')
	// 	})
	// 	return file
	// },
	// async watch(){
	// 	let watcher = require("chokidar").watch(cogear.resources, {
	// 		ignorePermissionErrors: true,
	// 		// awaitWriteFinish: true,
	// 		ignoreInitial: true,
	// 		ignored: /(^|[\/\\])\../
	// 	});
	// 	watcher.on('ready',()=>{
	// 		if(this.watched) return
	// 		this.watched = true
	// 		watcher.on('unlink',(file)=>{
	// 			console.info(chalk.yellow(`Deleted: ${this.clearFile(file)}`))
	// 			try{
	// 				fs.unlinkSync(path.join(cogear.options.output,this.clearFile(file)))
	// 			} catch (e){
	// 				console.error(e)
	// 			}
	// 		})
	// 		watcher.on('add',(file)=>{
	// 			console.info(chalk.yellow(`Added: ${this.clearFile(file)}`))
	// 			try{
	// 				fse.copySync(file,path.join(cogear.options.output,this.clearFile(file)))
	// 			} catch (e){
	// 				console.error(e)
	// 			}
	// 		})
	// 		watcher.on('change',(file)=>{
	// 			console.info(chalk.yellow(`Added: ${this.clearFile(file)}`))
	// 			try{
	// 				fse.copySync(file,path.join(cogear.options.output,this.clearFile(file)))
	// 			} catch (e){
	// 				console.error(e)
	// 			}
	// 		})
		// })
	// }
}