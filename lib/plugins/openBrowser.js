const opn = require('opn');

module.exports = {
	apply(){
		cogear.hooks.buildDone.tap('Open browser on build',()=>{
			if(cogear.server.running && cogear.options.open === true) {
				opn(`http://${cogear.config.host}:${cogear.config.port}`)
			}
		})
	}
}