const routes = [
  { path: '/', action: (context, params) => <AppRouter view='home' /> },
  { path: '/subscriptions', action: () => <AppRouter view='subscriptions' /> },
  { path: '/player', action: () => <AppRouter view='player' /> },
  { path: '/downloads', action: () => <AppRouter view='downloads' /> },
  { path: '(.*)', action: () => <AppRouter view='404' /> }
]

const router = new UniversalRouter(routes)



function resolve_router(pathname) {
  pathname = pathname || window.location.pathname
  router.resolve({ pathname: pathname }).then(component => {
    ReactDOM.render(component, document.getElementById('root'))
    // renders: <h1>Page One</h1>
  })
}
resolve_router()



