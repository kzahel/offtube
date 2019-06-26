import {HideOnScroll, JSONView} from './common.js'
import {SimpleBottomNavigation} from './nav.js'
import {SampleVideo} from './video.js'
import {gapi_client_credentials} from '/index.js'
import * as api from './api.js'
import {PlaylistItem} from './playlistitem.js'
import {Playlist} from './playlist.js'
import {Downloads} from './downloads.js'
import {Subscriptions} from './subscriptions.js'
import {Home} from './home.js'
import {youtubelogin, youtubelogout} from './actions.js'
import {Player} from './player.js'

const {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  Icon,
  IconButton,
  Dialog,
  DialogTitle
} = MaterialUI;
const MUI = MaterialUI


export class AppRouter extends React.Component {
  componentDidUpdate = (prevProps, prevState) => {
  }
  render() {
    return <App router={this.props} view={this.props.view} />
  }
}

function AppComponent({dispatch, router, ...props}) {

  const [open, setOpen] = React.useState(false)
  
  function render_main() {
    // player component hideshows instead of render main
    if (props.view && props.view.startsWith('/player')) return null
    //console.log('render_main',props)
    switch(props.view) {
      case 'home':
        return <Home />
      case 'playlists':
        const playlistId = router.router.data.params[0]
        return <Playlist id={playlistId}/>
      case 'player':
        // it only hide/shows
        return null
      case 'subscriptions':
        return <Subscriptions />
      case 'subscriptions-detail':
        return <div>sub detail</div>
      case 'downloads':
        return <Downloads />
      default:
        return (
        <div>
          404 not found!
          {JSONView({props,router})}
        </div>
        )

    }
  }
  function render() {
    return (
      <React.Fragment>
        <MaterialUI.CssBaseline />        
        <HideOnScroll>
        <AppBar position="fixed" color="default">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Offtube
              { props.youtubeLoggedIn ?
                <Button color="primary" onClick={props.actions.youtubelogout}>Logout</Button> :
                <Button color="primary" onClick={props.actions.youtubelogin}>Login</Button> }
            </Typography>
          </Toolbar>
        </AppBar>
        </HideOnScroll>

        <div className="content">
          <Player />

          {false ? JSONView(props) : null}
          {render_main()}
        </div>

        <SimpleBottomNavigation view={props.view} />
      </React.Fragment>
    );
  };
  return render()
}

function mapStateToProps(state) {
  return {
    gapi: state.status.GAPI_CLIENT_LOADED,
    pathname: state.router && state.router.pathname,
    youtubeLoggedIn: state.status.YOUTUBE_USER_AUTHENTICATED
  }
}
function mapDispatch(dispatch) {
  return {
    actions: Redux.bindActionCreators(
      {youtubelogout,
       youtubelogin}, dispatch)
  }
}

export const App = ReactRedux.connect(mapStateToProps, mapDispatch)(AppComponent)


