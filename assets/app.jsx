class AppRouter extends React.Component {
  componentDidUpdate = (prevProps, prevState) => {
    console.log('update', this.props)
  }
  render() {
    return <App {...this.props}/>
  }
}

class App extends React.Component {
  state = {
    clientReady: false,
    youtubeSignedIn: false,
    selectedPlaylist: null,
    playlists: {},
    subscriptions: null,
    liked: {},
    currentNav: 'Recents'
  }
  componentDidUpdate = (prevProps, prevState) => {
    if (! prevState.youtubeSignedIn && this.state.youtubeSignedIn) {
      this.getplaylists();
    }
    if (_.isEmpty(prevState.playlists) &&
        this.state.playlists.items &&
        this.state.playlists.items.length
    ) {
      this.setState({selectedPlaylist:this.state.playlists.items[0].id})
    }
  }
  componentDidMount() {
    console.log('init app',this.props)
    console.log('gapi load')
    gapi.load('client',this.initClient)
  }
  youtubelogout = () => {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    //GoogleAuth.disconnect(); // this will deauthorize the app
    //GoogleAuth.setToken(null) // does not exist
    GoogleAuth.signOut()
    this.setState({
      youtubeSignedIn: false,
      playlists: {},
      liked: {},
      selectedPlaylist: null
    })
  }
  initClient = () => {
    console.log('gapi loaded; init client')
    gapi.client.init(gapi_client_credentials()).then( () => {
      this.setState({clientReady:true})
      this.youtubelogin({silent:true})
    }).catch( (e) => {
      this.setState({error:e.details})
    })
  }
  login = () => {
    console.log('login',this)
  }
  youtubelogin = ({silent}) => {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    GoogleAuth.isSignedIn.listen(this.updateSigninStatus);
    console.log('checking if signed in')
    const googleUser = GoogleAuth.isSignedIn.get()
    if (googleUser) {
      this.setState({youtubeSignedIn: true})
      const id_token = GoogleAuth.currentUser.get().getAuthResponse().id_token
      //console.log('id_token',id_token);
    } else {
      console.log('nope. try signin?')
      if (silent) return
      GoogleAuth.signIn().then( res => {
        this.setState({youtubeSignedIn: true})
      }).catch( err => {
        this.setState({youtubeSignedIn: false})
      })
    }
  }
  updateSigninStatus = (status) => {
    console.log('google youtube signed in listener', status)
    this.setState({youtubeSignedIn: status})
  }
  getplaylists = async () => {
    let resp = await gapi.client.youtube.playlists.list({
      "part": "snippet,contentDetails",
      "maxResults": 25,
      "mine": true
    })
    this.setState({playlists:resp.result})
  }
  getliked = async () => {
    const resp = await gapi.client.youtube.videos.list({
      "part": "snippet,contentDetails,statistics",
      "myRating": "like",
      "maxResults": 25,
    });
    this.setState({liked:resp.result})
  }
  onClickPlaylist = (id, evt) => {
    this.setState({selectedPlaylist:id})
  }
  navChange = () => {
  }
  render_main() {
    switch(this.props.view) {
      case 'home':
        return this.render_home()
      case 'player':
        return this.render_player()
      case 'subscriptions':
        return this.render_subscriptions()
      case 'downloads':
        return <Downloads />
      default:
        return "404 not found!"
    }
  }
  async load_subscriptions() {
    if (! this.state.youtubeSignedIn) return
    if (this.subscriptions_loading) return
    this.subscriptions_loading = true
    const subscriptions = await yt3_getsubscriptions()
    this.setState({subscriptions}, () => {
      this.subscriptions_loading = false
    })
  }
  render_subscriptions() {
    if (! this.state.subscriptions) {
      this.load_subscriptions()
      return 'Loading'
    } else {
      return JSONView(this.state.subscriptions)
    }
  }
  render_player() {
    return (<div>
      Player!
    </div>
    );
  }
  render_home() {
    let playlists = [];
    if (!_.isEmpty(this.state.playlists)) {
      for (let playlist of this.state.playlists.items) {
        let actions = {onClickPlaylist:this.onClickPlaylist.bind(this,playlist.id)};
        playlists.push(<PlaylistItem {...playlist} key={playlist.id}
                                     actions={actions} />);
      }
    }
    let selectedPlaylist = null
    if (this.state.selectedPlaylist) {
      for (var playlist of this.state.playlists.items) {
        if (playlist.id === this.state.selectedPlaylist) break
      }
      selectedPlaylist = (
        <Playlist key={playlist.id} id={playlist.id} />
      );
    }
    return (
      <React.Fragment>
        <Card className="introtext" >
          Offline youtube audio playback webapp (with background play).
          { this.state.youtubeSignedIn ? null: 'Sign in to access your playlists.' }
        </Card>
        { (! this.state.youtubeSignedIn && this.state.clientReady) ?
          <SampleVideo videoid="hnme8REPenQ" /> : null }
        {playlists}
        {selectedPlaylist}
        {false ?
         <pre className="mypre">{JSONView(this.state)}</pre> : null }
      </React.Fragment>

    )
  }
  render() {
    
    return (
      <React.Fragment>
        <MaterialUI.CssBaseline />
        <HideOnScroll>
        <AppBar position="fixed" color="default">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Offtube
              { this.state.youtubeSignedIn ?
                <Button color="primary" onClick={this.youtubelogout}>Logout</Button> :
                <Button color="primary" onClick={this.youtubelogin}>Login</Button> }
            </Typography>
          </Toolbar>
        </AppBar>
        </HideOnScroll>

        <div className="content">
          {this.render_main()}
        </div>

        <SimpleBottomNavigation view={this.props.view} />
      </React.Fragment>
    );
  };
}
