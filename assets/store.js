import {reducer} from './reducers.js'



const middleware = [
  ReduxThunk.default.withExtraArgument({foobar:23}),
  reduxLogger.createLogger()
]

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
  }) : Redux.compose;

const enhancer = composeEnhancers(
  Redux.applyMiddleware(...middleware),
  // other store enhancers if any
);

const store = Redux.createStore(reducer,enhancer)


export {store}

