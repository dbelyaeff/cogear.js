module.exports = {
	apply(cogear){
		cogear.hooks.clearBuild.tap('Clear tmp build dir after built.',()=>{
			cogear.clearDir(cogear.buildDir)
		})
		cogear.hooks.death.tap('Clear tmp build dir on death.',()=>{
			cogear.clearDir(cogear.buildDir,false)
		})
	}
}