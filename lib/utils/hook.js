module.exports = class Hook {
	constructor(){
		this.plugins = []
	}
	tap(name,callback){
		this.plugins.push(callback)
	}
	call(...args){
		this.plugins.forEach((callback)=>{
			callback(...args)
		})
	}
}