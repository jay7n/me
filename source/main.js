import Vue from 'vue.es'
import VueRouter from 'vue-router.es'
import ToggleButton from 'vue-js-toggle-button'

import { pageTurningAudio } from '@/utils/methods'
import Router from '@/router'

pageTurningAudio.load()

Vue.use(ToggleButton)
Vue.use(VueRouter)

function main() {
    const app = new Vue({
        el: '#app',
        template: `
            <router-view></router-view>
        `,
        router: Router,
    })

    window.ReadMore = function ReadMore(mdLink) {
        // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
        pageTurningAudio.play()

        const [url, hash] = mdLink.split('#')

        app.$router.push({
            path: `/${url}/${hash}`,
        })
    }

    window.onpopstate = () => {
        pageTurningAudio.play()
    }
}

main()
