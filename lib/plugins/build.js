
const path = require("path"),
ora = require("ora"),
glob = require("glob"),
fs = require("fs"),
fse = require("fs-extra"),
mkdirp = require("mkdirp"),
plural = require("plural"),
chalk = require("chalk"),
now = require("performance-now"),
prettyMs = require("pretty-ms");

module.exports = {
	apply(cogear){
		cogear.hooks.build.tap('Build pages',()=>{
			this.init(cogear)
		})
	},
	init(cogear){
		mkdirp.sync(cogear.buildDir);
		fse.emptyDirSync(cogear.buildDir);
		// Start benchmarking
		let start = now();
		// Show loader
		let loader = ora("Start building…").start();
		// Scan files
		let files = glob.sync(`**/*.@(${cogear.pageFormats.join('|')})`, { cwd: cogear.options.srcPages });
		loader.text = `Find ${chalk.bold(
			files.length + " " + plural("page", files.length)
		)}. Processing…`;
		cogear.pages = {};
		if (!files.length) {
			loader.fail(`No files are found in the source dir ${chalk.bold(cogear.options.src)}. 
Please, make sure that at least one page file is available.`);
			process.exit();
		}
		// Clear output dir
		cogear.clearDir(cogear.options.output);
		// Iterate files
		files.forEach(file => {
			cogear.hooks.buildPage.call(file)
		});
		loader.succeed(`Pages build is done! (${prettyMs(now() - start)})`);
		loader.stop();
	}
}