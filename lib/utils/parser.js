const marked = require("marked"),
	pug = require("pug"),
	ejs = require("ejs"),
	handlebars = require("handlebars"),
	path = require("path"),
	fs = require("fs");

	class Parser {
		constructor(){
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
		render(content,vars={}){
			this.file = null
			this.content = content
			this.vars = vars

			cogear.emit('beforeParse',this)
			switch (this.vars.format) {
				case ".md":
					this.parsedContent = marked(this.content,this.vars);
					break;
				case ".pug":
					this.parsedContent = pug.render(this.content,this.vars)
					break;
				case ".hbs":
					this.parsedContent = handlebars.compile(this.content)(this.vars);
					break;
				case ".html":
				case ".ejs":
				default:
					this.parsedContent = ejs.render(this.content, this.vars);
			}
			cogear.emit('afterParse',this)
			return this.parsedContent

		}
		renderFile(file,vars = {}){
			this.file = file
			this.content = null
			this.vars = vars

			cogear.emit('beforeParse',this)

			switch (path.parse(file).ext) {
				case ".md":
					this.parsedContent = marked(fs.readFileSync(this.file,"utf-8"));
					break;
				case ".pug":
					this.parsedContent = pug.renderFile(this.file, this.vars);
					break;
				case ".hbs":
					this.parsedContent = handlebars.compile(fs.readFileSync(this.file,"utf-8"))(this.vars);
					break;
				case ".html":
				case ".ejs":
				default:
					this.parsedContent = ejs.renderFile(this.file, this.vars);
			}
			cogear.emit('afterParse',this)
			return this.parsedContent
		}
	}

	module.exports = () => {
		return new Parser()
	}