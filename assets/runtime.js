import {store} from './store.js'
import * as actions from './actions.js'
import {ConnectedAppRouter} from './router.js'
import {doDatabaseStuff} from './db.js'

window._store = store

ReactDOM.render(
  (
    <ReactRedux.Provider store={store}>
      <ConnectedAppRouter />
    </ReactRedux.Provider>)
  ,document.getElementById('root')
)

  
doDatabaseStuff()
// sets window.db for debugging

store.dispatch( actions.request_fs() )
store.dispatch( actions.change_route() )
store.dispatch( actions.load_gapi_client() )
