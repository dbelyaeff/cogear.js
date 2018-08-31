const opn = require('opn');

module.exports = {
	apply(){
		cogear.on('build.done',()=>{
			if('development' === cogear.mode && cogear.options.open === true && !this.opened) {
				opn(`http://${cogear.config.host}:${cogear.http.address().port}`)
				this.opened = true
			}
		})
		cogear.on('server.listen',()=>{
			if('production' === cogear.mode && cogear.options.open === true && !this.opened) {
				opn(`http://${cogear.config.host}:${cogear.http.address().port}`)
				this.opened = true
			}
		})
	}
}