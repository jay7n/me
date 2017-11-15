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

        MDRouteQueue.truncateAndpush({
            scrollTop: window.top.document.body.scrollTop
        })

        app.$router.push({
            path: `${rootPath}/${mdLink}`,
        })
    }

    window.onpopstate = () => {
        pageTurningAudio.play()
    }
}

main()
