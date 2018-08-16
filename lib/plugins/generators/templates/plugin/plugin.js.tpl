module.exports = {
		apply(cogear){
			// Process hooks here
			cogear.hooks.init.tap('{{name}}',(cogear)=>{
				// Do something
			})
		}
}