const boxen = require("boxen");
const chalk = require("chalk");
const loudRejection = require('loud-rejection')
module.exports = {
	apply(){
		loudRejection()
		cogear.on('init',async ()=>{
			cogear.on('banner',()=>{
				console.log(
					boxen(`\n${chalk.bold.whiteBright('Cogear.JS – modern static websites generator.')}\n\nv${cogear.package.version}\n\n(${cogear.mode})\n\n${chalk.bold.whiteBright('https://cogearjs.org')}`, {
						padding: {top: 1, bottom: 1,left: 8,right: 8},
						margin: 0,
						dimBorder: true,
						align: "center",
						borderStyle: "single-double",
						borderColor: "magenta"
					})
				)
			})
			await cogear.emit('config')
		})
	}
}