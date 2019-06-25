import {initfs, gapi_client_credentials} from './index.js'
import * as api from './api.js'
import {store} from './store.js'
import {router} from './router.js'
import {getfilenameid} from './common.js'
import {SAVEPATH,getfile} from './index.js'

function maketypes() {
  const types = `
MEDIA_DOWNLOAD_STARTED
MEDIA_FORMATS_REQUESTED
MEDIA_FORMATS_RECEIVED
MEDIA_DELETED
MEDIA_DOWNLOAD_PROGRESS
MEDIA_DOWNLOAD_FAILED
MEDIA_DOWNLOAD_COMPLETED
MEDIA_FS_LOAD_STARTED
MEDIA_FS_LOAD_FINISHED
MEDIA_FS_LOAD_EXCEPTION
PLAY_MEDIA
FS_REQUESTED
FS_READY
GAPI_LOADING
GAPI_CLIENT_LOADED
GAPI_CLIENT_ERROR
YOUTUBE_AUTHORIZE_REQUESTED
YOUTUBE_USER_AUTHENTICATED
YOUTUBE_USER_LOGIN_FAILED
YOUTUBE_LOGGED_OUT
SUBS_REQUESTED
SUBS_RECEIVED
PLAYLISTS_REQUESTED
PLAYLISTS_RECEIVED
PLAYLIST_REQUESTED
PLAYLIST_RECEIVED
ROUTE_CHANGED
MEDIA_URL_GENERATED
DOWNLOADS_LIST_FAILED
DOWNLOADS_LIST_RECEIVED
  `.split('\n').filter(s=>!!s.trim())

  const typesMap = {}
  for (let type of types) {
    typesMap[type]=type
  }

  let handler = {
    get(target, name) {
      if (! target[name]) console.error(`Undefined action type ${name}`)
      return target[name]
    }
  }

  let obj = new Proxy(typesMap,handler);
  return obj
}
export const types = maketypes()


function getmediapath(id, type, url) {
  return `${SAVEPATH}/${id}.${type}`
}

function select_audio_format(formats) {
  if (formats.length === 1) return formats[0]
  let audio_formats = []
  for (let format of formats) {
    if (format.format.indexOf('audio only') != -1 ||
        format.width === null ||
        format.vcodec == 'none') {
      audio_formats.push(format)
    }
  }
  audio_formats.sort((a,b)=>(b.abr-a.abr))
  // highest bitrate
  return audio_formats[0]
}

export function listDownloads() {
  return async function(dispatch) {
    console.log('load downloads!')
    if (! store.getState().status.FS_READY) {
      // todo remove this, not necessary.
      return dispatch( { type:types.DOWNLOADS_LIST_FAILED, payload: 'fs_not_ready' } )
    }
    let files = await fs.readdir(`${SAVEPATH}`)
    files = files.filter( f => f.name.endsWith('.mp4') )
    files = files.filter( f => ! f.name.startsWith('undefined') )
    const ids = files.map( f => getfilenameid(f.name) )
    let obj = {}
    for (let [idx,id] of ids.entries()) {
      obj[id] = {fileEntry:files[idx]}
    }
    dispatch({type:types.DOWNLOADS_LIST_RECEIVED, payload:{filesById:obj}})
  }
}

export function getformats({id,url}) {
  return async function(dispatch) {
    dispatch( { type: types.MEDIA_FORMATS_REQUESTED, payload:{id,url} } )
    // TODO -- check if already have formats
    const formats = await api.get_video_formats({id,url})
    dispatch( { type: types.MEDIA_FORMATS_RECEIVED, payload:{id,url,formats} } )
    return formats
  }
}

export function deletemedia(props) {
  const {id, file} = props
  console.assert(id)

  return async function(dispatch) {
    if (props.file) {
      if (props.mediaurl) {
        try {
          URL.revokeObjectURL(props.mediaurl)
          } catch(e){}
      }
      try{
        await fs.unlink(getmediapath(id,'mp4'))
      }catch(e){}
      try{
        await fs.unlink(getmediapath(id,'json'))
      }catch(e){}
    }
    dispatch({type:types.MEDIA_DELETED,payload:{id}})
  }
}

function getDerivedId({id, url, formats}) {
  if (id) return id
  if (formats.id) return formats.id
  return url
}

export function downloadsave(id, url, formats) {
  console.assert(id)
  //if (! id) id = decodeurlparams(url)
  const mediapath = getmediapath(id,'mp4')
  const mediainfopath = getmediapath(id,'json')
  return async function (dispatch) {
    const resp = await fetch(url)
    const stream = resp.body
    const outstream = fs.createWriteStream(mediapath)
    const reader = stream.getReader()
    const writer = outstream.getWriter()
    let bytesdown = 0
    const progress = _.throttle( function(bytesdown) {
      dispatch({type:types.MEDIA_DOWNLOAD_PROGRESS, payload:{id,bytesdown}})
    }, 250, {trailing:false})
    while (true) {
      try {
        var result = await reader.read()
      } catch(e) {
        const {name, message} = e
        dispatch({type:types.MEDIA_DOWNLOAD_FAILED,payload:{id,url,error:{name,message}}})
        return
      }
      if (result.done) break
      bytesdown += result.value.length
      progress(bytesdown)
      try {
        await writer.write(result.value)
      } catch(e) {
        const {name, message} = e
        dispatch({type:types.MEDIA_DOWNLOAD_FAILED,payload:{id,url,error:{name,message}}})
        return
      }
      // TODO -- delete file if there is some kind of error...
    }
    writer.close()
    await fs.writeFile(mediainfopath, JSON.stringify(formats))
    const fileentry = await fs.getEntry(mediapath)
    const file = await getfile(fileentry)
    dispatch({type:types.MEDIA_DOWNLOAD_COMPLETED,payload:{id,url,file,bytesdown}})
  }  
}

