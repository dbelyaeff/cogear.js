const path = require("path");
const ora = require("ora");
const glob = require("glob");
const fs = require("fs");
const fse = require("fs-extra");
const mkdirp = require("mkdirp");
const plural = require("plural");
const chalk = require("chalk");
const now = require("performance-now");
const prettyMs = require("pretty-ms");
const yamlFront = require("yaml-front-matter");
cogear.parser = require("../utils/parser")();
const {forEach} = require('p-iteration')
module.exports = {
	apply(){
		cogear.on('build',(compilation)=>{
			this.compilation = compilation
		  this.build()
		})
		cogear.on('build.page',async(page)=>{
			if(typeof page == 'string'){ // If it's a path
				let results = await cogear.emit('preload.page',page)
				page = results.pop()
				this.flag = true
			}
			return await this.page(page)
		})
	},
	async build(){
		return new Promise(async(resolve,reject)=>{
			let start = now()
			this.loader = ora("Start building…").start();
			// Have to remove per page time benchmarks, because it's all done in parallel now
			await forEach(Object.keys(cogear.pages),async(file) => {
				this.loader.start(`Building ${chalk.bold(file)}…`);
				await cogear.emit('build.page',cogear.pages[file]);
				page = cogear.pages[file]
				this.loader.succeed(`Built ${chalk.bold(page.file)} => ${chalk.bold(page.path)}`);
			})
			this.buildTime = now()-start
			this.loader.succeed(`Build is done! (${prettyMs(this.buildTime)})`);
			cogear.emit('build.done')
			resolve()	

		})
	},
	async page(page){
		return new Promise(async(resolve,reject)=>{
			/**
			 * Compile layout
			 * 
			 * If page layout is set to `false`, it won't be compiled
			 * If page layout is `undefined`, default "index" layout will be used
			 * If page layout doesn't have extension, default ".pug" will be used
			 */
			page.layout = typeof page.layout != 'undefined' ? page.layout : "index";
			let html = ''; // Output HTML code
			if(page.layout){
				// Pug is default layout template engine
				if (!page.layout.match(/\.(html|ejs|pug|hbs)$/)) {
					page.layout += ".pug";
				}
				let layout = "";
				/**
				 * Searching layout
				 * 
				 * Loop: 
				 * 1. Source folder `layout` dir
				 * 2. Theme folder `layout` dir
				 * 
				 * If one is found loop breaks.
				 */
				let themeSearchPaths = [path.join(cogear.options.src, "layouts")]
				if(cogear.themeDir){
					themeSearchPaths.push(path.join(cogear.themeDir,"layouts"))
				}
				try {
					layout = require.resolve(page.layout, {
						paths: themeSearchPaths
					});
				} catch (err) {
					this.loader.fail(`Page ${chalk.bold(file)} layout '${chalk.bold(page.layout)}' doesn't exists: ${chalk.bold(err)}`)
					reject(e)
					// process.exit()
				}
				page.layoutPath = layout
				page.basedir = path.dirname(page.layoutPath)
				page.title = page.title || cogear.config.title
				page.cogear = {
					config: cogear.config
				}
				await cogear.emit('build.page.layout',[page,layout])
				try{
					html = cogear.parser.renderFile(layout, page)
				} catch (e){
					console.error(`\n ${chalk.red(e)} \n`)
					reject(e)
					// process.exit()
				}
			}
			else { // If layout is set to `false`, directly page content will be written to the output
			html = page.content
		}
		await cogear.emit('build.page.chunks',page)
		page.chunks.forEach(chunk=>{
			let injectElement = page.inject || 'head'
			let files = this.compilation.namedChunks.get(chunk).files
			let scripts = ''
			let styles = ''
			files.forEach(file => {
				switch(path.parse(file).ext.replace(/(\?.+)/,'')){
					case '.css':
						styles += `<link rel="stylesheet" href="/${file}"/>`
					break;
					case '.js':
						scripts += `<script src="/${file}"></script>`
					break;
					}
				})
				html = html.replace(`</${injectElement}>`,`${styles}${scripts}</${injectElement}>`)
			})
			await cogear.emit('build.page.write',[page,html])
			page.writePath = path.join(cogear.options.output,page.path)
			mkdirp.sync(path.dirname(page.writePath));
			fs.writeFileSync(page.writePath, html)
			await cogear.emit('build.page.writeAfter',[page,html])
			resolve(page)
		})
	}
}