import {initfs, gapi_client_credentials} from './index.js'
import * as api from './api.js'

export function playmedia(id, title, url) {
  return function(dispatch) {
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

export function change_route(pathname) {
  history.pushState(null, null, pathname )
  return {type:'ROUTE_CHANGED', payload:{pathname:pathname}}
}


