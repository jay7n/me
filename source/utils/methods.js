import URI from 'urijs'
import showdown from 'showdown'
import 'whatwg-fetch'

import { appRoot } from '@/utils/consts'

function _markdownAssetToHtml(mdUrl) {
    return fetch(underPath.assets(mdUrl))
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
        const p = fetch(underPath.assets(url))
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
