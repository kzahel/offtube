import {types} from './actions.js'

function router(state = null, action) {
  if (action.type == types.ROUTE_CHANGED) {
    return action.payload
  }
  return state
}

function playlists(state = null, action) {
  if (action.type == types.PLAYLISTS_RECEIVED) {
    return action.payload
  }
  return state
}
function subscriptions(state = null, action) {
  if (action.type == types.SUBS_RECEIVED) {
    return action.payload
  }
  return state
}

function status(state = {}, action) {
  const newstate = {...state}
  switch(action.type) {
    case types.GAPI_CLIENT_LOADED:
    case types.YOUTUBE_USER_AUTHENTICATED:
    case types.FS_READY:
      newstate[action.type] = true
      return newstate
    case types.YOUTUBE_LOGGED_OUT:
      newstate[types.YOUTUBE_USER_AUTHENTICATED]=false
      newstate[action.type] = true
      return newstate
  }
  return state
}

function player(state = {}, action) {
  switch(action.type) {
    case types.PLAY_MEDIA:
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
  
  switch(action.type) {
    case types.DOWNLOADS_LIST_RECEIVED:
      const data = action.payload.filesById
      const newstate = {...state}
      for (let id of Object.keys(data)) {
        newstate[id] = {...(state[id]||{}), ...data[id]}
      }
      return newstate
    case true:
      console.assert(id,'need id for media reducers')
      if (! id) return state
    case types.MEDIA_FS_LOAD_STARTED:
      return {
        ...state,
        [id]:{id, ...state[id], fs_loading:true }
      }
    case types.MEDIA_DELETED:
      const newmedia = {...state[id]}
      delete newmedia.file
      delete newmedia.error
      delete newmedia.fileEntry
      delete newmedia.mediaurl
      delete newmedia.formats
      
      return {
        ...state,
        [id]:newmedia
      }
    case types.MEDIA_DOWNLOAD_STARTED:
      return {
        ...state,
        [id]:{...state[id], downloading:true}
      }
    case types.MEDIA_FORMATS_RECEIVED:
      return {
        ...state,
        [id]:{...state[id], ...action.payload}
      }
    case types.MEDIA_DOWNLOAD_PROGRESS:
      return {
        ...state,
        [id]:{...state[id], ...action.payload, downloading:true}
      }
    case types.MEDIA_DOWNLOAD_COMPLETED:
      return {
        ...state,
        [id]:{...state[id], ...action.payload, downloading:false}
      }
    case types.MEDIA_DOWNLOAD_FAILED:
      return {
        ...state,
        [id]:{...state[id], ...action.payload, downloading:false}
      }
    case types.MEDIA_FS_LOAD_FINISHED:
      console.assert(id)
      return {
        ...state,
        [id]:{id, ...state[id], ...action.payload, fs_loading:false }
      }
    case types.MEDIA_FS_LOAD_EXCEPTION:
      console.assert(id)
      return {
        ...state,
        [id]:{id, ...state[id], ...action.payload, fs_loading:false }
      }
    case types.MEDIA_URL_GENERATED:
      return {
        ...state,
        [id]:{...state[id], ...action.payload}
      }
  }
              
  return state
}

function filesystem(state = null, action) {
  return state
}
function downloads(state = null, action) {
  return state
}


export const reducer = Redux.combineReducers({
  subscriptions, // youtube api responses
  playlists, // youtube api responses
  router, // stores url and param info
  filesystem, // not used yet
  status, // loaded state. fs, etc.
  media, // stores info about media
//  downloads, // download sessions (keyed by url or id)
  player, // state of the player
})
