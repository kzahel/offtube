import {initfs, gapi_client_credentials} from './index.js'
import * as api from './api.js'
import {store} from './store.js'
import {router} from './router.js'
import {SAVEPATH,getfile} from './index.js'

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

/*export function downloadmedia(id, format_id) {
  return { type: 'MEDIA_DOWNLOAD_STARTED', payload:{id,format_id} }
}*/

export function getformats({id,url}) {
  return async function(dispatch) {
    dispatch( { type: 'MEDIA_FORMATS_REQUESTED', payload:{id,url} } )
    // TODO -- check if already have formats
    const formats = await api.get_video_formats({id,url})
    dispatch( { type: 'MEDIA_FORMATS_RECEIVED', payload:{id,url,formats} } )
    return formats
  }
}

export function deletemedia(id, props) {
  return async function(dispatch) {
    if (props.file) {
      if (props.mediaurl) {
        URL.revokeObjectURL(props.mediaurl)
      }
      // todo try catch ?
      await fs.unlink(getmediapath(id,'mp4'))
      await fs.unlink(getmediapath(id,'json'))
    }
    dispatch({type:'MEDIA_DELETED',payload:{id}})
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
    dispatch({type:'MEDIA_DOWNLOAD_STARTED',payload:{id,url}})
    const resp = await fetch(url)
    const stream = resp.body
    const outstream = fs.createWriteStream(mediapath)
    const reader = stream.getReader()
    const writer = outstream.getWriter()
    let bytesdown = 0
    const progress = _.throttle( function(bytesdown) {
      dispatch({type:"MEDIA_DOWNLOAD_PROGRESS", payload:{id,bytesdown}})
    }, 250, {trailing:false})
    while (true) {
      let result = await reader.read()
      if (result.done) break
      bytesdown += result.value.length
      progress(bytesdown)
      try {
        await writer.write(result.value)
      } catch(e) {
        const {name, message} = e
        dispatch({type:'MEDIA_DOWNLOAD_FAILED',payload:{id,url,error:{name,message}}})
        return
      }
      // TODO -- delete file if there is some kind of error...
    }
    writer.close()
    await fs.writeFile(mediainfopath, JSON.stringify(formats))
    const fileentry = await fs.getEntry(mediapath)
    const file = await getfile(fileentry)
    dispatch({type:'MEDIA_DOWNLOAD_COMPLETED',payload:{id,url,file,bytesdown}})
  }  
}


export function dodownload({id, url}) {
  console.assert(id||url)
  return async function(dispatch) {
    // TODO ensure FS loaded / ready
    const state = store.getState()
    if (state.media[id]) {
      if (state.media[id].downloading) return
      if (state.media[id].file) return
    }
    const formats = await getformats({id,url})(dispatch)
    if (formats.error) {
      dispatch({type:'MEDIA_DOWNLOAD_FAILED',payload:{id,url,error:formats.stderr}})
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
    dispatch({type:'MEDIA_FS_LOAD_STARTED',payload:{id}})
    let fileentry, formats, file;

    try {
      fileentry = await fs.getEntry(getmediapath(id,'mp4'))
      file = await getfile(fileentry)
      formats = await fs.readFile(getmediapath(id,'json'))
      formats = JSON.parse(formats)
    } catch(error) {
      dispatch({type:'MEDIA_FS_LOAD_EXCEPTION',payload:{file,formats,id,error}})
      return
    }
    dispatch({type:'MEDIA_FS_LOAD_FINISHED',payload:{file,formats,id}})
  }
}


export function playmedia(id, title, url) {
  return async function(dispatch) {
    dispatch( {type:'PLAY_MEDIA', payload:{id,title,url}} )
  }
}

export function youtubelogout() {
  return async function(dispatch) {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    //GoogleAuth.disconnect(); // this will deauthorize the app
    GoogleAuth.signOut()
    dispatch( {type:'YOUTUBE_LOGGED_OUT'} )
  }
}

export function request_fs() {
  return async function(dispatch) {
    dispatch( {type:'FS_REQUESTED'} )
    await initfs()
    dispatch( {type:'FS_READY'} )
  }
}

export function load_gapi_client() {
  return async function(dispatch) {
    dispatch( {type:'GAPI_LOADING'} )
    
    await (new Promise(resolve => {
      gapi.load('client',resolve)
    }))


    gapi.client.init(gapi_client_credentials()).then( () => {
      dispatch( {type:'GAPI_CLIENT_LOADED'} )
      //this.setState({clientReady:true})
      //this.youtubelogin({silent:true})
      dispatch( youtubelogin({silent:true}) )
    }).catch( (e) => {
      dispatch( {type:'GAPI_CLIENT_ERROR', payload:e} )
      //this.setState({error:e.details})
    })
  }
}
export function youtubelogin({silent}) {
  return async function(dispatch) {
    const gauth = gapi.auth2.getAuthInstance();
    // GoogleAuth.isSignedIn.listen(this.updateSigninStatus);
    const guser = gauth.isSignedIn.get()
    if (guser) {
      //this.setState({youtubeSignedIn: true})
      const id_token = gauth.currentUser.get().getAuthResponse().id_token
      dispatch( {type:'YOUTUBE_USER_AUTHENTICATED', payload:{id_token}} )
      //console.log('id_token',id_token);
    } else {
      //console.log('nope. try signin?')
      if (silent) return
      dispatch( {type:'YOUTUBE_AUTHORIZE_REQUESTED' } )
      gauth.signIn().then( res => {
        const id_token = gauth.currentUser.get().getAuthResponse().id_token
        dispatch( {type:'YOUTUBE_USER_AUTHENTICATED', payload:{id_token}} )
        //this.setState({youtubeSignedIn: true})
      }).catch( err => {
        dispatch( {type:'YOUTUBE_USER_LOGIN_FAILED', payload:err} )
        //this.setState({youtubeSignedIn: false})
      })
    }
  }
}


export function getsubscriptions() {
  return async function(dispatch) {
    dispatch( {type:'SUBS_REQUESTED'} )
    const subscriptions = await api.yt3_getsubscriptions()
    dispatch( {type:'SUBS_RECEIVED', payload: subscriptions } )
  }
}
export function getplaylists() {
  return async function(dispatch) {
    dispatch( {type:'PLAYLISTS_REQUESTED'} )
    const items = await api.yt3_getplaylists()
    dispatch( {type:'PLAYLISTS_RECEIVED', payload: items } )
  }
}

export function change_route(pathname = window.location.pathname, data = null) {
  return async function(dispatch) {
    router.resolveRoute({ pathname: pathname }).then(data => {
      history.pushState(null, null, pathname )
      dispatch( {type:'ROUTE_CHANGED', payload:{pathname, data}} )
      // ReactDOM.render(component, document.getElementById('root'))
      // renders: <h1>Page One</h1>
    }).catch(e=>{
      console.warn('404 resolve path')
      // store.dispatch( actions.change_route(null, {error:'notfound'}) )
    })
  }
}