export function dodownload({id, url}) {
  console.assert(id||url)
  return async function(dispatch) {
    // TODO ensure FS loaded / ready
    const state = store.getState()
    if (state.media[id]) {
      if (state.media[id].downloading) return // already downloading!
      if (state.media[id].file) return
    }
    dispatch({type:types.MEDIA_DOWNLOAD_STARTED,payload:{id,url}})
    const formats = await getformats({id,url})(dispatch)
    if (formats.error) {
      dispatch({type:types.MEDIA_DOWNLOAD_FAILED,payload:{id,url,error:formats.stderr}})
      return
    }
    const format = select_audio_format(formats.formats)
    const format_id = format.format_id
    const vidurl = api.get_video_url({id,url}, format_id)
    const derivedId = getDerivedId({id,url,formats})
    console.assert(derivedId)
    await downloadsave(derivedId,vidurl,formats)(dispatch)
  }
}

export function mediaload(id) {
  console.assert(id)
  console.assert(id.length < 15)
  return async function(dispatch) {
    dispatch({type:types.MEDIA_FS_LOAD_STARTED,payload:{id}})
    let fileentry, formats, file;

    try {
      fileentry = await fs.getEntry(getmediapath(id,'mp4'))
      file = await getfile(fileentry)
      formats = await fs.readFile(getmediapath(id,'json'))
      formats = JSON.parse(formats)
    } catch(error) {
      dispatch({type:types.MEDIA_FS_LOAD_EXCEPTION,payload:{file,formats,id,error}})
      return
    }
    dispatch({type:types.MEDIA_FS_LOAD_FINISHED,payload:{file,formats,id}})
  }
}

export function playmedia(id, title, url) {
  return async function(dispatch) {
    dispatch( {type:types.PLAY_MEDIA, payload:{id,title,url}} )
  }
}

export function youtubelogout() {
  return async function(dispatch) {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    //GoogleAuth.disconnect(); // this will deauthorize the app
    GoogleAuth.signOut()
    dispatch( {type:types.YOUTUBE_LOGGED_OUT} )
  }
}

export function request_fs() {
  return async function(dispatch) {
    dispatch( {type:types.FS_REQUESTED} )
    await initfs()
    dispatch( {type:types.FS_READY} )
  }
}

export function load_gapi_client() {
  return async function(dispatch) {
    dispatch( {type:types.GAPI_LOADING} )
    
    await (new Promise(resolve => {
      gapi.load('client',resolve)
    }))


    gapi.client.init(gapi_client_credentials()).then( () => {
      dispatch( {type:types.GAPI_CLIENT_LOADED} )
      dispatch( youtubelogin({silent:true}) )
    }).catch( (e) => {
      dispatch( {type:types.GAPI_CLIENT_ERROR, payload:e} )
    })
  }
}
export function youtubelogin({silent}) {
  return async function(dispatch) {
    const gauth = gapi.auth2.getAuthInstance();
    // GoogleAuth.isSignedIn.listen(this.updateSigninStatus);
    const guser = gauth.isSignedIn.get()
    if (guser) {
      const id_token = gauth.currentUser.get().getAuthResponse().id_token
      dispatch( {type:types.YOUTUBE_USER_AUTHENTICATED, payload:{id_token}} )
    } else {
      if (silent) return
      dispatch( {type:types.YOUTUBE_AUTHORIZE_REQUESTED } )
      gauth.signIn().then( res => {
        const id_token = gauth.currentUser.get().getAuthResponse().id_token
        dispatch( {type:types.YOUTUBE_USER_AUTHENTICATED, payload:{id_token}} )
      }).catch( err => {
        dispatch( {type:types.YOUTUBE_USER_LOGIN_FAILED, payload:err} )
      })
    }
  }
}


export function getsubscriptions() {
  return async function(dispatch) {
    dispatch( {type:types.SUBS_REQUESTED} )
    const subscriptions = await api.yt3_getsubscriptions()
    dispatch( {type:types.SUBS_RECEIVED, payload: subscriptions } )
  }
}
export function getplaylists() {
  return async function(dispatch) {
    dispatch( {type:types.PLAYLISTS_REQUESTED} )
    const items = await api.yt3_getplaylists()
    dispatch( {type:types.PLAYLISTS_RECEIVED, payload: items } )
  }
}

export function change_route(pathname = window.location.pathname, data = null) {
  return async function(dispatch) {
    router.resolveRoute({ pathname: pathname }).then(data => {
      history.pushState(null, null, pathname )
      dispatch( {type:types.ROUTE_CHANGED, payload:{pathname, data}} )
      // ReactDOM.render(component, document.getElementById('root'))
      // renders: <h1>Page One</h1>
    }).catch(e=>{
      console.warn('404 resolve path')
      // store.dispatch( actions.change_route(null, {error:'notfound'}) )
    })
  }
}
