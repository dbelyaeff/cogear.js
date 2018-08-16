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
os = require('os');
module.exports ={
	apply(cogear){
		cogear.hooks.generators.plugin.tap('generate plugin',()=>this.generate(cogear))
	},
	generate(cogear){
		let questions = require('./questions/plugin.js')(cogear)
		inquirer.prompt(questions).then(answers => {
			let start = now()
			let loader = ora("Crafting new plugin...").start()
			let pluginName = answers.name
			let pluginPath = path.join(process.cwd(),'cogear-plugin-'+pluginName.replace('cogear-plugin-',''))
			if(fs.existsSync(path.join(process.cwd(),cogear.options.src))){ 
				pluginPath = path.join(process.cwd(),'plugins',pluginName)
			}
			// If external repository is defined
			// let repo = answers.repo || cogear.options._[2]
			let success = () => {
				loader.succeed(`New plugin is crafted in ${prettyMs(now() - start)}.\n
💡 ${chalk.underline.whiteBright('Next steps:')}
${chalk.bold('1.')} > cd ${chalk.bold(pluginPath.replace(os.homedir(),'~'))} 
${chalk.bold('2.')} Edit ${chalk.bold('package.json')}.

More info: ${chalk.bold.whiteBright('https://cogearjs.org/docs/plugins')}`)}

			if(fse.ensureDirSync(pluginPath)){
				let tplDir = path.join(cogear.baseDir,'lib','plugins','generators','templates','plugin')
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
							name: answers.name,
						})
						fs.writeFileSync(
							path.join(pluginPath,file.replace(fileInfo.ext,'')),
							content
						)
					} else {
						fs.copyFileSync(
							file,
							path.join(pluginPath,file)
						)
					}
				// ['src','config.json'].forEach((dirfile)=>{
				// 	fse.copySync(path.join(cogear.baseDir,dirfile),path.join(sitepath,dirfile))
				// })
			})
		}
		success()
	})
	}
}