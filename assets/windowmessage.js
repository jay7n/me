window.addEventListener('message', function(event) {
    var $loadingme = document.getElementById('loadingme')
    $loadingme.style.display = 'none'

    var embed = document.getElementsByTagName('iframe')
    embed = embed && embed.length > 0 ? embed[0] : null

    if (event.data.type == 'onMarkdownContentScrollHeightUpdated') {
        if (embed) {
            var height = event.data.height
            embed.style.height =  height + 'px'
        }

        var $shell = document.getElementById('shell')
        $shell.style.border = 'solid 1px'
        $shell.style.borderRadius = '10px'
    } else if (event.data.type == 'onMarkdownContentScrollTopUpdated') {
        document.body.scrollTop = event.data.scrollTop

        if (event.data.relativeScroll) {
            document.body.scrollTop += embed.offsetTop
        }
    } else if (event.data.type == 'getOutsideDocumentBodyScrollTop') {
        embed.contentWindow.postMessage({
            type: 'setOutsideDocumentBodyScrollTop',
            scrollTop: document.body.scrollTop
        }, '*')
    } else if (event.data.type == 'getOutsideWindowLocationHref') {
        embed.contentWindow.postMessage({
            type: 'setOutsideWindowLocationHref',
            scrollTop: window.location.href
        }, '*')
    }
})
