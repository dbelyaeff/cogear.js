module.exports = {
	apply(){
		cogear.hooks.help.tap('help',(help)=>{
			console.log(help)
		})
	}
}