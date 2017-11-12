import URI from 'urijs'

const _wlh = window.location.href
export const appUri = URI(_wlh)
export const appRoot = `${appUri.origin()}${appUri.directory()}`
