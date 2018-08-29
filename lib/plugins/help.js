module.exports = {
	apply(){
		cogear.on('help',async({help})=>{
			new Promise((resolve,reject)=>{
				console.log(help)
				resolve()
			})
		})
	}
}