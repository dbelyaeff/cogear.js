module.exports = {
	apply(cogear){
		cogear.hooks.help.tap('help',(help)=>{
			console.log(help)
		})
	}
}