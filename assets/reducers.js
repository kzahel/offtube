
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
  const newstate = {...state}
  switch(action.type) {
    case 'GAPI_CLIENT_LOADED':
    case 'YOUTUBE_USER_AUTHENTICATED':
    case 'FS_READY':
      newstate[action.type] = true
      return newstate
    case 'YOUTUBE_LOGGED_OUT':
      newstate['YOUTUBE_USER_AUTHENTICATED']=false
      newstate[action.type] = true
      return newstate
  }
  return state
}

function player(state = {}, action) {
  switch(action.type) {
    case 'PLAY_MEDIA':
      return {
        ...state,
        ...action.payload
      }
  }
              
  
  return state
}

export const reducer = Redux.combineReducers({
  subscriptions,
  playlists,
  pathname,
  status,
  player
})
