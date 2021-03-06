import {JSONView} from './common.js'
import * as actions from './actions.js'
import {store} from './store.js'
const {Card} = MaterialUI
import {Playlist} from './playlist.js'
import {PlaylistItem} from './playlistitem.js'
import {SampleVideo} from './video.js'
const {Button, TextField, FormControl, InputLabel, Input, FormHelperText} = MaterialUI
import {DownloadsInProgress} from './downloads.js'
import {parseUrlParams} from './common.js'

function InputURL() {
  function onSubmit(e) {
    const url = e.target[0].value
    const params = parseUrlParams(url)
    if (params) {
      const id = params.v
      store.dispatch(actions.dodownload({id}))
    } else {
      store.dispatch(actions.dodownload({url})) // todo make this work
    }
    e.target[0].value = ''
    e.preventDefault()
  }
  return (
    <form  onSubmit={onSubmit}>
  <FormControl>
    <InputLabel htmlFor="my-input">Youtube URL</InputLabel>
    <Input name="url" id="my-input" aria-describedby="my-helper-text" />
    <FormHelperText id="my-helper-text">Enter youtube URL to download it</FormHelperText>
    <Button type="submit">Download</Button>
  </FormControl>
    </form>
    )
}

function HomeComponent({dispatch, ...props}) {
  const [loading, setLoading] = React.useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = React.useState(null)

  React.useEffect(() => {
    if (loading && props.playlists) setLoading(false)
    if (! loading &&
        ! props.playlists &&
        props.youtubeLoggedIn) {
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
        let a = {onClickPlaylist:()=>{
          //setSelectedPlaylistId(playlist.id)
          dispatch(actions.change_route(`/playlists/${playlist.id}`))
        }}
        playlists.push(<PlaylistItem {...playlist} key={playlist.id}
                                     actions={a} />);
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
          { props.youtubeLoggedIn ? null:
          <React.Fragment>
            {' '}Sign in to access your playlists.
          </React.Fragment>}
            <InputURL />
            <DownloadsInProgress />
            <br />
        </Card>
        { ( ! props.youtubeLoggedIn ) ?
          <SampleVideo videoid="hnme8REPenQ" />
          : null }

        {selectedPlaylist}

        
        {playlists}
        {false ?
         <pre className="mypre">{JSONView(this.state)}</pre> : null }
      </React.Fragment>
    )
  }
  return render()
}

function mapState(state) {
  return {
    youtubeLoggedIn: state.status.YOUTUBE_USER_AUTHENTICATED,
    gapi: state.status.GAPI_CLIENT_LOADED,
    playlists: state.playlists
  }
}

export const Home = ReactRedux.connect(mapState)(HomeComponent)
