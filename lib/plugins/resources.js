const path = require('path');
const fse = require('fs-extra');
const ora = require('ora');
const {forEach} = require('p-iteration');
const chalk = require('chalk');
const now = require("performance-now");
const prettyMs = require("pretty-ms");

module.exports = {
	apply(){
		cogear.on('preload',async()=>{
			await cogear.emit('resources')
			await this.copy()
			if(cogear.mode == 'development'){
				this.watch()
			}
		})
	},
	async copy(){
		let start = now()
		let loader = ora().start("Loading resources…")
		let directory = cogear.config.resourcesDir || 'resources'
		cogear.resources = cogear.config.resources || [directory]
		if(!Array.isArray(cogear.resources)){
			loader.fail(`Given resources config param is not array.`)
			process.exit()
		}
		cogear.resources = cogear.resources.map(dir => {
			return path.join(cogear.options.src,dir)
		})
		if(cogear.themeDir){
			cogear.resources.push(path.join(cogear.themeDir,directory))
		}
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
		loader.succeed("Resources are copied to the output folder.")
	},
	clearFile(file){
		cogear.resources.forEach(resourcePath=>{
			file = file.replace(resourcePath,'')
		})
		return file
	},
	async watch(){
		let watcher = require("chokidar").watch(cogear.resources, {
			ignorePermissionErrors: true,
			// awaitWriteFinish: true,
			ignoreInitial: true,
			ignored: /(^|[\/\\])\../
		});
		watcher.on('ready',()=>{
			if(this.watched) return
			this.watched = true
			watcher.on('unlink',(file)=>{
				console.info(chalk.yellow(`Deleted: ${this.clearFile(file)}`))
				try{
					fs.unlinkSync(path.join(cogear.options.output,this.clearFile(file)))
				} catch (e){
					console.error(e)
				}
			})
			watcher.on('add',(file)=>{
				console.info(chalk.yellow(`Added: ${this.clearFile(file)}`))
				try{
					fse.copySync(file,path.join(cogear.options.output,this.clearFile(file)))
				} catch (e){
					console.error(e)
				}
			})
			watcher.on('change',(file)=>{
				console.info(chalk.yellow(`Added: ${this.clearFile(file)}`))
				try{
					fse.copySync(file,path.join(cogear.options.output,this.clearFile(file)))
				} catch (e){
					console.error(e)
				}
			})
		})
	}
}