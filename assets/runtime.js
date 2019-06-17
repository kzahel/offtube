import {store} from './store.js'
import * as actions from './actions.js'
import {ConnectedAppRouter, resolve_router} from './router.js'

window._store = store


ReactDOM.render(
  (
    <ReactRedux.Provider store={store}>
      <ConnectedAppRouter />
    </ReactRedux.Provider>)
  ,document.getElementById('root')
)
//store.subscribe( () => console.log('store change',store.getState() ) )
store.dispatch( actions.request_fs() )
resolve_router()

store.dispatch( actions.load_gapi_client() )
