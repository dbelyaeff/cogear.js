module.exports = {
		apply(){
			// Process hooks here
			cogear.hooks.init.tap('{{name}}',()=>{
				// Do something
			})
		}
}