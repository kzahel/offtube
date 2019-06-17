var provider = new firebase.auth.GoogleAuthProvider();
window.offtube = {}

var {
  AppBar,
  Container,
  Box,
  Paper,
  Toolbar,
  Typography,
  Switch,
  Button,
  InputLabel,
  Tab,
  Select,
  Card,
  BottomNavigation,
  BottomNavigationAction,
  RestoreIcon, FavoriteIcon, LocationOnIcon, Icon,
} = MaterialUI;
const MUI = MaterialUI

export function gapi_client_credentials() {
  if (false) { // offtube
    return {
      'apiKey': 'AIzaSyDpPRUEO4MbFUvsu_xr7rq-hldSOgmErbA',
      'clientId': '626079761983-u314s39n87rnpf84molva3k010l4v4jn.apps.googleusercontent.com',
      'scope': 'https://www.googleapis.com/auth/youtube.readonly',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }
  } else if (window.location.host.endsWith('8880')) { // offtube 2
    return {
      clientId: '206048614698-ur2gfmrbo26sqod6k9c3dhf7bet1r624.apps.googleusercontent.com',
      apiKey: 'AIzaSyAEgNx53h-Wb8wfKpjk6M4IazKNYtdyvWM',
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }
  } else { // chromebeat
    return {
      clientId: '531895569173-n0iteoa4ibmgj02hnrti0fifv833q8b4.apps.googleusercontent.com',
      apiKey: 'AIzaSyAU_PQMxeGRy7KJJb4zdrUTzRh-9UdKHLA',
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }
  }
}


//gapi.load('client', initClient);
//initfs()

export async function initfs() {
  const MB = 1024 * 1024
  await fs.init({type: window.PERSISTENT, bytes: 1024 * MB});
  /*
  await fs.mkdir('dir');
  await fs.writeFile('dir/file.txt', 'hello world');
  const content = await fs.readFile('dir/file.txt');
  console.log(content); // => "hello world"
  */
}

export async function sleep(t) {
  return new Promise( resolve => {
    setTimeout( resolve, t*1000 )
  })
}
export async function getfile(entry) {
  return new Promise((resolve,reject)=>{
    entry.file(resolve,reject)
  })
}
export const SAVEPATH = 'saves2'

document.addEventListener("DOMContentLoaded", ()=>{
  /*
  document.querySelector("div#youtubelogin").addEventListener('click',youtubelogin)
  document.querySelector("div#login").addEventListener('click',login)
  document.querySelector("div#add").addEventListener('click',add)
  document.querySelector("div#query").addEventListener('click',query)
  document.querySelector("div#initfs").addEventListener('click',initfs)
  */
});
