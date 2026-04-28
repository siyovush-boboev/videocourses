import { useSyncExternalStore } from 'react'

const NAVIGATION_EVENT = 'app:navigate'

const getPathname = () => window.location.pathname || '/'

const subscribe = (callback) => {
  window.addEventListener('popstate', callback)
  window.addEventListener(NAVIGATION_EVENT, callback)

  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(NAVIGATION_EVENT, callback)
  }
}

const notifyNavigation = () => {
  window.dispatchEvent(new Event(NAVIGATION_EVENT))
}

const navigateTo = (pathname, options = {}) => {
  const nextPath = pathname || '/'
  const currentPath = getPathname()

  if (currentPath === nextPath) {
    return
  }

  if (options.replace) {
    window.history.replaceState({}, '', nextPath)
  } else {
    window.history.pushState({}, '', nextPath)
  }

  notifyNavigation()
}

function usePathname() {
  const pathname = useSyncExternalStore(subscribe, getPathname, () => '/')

  return {
    pathname,
    navigateTo,
  }
}

export default usePathname
