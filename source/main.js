import Vue from 'vue.es'

import { pageTurningAudio } from '@/utils/methods'
import {Router, MDRouteQueue} from '@/router'

pageTurningAudio.load()


function main() {
    const app = new Vue({
        el: '#app',
        template: `
            <router-view></router-view>
        `,
        router: Router,
    })

    const rootPath = app.$router.currentRoute.fullPath

    window.ReadMore = function ReadMore(mdLink) {
        // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
        pageTurningAudio.play()

        const messageHandler = function (event) {
            if (event.data.type == 'setOutsideDocumentBodyScrollTop') {
                MDRouteQueue.truncateAndpush({
                    scrollTop: event.data.scrollTop
                })
                app.$router.push({
                    path: `${rootPath}/${mdLink}`,
                })
                window.removeEventListener('message', messageHandler, true)
            }
        }
        window.addEventListener('message', messageHandler, true)

        window.parent.postMessage({
            type: 'getOutsideDocumentBodyScrollTop',
        }, '*')
    }

    window.onpopstate = () => {
        pageTurningAudio.play()
    }
}

main()
