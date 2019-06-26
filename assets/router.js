import {store} from './store.js'
import * as actions from './actions.js'
import {AppRouter} from './app.js'


const routes = [
  { path: '/', action: () => ({view:'home'}) },
  { path: '/subscriptions', action: () => ({view:'subscriptions'}) },
  { path: '/subscriptions/(.*)', action: () => ({view:'subscriptions-detail'}) },
  { path: '/player', action: () => ({view:'player'}) },
  { path: '/player/(.*)', action: () => ({view:'player'}) },
  { path: '/downloads', action: () => ({view:'downloads'}) },
  { path: '(.*)', action: () => ({view:'404'}) }
]

class SimpleRouter {
  constructor(routes) {
    this.routes = routes
  }
  async resolveRoute({pathname}) {
    for (let route of this.routes) {
      let res = pathname.match( `^${route.path}$` )
      if (res) {
        return { view: route.action().view,
                 params: res.splice(1) }
      }
    }
  }
}

//export const router = new UniversalRouter(routes)
export const router = new SimpleRouter(routes)

function mapStateToProps(state) {
  const viewmap = {
    '/': 'home',
    '/subscriptions': 'subscriptions',
    '/player':'player',
    '/downloads':'downloads'
  }

  return {
    view: state.router && (viewmap[state.router.pathname] || state.router.pathname),
    router: state.router
  }
}


export const ConnectedAppRouter = ReactRedux.connect(mapStateToProps)(AppRouter)
