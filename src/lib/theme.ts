export type Theme = 'light' | 'dark'

/** localStorage key for the visitor's pick. Shared by the head script and the theme button. */
export const THEME_KEY = 'theme'

/**
 * Runs in <head> before the first paint, so a visitor who picked a theme never sees the other one
 * flash in. Only the two known values get through; storage can be blocked, hence the try.
 */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`
