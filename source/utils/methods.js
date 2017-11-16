import URI from 'urijs'
import showdown from 'showdown'
import 'whatwg-fetch'

import { appRoot } from '@/utils/consts'

function _markdownAssetToHtml(mdUrl) {
    return fetch(mdUrl)
        .then(response => response.text())
        .then(mdContent => {
            const mdConverter = new showdown.Converter()
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
    audio: new Audio(underPath.assets('pageturn.wav')),
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
