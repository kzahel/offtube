import {Video} from './video.js'
const {Box} = MaterialUI


function PlaylistComponent(props) {
  const [items, setItems] = React.useState([])

  async function loaditems() {
    // TODO -- put thru dispatch / connect
    let allitems = []
    let resp
    let pageToken = null
    let opts
    let alldone = false
    while (true) {
      opts = {
        part: "snippet,contentDetails",
        pageToken,
        maxResults: 50,
        playlistId: props.id
      }
      resp = await gapi.client.youtube.playlistItems.list(opts)
      if (resp.result.nextPageToken) {
        pageToken = resp.result.nextPageToken
      } else {
        alldone = true
      }
      allitems = allitems.concat( resp.result.items )
      // await new Promise(r=>setTimeout(r,1000))
      if (alldone) break
    }
    // could also filter for "private"
    allitems = allitems.filter( item => item.snippet.title !== 'Deleted video' )
    allitems.sort( (a,b) => b.snippet.position - a.snippet.position )
    setItems(allitems)
  }

  React.useEffect( () => {

    if (! items.length && props.gapi && props.youtubeLoggedIn) {
      loaditems()
    }
  }, [props.gapi, props.youtubeLoggedIn])
  
  function render() {

    if (! items.length) {
      return <MaterialUI.CircularProgress />
    }
    
    const resitems = []
    for (let item of items) {
      const id = item.snippet.resourceId.videoId
      resitems.push( (
        <div key={id} className="playlist">
          <Video {...item} id={id} />
        </div>
      )
      )
    }
    return (
      <Box>
        <div>Playlist {props.id}
          {resitems}
        </div>
      </Box>
    )
  }
  return render()
}

function mapState(state) {
  return {
    youtubeLoggedIn: state.status.YOUTUBE_USER_AUTHENTICATED,
    gapi: state.status.GAPI_CLIENT_LOADED,
  }
}

export const Playlist = ReactRedux.connect(mapState)(PlaylistComponent)
