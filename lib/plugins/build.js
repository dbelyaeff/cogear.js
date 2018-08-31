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
const _cliProgress = require('cli-progress');

module.exports = {
	apply(){
		cogear.on('build',()=>{
		  this.build()
		})
		cogear.on('rebuild',()=>{
		  this.rebuild()
		})
		cogear.on('build.page',async(page)=>{
			if(typeof page == 'string'){ // If it's a path
				let results = await cogear.emit('preload.page',[page])
				page = results.pop()
			}
			return await this.page(page)
		})
	},
	// When layouts changes rebuild
	async rebuild(){
		return new Promise(async(resolve,reject)=>{
			await forEach(Object.keys(cogear.pages),async(file) => {
				await cogear.emit('build.page',cogear.pages[file]);				
			})
			resolve()
		})
	},
	// First time build
	async build(){
		return new Promise(async(resolve,reject)=>{
			performance.mark('buildStart')
			cogear.loader.start("Building pages…")
			// Have to remove per page time benchmarks, because it's all done in parallel now
			await forEach(Object.keys(cogear.pages),async(file) => {
				await cogear.emit('build.page',cogear.pages[file]);				
			})
			performance.mark('buildEnd')
			performance.measure('Build time','buildStart','buildEnd')
			const {duration} = performance.getEntriesByName('Build time')[0]
			cogear.loader.succeed(`${chalk.whiteBright.bold('Built')} in ${prettyMs(duration)}.`);
			cogear.loader.succeed(`${chalk.whiteBright.bold('Finished')} in ${prettyMs(performance.now())}. ${chalk.gray('Preload + Webpack + Build')}`)
			cogear.emit('build.done')
			resolve()	
		})
	},
	async page(page){
		return new Promise(async(resolve,reject)=>{
			// this.loader.start(`Building ${chalk.bold(page.file)}…`);
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
					cogear.loader.fail(`Page ${chalk.bold(file)} layout '${chalk.bold(page.layout)}' doesn't exists: ${chalk.bold(err)}`)
					reject(e)
					// process.exit()
				}
				page.layoutPath = layout
				page.basedir = path.dirname(page.layoutPath)
				// page.title = page.title || cogear.config.title
				page.cogear = {
					config: cogear.config
				}
				await cogear.emit('build.page.layout',[page,layout])
				try{
					html = await cogear.parser.renderFile(layout, page)
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
			let files = cogear.compilation.namedChunks.get(chunk).files
			let scripts = ''
			let styles = ''
			if(files){
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
			}
				html = html.replace(`</${injectElement}>`,`${styles}${scripts}</${injectElement}>`)
			})
			await cogear.emit('build.page.write',[page,html])
			page.writePath = path.join(cogear.options.output,page.path)
			mkdirp.sync(path.dirname(page.writePath));
			fs.writeFileSync(page.writePath, html)
			await cogear.emit('build.page.writeAfter',[page,html])
			// this.bar.update(this.pagesDoneCount+=1)
			// cogear.loader.succeed(`${chalk.bold(page.file)} => ${chalk.bold(page.path)}`);
			resolve(page)
		})
	}
}