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
			// For proper hooking assign properties
			this.file = file
			this.content = content
			this.vars = vars

			this.cogear.hooks.beforeParse.call(this)
			switch (path.parse(file).ext) {
				case ".md":
					this.parsedContent = marked(this.content);
					break;
				case ".pug":
					this.parsedContent = pug.render(this.content, this.vars);
					break;
				case ".hbs":
					this.parsedContent = handlebars.compile(this.content)(this.vars);
					break;
				case ".html":
				case ".ejs":
				default:
					this.parsedContent = ejs.render(this.content, this.vars);
			}
			this.cogear.hooks.afterParse.call(this)
			return this.parsedContent
		}
	}

	module.exports = (cogear) => {
		return new Parser(cogear)
	}