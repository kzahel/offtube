import {store} from './store.js'
import * as actions from './actions.js'
import {AppRouter} from './app.js'

const routes = [
  { path: '/', action: (context, params) => <AppRouter view='home' /> },
  { path: '/subscriptions', action: () => <AppRouter view='subscriptions' /> },
  { path: '/player', action: () => <AppRouter view='player' /> },
  { path: '/downloads', action: () => <AppRouter view='downloads' /> },
  { path: '(.*)', action: () => <AppRouter view='404' /> }
]

const router = new UniversalRouter(routes)

export function resolve_router(pathname) {
  pathname = pathname || window.location.pathname
  router.resolve({ pathname: pathname }).then(component => {
    store.dispatch( actions.change_route(pathname) )
    // ReactDOM.render(component, document.getElementById('root'))
    // renders: <h1>Page One</h1>
  })
}

function mapStateToProps(state) {
  const viewmap = {
    '/': 'home',
    '/subscriptions': 'subscriptions',
    '/player':'player',
    '/downloads':'downloads'
  }

  return {
    pathname: state.pathname,
    view: viewmap[state.pathname]
  }
}


export const ConnectedAppRouter = ReactRedux.connect(mapStateToProps)(AppRouter)
