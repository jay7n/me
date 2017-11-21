import URI from 'urijs'
import showdown from 'showdown'
import hljs from 'highlightjs'
import htmlCoder from 'html-encoder-decoder'

import 'whatwg-fetch'

import { appRoot, doublemark } from '@/utils/consts'

import pageturnWav from 'r/pageturn.wav'

import 'md.syntax.styles/agate.css'

function _markdownAssetToHtml(mdUrl) {
    return fetch(mdUrl)
        .then(response => response.text())
        .then(mdContent => {
            const mdConverter = new showdown.Converter({
                extensions: [showdownHighlight]
            })
            mdConverter.setFlavor('github')
            const htmlContent = mdConverter.makeHtml(mdContent)
            return htmlContent
        })
}

function _markdownAssetArrayToHtml(mdUrls) {
    const promises = []

    mdUrls.map(url => {
        const p = fetch(url)
            .then(response => response.text())
            .then(mdContent => {
                const mdConverter = new showdown.Converter()
                mdConverter.setFlavor('github')
                const htmlContent = mdConverter.makeHtml(mdContent)
                return htmlContent
            })
        promises.push(p)
    })

    return Promise.all(promises)
}

export function markdownAssetToHtml(mdUrl) {
    if (Array.prototype.isPrototypeOf(mdUrl)) {
        return _markdownAssetArrayToHtml(mdUrl)
    }  else if (String.prototype.isPrototypeOf(mdUrl) || typeof mdUrl ==='string') {
        return _markdownAssetToHtml(mdUrl)
    }
}

export const underPath = {
    assets(subPath) {
        const sp = URI(subPath).pathname()
        return `${appRoot}/assets/${sp}`
    }
}

export const pageTurningAudio = {
    audio: new Audio(pageturnWav),
    load() {
        pageTurningAudio.audio.load()
    },
    play() {
        pageTurningAudio.audio.play()
    }
}

export function getELementByATagName(name) {
    const atags = document.getElementsByTagName('a')
    for (const atag of atags) {
        if (name == atag.getAttribute('name')) {
            return atag
        }
    }
}

export function cumulativeOffset(element) {
    let top = 0, left = 0
    do {
        top += element.offsetTop  || 0
        left += element.offsetLeft || 0
        element = element.offsetParent
    } while(element)

    return {
        top: top,
        left: left
    }
}

export function crossFrameGetPostMessage(messageType, receivedMessageType) {
    return new Promise((resolve, reject) => {
        const messageHandler = function (event) {
            if (event.data.type == receivedMessageType) {
                resolve(event.data.scrollTop)
            } else {
                reject()
            }
            window.removeEventListener('message', messageHandler, true)
        }
        window.addEventListener('message', messageHandler, true)

        window.parent.postMessage({
            type: messageType
        }, '*')
    })
}

export function parseLoactoinHref(href) {
    const pair = href.split(doublemark)

    return {
        href,
        origin: pair[0],
        doublemark: pair[1],
        consumed: false
    }
}

/* close this method for now cuz at the moment no place uses it
export function without(array, ...excludedValues) {
    const resArray = array.slice(0)

    for (const exVal of excludedValues) {
        for (const [idx, val] of resArray.entries()) {
            if (val === exVal) {
                resArray.splice(idx, 1)
                break
            }
        }
    }

    return resArray
}
*/

export function showdownHighlight() {
    //modified from https://github.com/Bloggify/showdown-highlight
    // mainly add a 'hljs' class for <pre> tag

    return [{
        type: 'output',
        filter: (text) => {
            const left = "<pre><code\\b[^>]*>",
                right = "</code></pre>",
                flags = "g",
                replacement = function replacement(wholeMatch, match, left, right) {
                    match = htmlCoder.decode(match)
                    const leftWithClass = left.replace('<pre>', '<pre class="hljs">')
                    return leftWithClass + hljs.highlightAuto(match).value + right
                }

            return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags)
        }
    }]
}
