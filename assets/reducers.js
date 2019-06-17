
function pathname(state = null, action) {
  if (action.type == 'ROUTE_CHANGED') {
    return action.payload.pathname
  }
  return state
}

function playlists(state = null, action) {
  if (action.type == 'PLAYLISTS_RECEIVED') {
    return action.payload
  }
  return state
}
function subscriptions(state = null, action) {
  if (action.type == 'SUBS_RECEIVED') {
    return action.payload
  }
  return state
}

function status(state = {}, action) {
  switch(action.type) {
    case 'GAPI_CLIENT_LOADED':
    case 'FS_READY':
      const newstate = {...state}
      newstate[action.type] = true
      return newstate
  }
  return state
}

export const reducer = Redux.combineReducers({
  subscriptions,
  playlists,
  pathname,
  status,
})
