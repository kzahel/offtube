import {JSONView} from './common.js'
import * as actions from './actions.js'
const {Card} = MaterialUI
import {Playlist} from './playlist.js'
import {PlaylistItem} from './playlistitem.js'
import {SampleVideo} from './video.js'

function HomeComponent({dispatch, ...props}) {
  const [loading, setLoading] = React.useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = React.useState(null)

  React.useEffect(() => {
    if (loading && props.playlists) setLoading(false)
    if (! loading &&
        ! props.playlists &&
        props.gapi) {
      setLoading(true)
      dispatch( actions.getplaylists() )
    }
  })

  function basic_render() {
    return (
      <div>
        playlists! {loading}
        Loading: <span>{JSONView({loading})}</span>
        {JSONView(props)}
      </div>
    )
  }

  function render() {
    let playlists = [];
    if (!_.isEmpty(props.playlists)) {
      for (let playlist of props.playlists) {
        //        let actions = {onClickPlaylist:this.onClickPlaylist.bind(this,playlist.id)};
        let actions = {onClickPlaylist:()=>{setSelectedPlaylistId(playlist.id)}}
        playlists.push(<PlaylistItem {...playlist} key={playlist.id}
                                     actions={actions} />);
      }
    }
    let selectedPlaylist
    if (selectedPlaylistId) {
      for (var playlist of props.playlists) {
        if (playlist.id === selectedPlaylistId) break
      }
      selectedPlaylist = (
        <Playlist key={playlist.id} id={playlist.id} />
      );
    }
    return (
      <React.Fragment>
        <Card className="introtext" >
          Audio playback webapp (with background play).
          { props.gapi ? null: 'Sign in to access your playlists.' }
        </Card>
        { ( ! props.gapi ) ?
          <SampleVideo videoid="hnme8REPenQ" /> : null }
        {playlists}
        {selectedPlaylist}
        {false ?
         <pre className="mypre">{JSONView(this.state)}</pre> : null }
      </React.Fragment>
    )
  }
  return render()
}

function mapState(state) {
  return {
    gapi: state.status.GAPI_CLIENT_LOADED,
    playlists: state.playlists
  }
}

export const Home = ReactRedux.connect(mapState)(HomeComponent)
