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
		async render(content,vars={}){
			let data = {
				file: null,
				content: content,
				vars: vars
			}
			await cogear.emit('parse.before',data)
			switch (data.vars.format) {
				case ".md":
					data.parsedContent = marked(data.content,data.vars);
					break;
				case ".pug":
					data.parsedContent = pug.render(data.content,data.vars)
					break;
				case ".hbs":
					data.parsedContent = handlebars.compile(data.content)(data.vars);
					break;
				case ".html":
				case ".ejs":
				default:
					data.parsedContent = ejs.render(data.content, data.vars);
			}
			await cogear.emit('parse.after',data)
			return data.parsedContent

		}
		async renderFile(file,vars = {}){
			let data = {
				file: file,
				content: null,
				vars: vars
			}
			await cogear.emit('parse.before',data)

			switch (path.parse(file).ext) {
				case ".md":
					data.parsedContent = marked(fs.readFileSync(data.file,"utf-8"));
					break;
				case ".pug":
					data.parsedContent = pug.renderFile(data.file, data.vars);
					break;
				case ".hbs":
					data.parsedContent = handlebars.compile(fs.readFileSync(data.file,"utf-8"))(data.vars);
					break;
				case ".html":
				case ".ejs":
				default:
					data.parsedContent = ejs.renderFile(data.file, data.vars);
			}
			await cogear.emit('parse.after',data)
			return data.parsedContent
		}
	}

	module.exports = () => {
		return new Parser()
	}