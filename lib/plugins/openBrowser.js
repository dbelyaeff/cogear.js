const opn = require('opn');

module.exports = {
	apply(){
		cogear.on('build.done',()=>{
			if(['production','development'].includes(cogear.mode) && cogear.options.open === true && !this.opened) {
				opn(`http://${cogear.config.host}:${cogear.config.port}`)
				this.opened = true
			}
		})
	}
}