import {Video} from './video.js'
const {Box} = MaterialUI


function PlaylistComponent(props) {
  const [items, setItems] = React.useState([])

  async function loaditems() {
    // TODO -- put thru dispatch / connect
    const resp = await gapi.client.youtube.playlistItems.list({
      "part": "snippet,contentDetails",
      "maxResults": 50,
      "playlistId": props.id
    })
    resp.result.items.sort( (a,b) => b.snippet.position - a.snippet.position )
    setItems(resp.result.items)
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
