const path = require('path')
const fs = require('fs')
module.exports = (cogear) => {
	return [
		{
			type: "input",
			name: "name",
			default: 'cogear-theme-'+(cogear.options._[1] ? cogear.options._[1] : 'name'),
			message: "Theme name:",
			validate(name){
				let done = this.async()
				if(name.trim() == ''){
					done("Shouldn't be empty.")
				}
				if(name.match(/[^\w_-]+/)){
					done("Use only lowercase letters, lodash and dash.")
				} 
				if(name.match(/^[^a-z]{1}/)){
					done("A letter should be the first.")
				} 
				let themePath = path.join(process.cwd(),name)
				let word = 'current'
				// If we are in the project folder
				if(fs.existsSync(path.join(process.cwd(),cogear.options.src))){ 
					themePath = path.join(process.cwd(),'themes',name)
					word = 'themes'
				}
				fs.access(themePath,(err) => {
					if(err){ // Directory not exists
						done(null,true)
					} else {
						done(`Directory exists in ${word} folder! Try again.\n${chalk.bold(themePath)}.`)
					}
				})
			}
		},
	]
}