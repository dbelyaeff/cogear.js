const path = require("path"),
	ora = require("ora"),
	fs = require("fs"),
	fse = require("fs-extra"),
	mkdirp = require("mkdirp"),
	chalk = require("chalk"),
	now = require("performance-now"),
	prettyMs = require("pretty-ms"),
	yamlFront = require("yaml-front-matter");
const Parser = require("../utils/parser")()

module.exports = {
	apply(){
		cogear.hooks.buildPage.tapAsync('Build a page',(file,done)=>{
			this.buildPage(file,done)
		})
	},
	buildPage(file,done){
		let start = now();

		let loader = ora(`Processing ${chalk.bold(file)}…`).start();
		let page = yamlFront.loadFront(fs.readFileSync(path.join(cogear.options.srcPages,file), "utf-8"));
		loader.text = `Parsing ${chalk.bold(file)}…`;
		page.filename = path.parse(file).name
		page.content = Parser.parse(file, page.__content, page);
		loader.text = `File ${chalk.bold(file)} is parsed.`;
		// Define page uri (real html file it compiles into)
		page.path = "";
		if (page.uri) {
			page.path = page.uri.indexOf(".html") != -1 ? page.uri : page.uri + "/index.html";
		} else {
			page.path = file.replace(/\.(md|html|pug|ejs|hbs)$/, "") + (page.filename == 'index' ? ".html" : "/index.html");
		}
		
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
				loader.fail(`Page ${chalk.bold(file)} layout '${chalk.bold(page.layout)}' doesn't exists: ${chalk.bold(err)}`)
				process.exit()
			}
			page.layoutPath = layout
			html = Parser.parse(layout, false, page)
		}
		else { // If layout is set to `false`, directly page content will be written to the output
			html = page.content
		}
		page.buildPath = path.join(cogear.buildDir, page.path);
		mkdirp.sync(path.dirname(page.buildPath));
		cogear.pages[file] = page
		fs.writeFileSync(page.buildPath, html)
		loader.succeed(`Converted ${chalk.bold(file)} => ${chalk.bold(page.path)} (${prettyMs(now() - start)})`);
		done()
	}
}