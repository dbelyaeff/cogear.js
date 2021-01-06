# THE PROJECT IS DEPRECTATED

# Cogear.JS – modern static websites generator

[Requirements](#requirements) | [Installation](#installation) | [Usage](#usage) | [Options](#options) | [Website](https://cogearjs.org)

# About
**Cogear.JS** is a static site generator built with [Node.JS](https://nodejs.org) and based on [Webpack](https://webpack.js.org) (v4.6).

It's inspired by [Jekyll](https://jekyllrb.com) and others, but built on the top of the latest frontend technologies.

Providing awesome experience of on-the-fly hot reloading to instantly implementing any changes.

# Introduction video
[![Introduction to Cogear.JS](https://i.imgur.com/ct7xpPF.png)](https://youtu.be/nDga67P6lag?list=PLBuIATAeU0NWhrpWnI--TRG76DwAgem1I "Introduction to Cogear.JS")

## Features
* 🖥  **Modern stack technologies** <br>Build modern static websites with bundled scripts and styles.<br>Rapidly prototype and instantly deploy to the server.<br>
Use **any modern frontend stack** (**webpack** bundled) – [Vue.JS](https://vuejs.org), [React](https://reactjs.org), [Angular](https://angular.io), [Ember](https://emberjs.org), etc.
* 🚀  **Blazing fast and reliable**<br>
Performs nearly 1.000 pages per second (depends on the pages content and raw computer processor power).<br>
 Being online. Server can handle thousands requests per seconds to serve static files (even on tiny VPS).
* 📦 **For any hosting**<br>
Doesn't requires **any database** (data stored in flat files) and works on **any hosting** (as it produces *static html and assets files*).
* 🚚  **Deploy built in**<br>
[Create a preset](https://cogearjs.org/docs/deploy) and update your site to the server via FTP, SFTP or even `rsync`.
* 🔓 **Secure. No updates needed**<br> 
Just forget about annoying regular update from usual CMS.<br>
It's **100% secure** for hacking because there is no backend after being deployed to the server.
* **Free. Open Sourced**<br>
Use it for free. For any needs. Forever.<br>

[Github Pages](https://pages.github.com) (or any similar project) you can host generated site **for free**.

### What it can be used for:
* Rapid site prototyping, 
* Portfolio site,
* Company site,
* Product site,
* Personal blog,
* Artist or musician site.

Any site that has its administrator generated content.

Using [Firebase](https://firebase.google.com) or any other _backend_, written in _any lang_ (**PHP**, **Ruby**, **Python**, **Node.JS**) or even with CMS like a **WordPress**, with help of modern frontend technologies like [Vue.JS](https://vuejs.org) or [React](https://reactjs.org), it can be turned into more dynamic site like **e-commerce**, **products catalog** and so on.

### What it cannot be used for:
* Forum,
* Social network,
* Chat.

Or any other site type with great amount of user-generated content which relies on heavily database usage and dynamically generated pages.

# Requirements

You need [Node.JS](https://nodejs.org) (9.x or higher) and [NPM](https://www.npmjs.com) (usually comes together).

[Download and install](https://nodejs.org/en/download/)

The latest version (v10.9.0) is recommended.

**Cogear.JS** runs on:
* Mac
* Linux
* Windows

You may also want to use awesome [VSCode](https://code.visualstudio.com) editor.

# Installation
To install **Cogear.JS** do next:
```bash
$ npm install cogear -g
# or
$ yarn global add cogear
```
Done. Congratulations! 

**Cogear.JS** is now available by CLI-command `cogear`.

Now you're ready to build your first site.

# Usage
Go to the directory where all your local sites are hosted.
```bash
$ cd ~/Sites
```
Create a new site via command:
```bash
$ cogear new awesome-static-site # where "site" is your site folder name
```

After that go to site dir:
```bash
cd ~/Sites/awesome-static-site
```
And start up **Cogear.JS** in prefered mode.
```bash
$ cogear # run in develompent mode with hot-reload – by default

$ cogear build # build a site

$ cogear production # build a site and run local server

$ cogear deploy # deploy site to the default server
```
# Options
You can find the option via the `--help` command.
```bash
$ cogear --help

  Usage: cogear [command] [options]

  Options:

    -v, --version                     output the version number
    -s, --source [string]             custom source directory.
    -o, --output [string]             custom output directory.
    -p, --port   [int]                port to serve site on.
    -h, --host   [string]             host to serve site on.
    -n, --no-open                     do not open browser window automatically after built.
    -w, --verbose                     verbose Webpack output.
    --help                            output usage information

  Commands:

                                      Development mode with hot-reload (default).
    production|prod                   Production mode: build and serve.
    build|b                           Build mode: just build.
    deploy|d <preset>                 Deploy mode: build (if not) and deploy.
    new|init [options] <site-name>    Generate new site.
    plugin|p [options] <plugin-name>  Generate new plugin.
    theme|t [options] <theme-name>    Generate new theme.

For more information visit:
https://cogearjs.org
```

For more info, visit official website:
[https://cogearjs.org](https://cogearjs.org)


# TODO 

* Automated testing w/Jest
* CI
