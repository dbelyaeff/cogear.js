// let turbolinksActive = cogear.config.turbolinks !== false
// if(turbolinksActive){
// 	if(typeof Turbolinks == 'undefined'){
// 		document.addEventListener('DOMContentLoaded',()=>{
// 			let scripts = document.querySelectorAll('script')
// 			console.log(scripts)
// 			scripts.forEach((script)=>{
// 				script.dataset.turbolinksTrack=true
// 			})
// 		})
// 		var hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true')
// 		const Turbolinks = require("turbolinks")
// 		Turbolinks.start()
// 		hotClient.subscribe(function (event) {
// 			if (event.action === 'reload') {
// 				Turbolinks.visit(window.location.pathname,{
// 					action: 'reload'
// 				})
// 			}
// 		})
// 	}
// } else {
var hotClient = require(`webpack-hot-middleware/client?path=/__webpack_hmr&autoconnect=true&timeout=20000&reload=true`)
hotClient.subscribe(function (event) {
		if (event.action === 'reload') {
			window.location.reload()
		}
})
// if(module.hot){
// 	module.hot.accept()
// }
// }