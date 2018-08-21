module.exports = {
	apply(){
		cogear.on('help',({help})=>{
			console.log(help)
		})
	}
}