#!/usr/local/bin/node

const parseArgs = require('minimist')
const path = require('path')
const fse = require('fs-extra')

const Conf = require('../config/conf')

function _rmReadmoreInFile(path) {
    let content = fse.readFileSync(path).toString()
    content = content.replace(/\[Read more\s?\.\.\.\]\(.+\)/g, '')
    content = content.replace(/\[阅读更多\s?\.\.\.\]\(.+\)/g, '')
    content =  content + '\n\n**Visit _http://me.liyo.site_ to know more about me**\n\n'
    fse.writeFileSync(path, content)
}

function main() {
    const mdcontentPath = path.resolve(Conf.RootPath, 'assets', 'mdcontent')

    const readmeNoReadMorePath =path.join(mdcontentPath, 'README.noReadmore.md')
    const readmeCNNoReadMorePath =path.join(mdcontentPath, 'README_CN.noReadmore.md')
    fse.copySync(path.join(mdcontentPath, 'README.md'), readmeNoReadMorePath)
    fse.copySync(path.join(mdcontentPath, 'README_CN.md'), readmeCNNoReadMorePath)

    _rmReadmoreInFile(readmeNoReadMorePath)
    _rmReadmoreInFile(readmeCNNoReadMorePath)
}

if (require.main === module) {
    const args = parseArgs(process.argv.slice(2))
    main(args)
} else {
    module.exports = main
}
