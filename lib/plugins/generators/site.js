const ora = require("ora"),
path = require('path'),
fs = require("fs"),
fse = require("fs-extra"),
prettyMs = require("pretty-ms"),
inquirer = require('inquirer'),
chalk = require('chalk'),
now = require('performance-now'),
git = require('simple-git/promise'),
shell = require('shelljs');

module.exports = {
	apply(cogear){
		cogear.hooks.generators.site.tap('generate-site',()=>{
			this.generate(cogear)
		})
	},
	checkGit(){
		// Check for git
		if(!shell.which('git')){
			shell.echo(`${chalk.bold('Git')} is required for this operation. 
Please, install and try again!
More: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git`)
			shell.exit(1)
		}
	},
	generate(cogear){
		let questions = require('./questions/site.js')(cogear)
		inquirer.prompt(questions).then(answers => {
				let start = now()
				let loader = ora("Crafting new site...").start()
				let sitepath = path.join(process.cwd(),answers.sitename)
				// If external repository is defined
				let repo = answers.repo || cogear.options._[2]
				let success = () => {
					loader.succeed(`New site is crafted in ${prettyMs(now() - start)}.\n
💡 ${chalk.underline.whiteBright('Next steps:')}
${chalk.bold('1.')} Open dir:
> cd ${chalk.bold('./'+answers.sitename)} 
${chalk.bold('2.')} Run in development mode (w/hot-reload):
> ${chalk.bold('cogear')}

📙 Read the docs: https://cogearjs.org`)
				}
				if(repo){
					this.checkGit()
					git().clone(repo,sitepath).then(()=>{
						success()
					}).catch((err) => {
						loader.fail(err)
					})
				}
				// Else copy default files structure
				else {
					fse.ensureDirSync(sitepath);
					[
						path.join(cogear.baseDir,'lib','plugins','generators','templates','site','src'),
						path.join(cogear.baseDir,'lib','plugins','generators','templates','site','config.yaml')
						// path.join(cogear.baseDir,'.gitignore')
					]
					.forEach((dirfile)=>{
						fse.copySync(dirfile,path.join(sitepath,path.basename(dirfile)))
					})
					fse.copySync(
						path.join(cogear.baseDir,'node_modules','cogear-theme-default'),
						path.join(sitepath,'themes','default')
					)
					success()
				}
			});
	}
}