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
const Parser = require("../utils/parser")()
const {forEach} = require('p-iteration')
const merge = require("webpack-merge");

module.exports = {
	apply(){
		cogear.on('preload',async(webpackConfig)=>{
			return await this.preload(webpackConfig)
		})
		cogear.on('preload.page',async (file)=>{
			let page =  await this.page(file)
			return page
		})
	},
	async preload(webpackConfig){
		this.time = {
			start: now()
		}
		this.webpackConfig = webpackConfig
		return new Promise(async(resolve,reject)=>{
			this.loader = ora("Preloading pages...\n").start()
			let files = glob.sync(`**/*.@(${cogear.pageFormats.join('|')})`, { cwd: cogear.options.srcPages });
			cogear.pages = {};
			if (!files.length) {
				this.loader.fail(`No files are found in the source dir ${chalk.bold(cogear.options.src)}. 
	Please, make sure that at least one page file is available.`);
				process.exit();
			}	
			
			await forEach(files, async (file) => {
				await cogear.emit('preload.page',file)
			})
			this.loader.succeed(`Pages are preloaded. (${prettyMs(now()-this.time.start)})`);	
			await cogear.emit('preload.done')
			resolve()	
		})
	},
	async page(file){
		return new Promise((resolve,reject)=>{
			let filePath = path.join(cogear.options.srcPages,file)
			let page = yamlFront.loadFront(fs.readFileSync(filePath, "utf-8"));
			page.file = file
			page.time = {
				preloadStart: now()
			}
			// loader.text = `Parsing ${chalk.bold(file)}…`;
			page.filename = path.parse(file).name
			page.format = path.extname(file)
			try {
				page.content = Parser.render(page.__content, page);
			} catch (e){
				console.error(`\n ${chalk.red(e)} \n`)
				reject(e)
				process.exit()
				// return reject(e)
			}
			// Define page uri (real html file it compiles into)
			if (page.uri) {
				page.path = page.uri.indexOf(".html") != -1 ? page.uri : page.uri + "/index.html";
			} else {
				page.path = file.replace(/\.(md|html|pug|ejs|hbs)$/, "") + (page.filename == 'index' ? ".html" : "/index.html");
			}
			page.chunks = ['app'] 
			
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
					return new RegExp(regex).test(page.path)
				}) 
				.forEach(key=>{ // Copy given options to the page
					page = merge(page,cogear.config.pages[key])
				})
			}
			// Inject js
			if(Array.isArray(page.js)){
				// Avoid duplicates
				page.js = page.js.filter((v, i, a) => a.indexOf(v) === i)
				if(!page.keepJS) page.chunks = []

				for(let script of page.js){
					let scriptPath = path.join(cogear.options.src,script)
					try {
						if(!fs.lstatSync(scriptPath).isFile()){
							ora().fail(`Script ${chalk.bold(scriptPath)} from page ${chalk.bold.whiteBright(page.file)} doesn't exist.`)
							continue;
						}
					} catch (e){
						console.error(`Script ${chalk.bold(scriptPath)} from page ${chalk.bold.whiteBright(page.file)} doesn't exist.`)
						// console.error(e)
					}
					if(cogear.mode == 'development'){
						this.webpackConfig.entry[script] = [path.join(cogear.baseDir,'lib','hot.js'),scriptPath];
						// cogear.webpackConfig.entry[script] = [`webpack-dev-server/client?http://${cogear.options.host}:${cogear.options.port}`, "webpack/hot/dev-server",`${cogear.options.src}/${script}`];
					} else {
						this.webpackConfig.entry[script] = [scriptPath]
					}
					page.chunks.push(script)
				}
			}
			page.time.preloadEnd = now()
			page.time.preload = page.time.preloadEnd - page.time.preloadStart
			cogear.pages[file] = page
			resolve(page)
		})
	}
}