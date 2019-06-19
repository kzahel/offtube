
function pathname(state = null, action) {
  if (action.type == 'ROUTE_CHANGED') {
    return action.payload.pathname
  }
  return state
}
function router(state = null, action) {
  if (action.type == 'ROUTE_CHANGED') {
    return action.payload
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

function media(state = {}, action) {
  let id
  if (action.payload && action.payload.id) { id = action.payload.id }
  if (! id) return state
  
  switch(action.type) {
    case 'MEDIA_FS_LOAD_STARTED':
      return {
        ...state,
        [id]:{...state[id], fs_loading:true }
      }
    case 'MEDIA_DELETED':
      const newmedia = {...state[id]}
      delete newmedia.file
      delete newmedia.mediaurl
      
      return {
        ...state,
        [id]:newmedia
      }
    case 'MEDIA_DOWNLOAD_STARTED':
      return {
        ...state,
        [id]:{...state[id], downloading:true}
      }
    case 'MEDIA_DOWNLOAD_PROGRESS':
      return {
        ...state,
        [id]:{...state[id], ...action.payload}
      }
    case 'MEDIA_DOWNLOAD_COMPLETED':
      return {
        ...state,
        [id]:{...state[id], ...action.payload, downloading:false}
      }
    case 'MEDIA_FS_LOAD_FINISHED':
      console.assert(id)
      return {
        ...state,
        [id]:{...state[id], ...action.payload, fs_loading:false }
      }
    case 'MEDIA_URL_GENERATED':
      return {
        ...state,
        [id]:{...state[id], ...action.payload}
      }
      
  }
              
  return state
}

export const reducer = Redux.combineReducers({
  subscriptions,
  playlists,
  router,
  pathname,
  status,
  media,
  player
})
