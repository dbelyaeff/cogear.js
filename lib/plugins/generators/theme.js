const ora = require("ora"),
path = require('path'),
fs = require("fs"),
fse = require("fs-extra"),
prettyMs = require("pretty-ms"),
inquirer = require('inquirer'),
chalk = require('chalk'),
now = require('performance-now'),
git = require('simple-git/promise'),
Handlebars = require('handlebars'),
glob = require('glob'),
camelCase = require('camelcase'),
ucfirst = require('ucfirst');

module.exports = {
	apply(cogear){
		cogear.hooks.generators.theme.tap('generate theme',()=>this.generate(cogear))
	},
	generate(cogear){
		let questions = require('./questions/theme.js')(cogear)
		inquirer.prompt(questions).then(answers => {
			let start = now()
			let loader = ora("Crafting new theme...").start()
			let themeName = answers.name
			let themePath = path.join(process.cwd(),themeName)
			// If we are in the project folder
			if(fs.existsSync(path.join(process.cwd(),cogear.options.src))){ 
				themePath = path.join(process.cwd(),'themes',themeName)
			}
			// If external repository is defined
			// let repo = answers.repo || cogear.options._[2]
			let success = () => {
				loader.succeed(`New theme is crafted in ${prettyMs(now() - start)}.\n
💡 ${chalk.underline.whiteBright('Next steps:')}
${chalk.bold('1.')} Edit ${chalk.bold('./config.yaml')} to set up the new theme.

More info: ${chalk.bold.whiteBright('https://cogearjs.org/docs/themes')}`)}

			if(fse.ensureDirSync(themePath)){
				let tplDir = path.join(cogear.baseDir,'lib','plugins','generators','templates','theme')
				let files = glob.sync('**/*',{
					cwd: tplDir
				})
				files.forEach(file=>{
					let filePath = path.join(tplDir,file)
					let fileInfo = path.parse(file)
					if(fileInfo.ext == '.tpl'){
						let source = fs.readFileSync(filePath,'utf-8')
						let template = Handlebars.compile(source)
						let content = template({
							name: 'cogear-theme-'+answers.name.replace('cogear-theme-',''),
						})
						fs.writeFileSync(
							path.join(themePath,file.replace(fileInfo.ext,'')),
							content
						)
					} else {
						fse.copySync(
							path.join(tplDir,file),
							path.join(themePath,file)
						)
					}
				})
				success()
			}
		})
	}
}