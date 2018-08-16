const death = require('death'),
			del = require('del'),
			chalk = require('chalk'),
			boxen = require('boxen');

module.exports = {
	apply(cogear){
		death((signal,err)=>{
			cogear.hooks.death.call()
			if(cogear.server) cogear.server.close()
			console.log("\n" + boxen(`Visit ${chalk.bold.whiteBright('https://cogearjs.org')} to stay tuned!`,{align: "center",padding:{top: 2, bottom: 2,left: 10,right: 10}, borderColor: "magenta", dimBorder: true,borderStyle: 'double'}))
			process.exit()
		})
	}
}