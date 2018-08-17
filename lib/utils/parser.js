const marked = require("marked"),
	pug = require("pug"),
	ejs = require("ejs"),
	handlebars = require("handlebars"),
	path = require("path"),
	fs = require("fs");

	class Parser {
		constructor(cogear){
			this.cogear = cogear
			this.files = []
		}
		/**
		 * Parse content based on file extension
		 * 
		 * Example: 
		 * let content = parser(file,content,options)
		 * 
		 * @param {String} file 
		 * @param {String} content optional 
		 * @param {Object} vars optional
		 */
		parse(file,content = false,vars = {}){
			if(content === false){
				if(this.files.find((tpl,path)=> path == file)){
					content = this.files[file]
				}
				else {
					content = fs.readFileSync(file,"utf-8")
					this.files[file] = content
				}
			}
			let result = ''
			this.cogear.hooks.beforeParse.call(this,file)
			switch (path.parse(file).ext) {
				case ".md":
					result = marked(content);
					break;
				case ".pug":
					result = pug.render(content, vars);
					break;
				case ".hbs":
					result = handlebars.compile(content)(vars);
					break;
				case ".html":
				case ".ejs":
				default:
					result = ejs.render(content, vars);
			}
			this.cogear.hooks.afterParse.call(this,file,result)
			return result
		}
	}

	module.exports = (cogear) => {
		new Parser(cogear)
	}