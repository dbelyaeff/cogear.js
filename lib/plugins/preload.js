const path = require("path");
const glob = require("glob");
const fs = require("fs");
const util = require('util');
const fse = require("fs-extra");
const mkdirp = require("mkdirp");
const plural = require("plural");
const chalk = require("chalk");
const now = require("performance-now");
const prettyMs = require("pretty-ms");
const yamlFront = require("yaml-front-matter");
cogear.parser = require("../utils/parser")()
const {forEach} = require('p-iteration')
const merge = require("webpack-merge");

module.exports = {
	apply(){
		cogear.on('preload',async()=>{
			return await this.preload()
		})
		cogear.on('preload.page',async ([file,obj])=>{
			let page =  await this.page(file,obj)
			return page
		})
	},
	async preload(){
		if(!cogear.webpackConfig){
			cogear.loader.fail("Webpack config must be loaded before pages preload starts.");
			process.exit()
		}
		return new Promise(async(resolve,reject)=>{
			let start = now()
			cogear.loader.start("Preloading pages...\n")
			let files = glob.sync(`**/*.@(${cogear.pageFormats.join('|')})`, { cwd: cogear.options.srcPages });
			cogear.pages = {};
			if (!files.length) {
				cogear.loader.fail(`No files are found in the source dir ${chalk.bold(cogear.options.src)}. 
	Please, make sure that at least one page file is available.`);
				process.exit();
			}	
			await cogear.emit('preload.before')
			await forEach(files, async (file) => {
				await cogear.emit('preload.page',[file])
			})
			cogear.loader.succeed(`${chalk.whiteBright.bold('Preloaded')} in ${prettyMs(now()-start)}.`);	
			await cogear.emit('preload.done')
			resolve()	
		})
	},
	async page(file,page){
		return new Promise(async(resolve,reject)=>{
			// 1. If file but no page object
			if(file){
				page = {
					file: file,
					filePath: path.join(cogear.options.srcPages,file),
				};
				try {
					page = merge(page,yamlFront.loadFront(fs.readFileSync(page.filePath, "utf-8")))
				} catch (e){
					console.error(e.message)
				}
				let stats = fs.statSync(page.filePath)
				page.date = page.date || new Date(stats.birthtimeMs)
				page.created_at = page.date
				page.updated_at = stats.mtime
			} 
			page.filename = path.parse(page.file).name,
			page.format = path.extname(page.file)						
			// 4. Set page path (in output folder) and uri (in browser)
			if (page.uri) {
				page.path = page.uri.indexOf(".html") != -1 ? page.uri : page.uri + "/index.html";
			} else {
				page.path = page.file.replace(/\.(md|html|pug|ejs|hbs)$/, "") + (page.filename == 'index' ? ".html" : "/index.html");
				page.uri = page.path.replace('index.html','')
			}
			// 5. Merge with global config page-per-uri-regex params
			/**
			 * You can set pages params for any match path globally in ./config.yaml
			 * 
			 * pages:
			 * 	docs/: # Any page uri that matched to given page. Can be regexp
			 * 		layout: docs # Any params from YAML-front-matter
			 * 		js:
			 *		 		- js/docs.js # Path relative to ./src dir
			 */
			if(cogear.config.pages){
				Object.keys(cogear.config.pages)
				.filter(regex=>{ // If match page path
					return new RegExp(regex).test(page.uri)
				}) 
				.forEach(key=>{ // Copy given options to the page
					page = merge(page,cogear.config.pages[key])
				})
			}
			// 6. Render page
			await cogear.emit('preload.page.parse',page)
			if(page.__content){
				try {
					page.content  = await cogear.parser.render(page.__content, page);
				} catch (e){
					console.error(`\n ${chalk.red(e)} \n`)
					reject(e)
				}
			}
			await cogear.emit('preload.page.parse.after',page)
			// 7. Processing js entry points (chunks)
			page.chunks = ['app'] 
			
			await cogear.emit('preload.page.chunks',page)
			// Inject js
			if(Array.isArray(page.js)){
				page.chunks = []
				// Avoid duplicates
				page.js = page.js.filter((v, i, a) => a.indexOf(v) === i)
				// if(!page.keepJS) page.chunks = []
				for(let script of page.js){
					let scriptPath = path.join(cogear.options.src,script)
					if(cogear.mode == 'development'){
						cogear.webpackConfig.entry[script] = [path.join(cogear.baseDir,'lib','hot.js'),scriptPath];
					} else {
						cogear.webpackConfig.entry[script] = [scriptPath]
					}
					page.chunks.push(script)				
					// try {
					// 	if(!fs.lstatSync(scriptPath).isFile()){
					// 		ora().fail(`Script ${chalk.bold(scriptPath)} from page ${chalk.bold.whiteBright(page.file)} doesn't exist.`)
					// 		continue;
					// 	}
					// } catch (e){
					// 	console.error(`Script ${chalk.bold(scriptPath)} from page ${chalk.bold.whiteBright(page.file)} doesn't exist.`)
					// }
				}
			}
			await cogear.emit('preload.page.chunks.after',page)
			// 8. Add to global pages array
			cogear.pages[page.uri] = page
			resolve(page)
		})
	}
}