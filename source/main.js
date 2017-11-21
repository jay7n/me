import Vue from 'vue.es'

import { pageTurningAudio, crossFrameGetPostMessage, parseLoactoinHref } from '@/utils/methods'
import { doublemark } from '@/utils/consts'
import {Router, MDRouteQueue} from '@/router'

import '@/style.css'

pageTurningAudio.load()


function main() {
    crossFrameGetPostMessage('getOutsideWindowLocationHref', 'setOutsideWindowLocationHref')
        .then(outsideLocationHref => {
            const outsideLocation = parseLoactoinHref(outsideLocationHref)

            if (outsideLocation) {
                window.outsideLocation = outsideLocation
            }

            const app = new Vue({
                el: '#app',
                template: '<router-view></router-view>',
                router: Router.Create(),
            })

            let rootPath = '/app.html'
            let historyStack = 0

            window.ReadMore = function ReadMore(mdLink) {
            // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
                pageTurningAudio.play()

                crossFrameGetPostMessage('getOutsideDocumentBodyScrollTop', 'setOutsideDocumentBodyScrollTop')
                    .then(scrollTop => {
                        const path = `${rootPath}/${mdLink}`

                        MDRouteQueue.truncateAndpush({
                            scrollTop
                        })
                        app.$router.push({
                            path,
                            query: {
                                stack: ++historyStack
                            }
                        })
                    })
            }

            window.onpopstate = () => {
                pageTurningAudio.play()
            }

            window.ReadMoreInBlank = function ReadMoreInBlank(mdLink) {
                const path = `${window.location.origin}${doublemark}${rootPath}/${mdLink}`
                window.open(path, '_blank')
            }
        })
}

main()
