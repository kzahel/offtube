import {JSONView} from './common.js'
import {Video} from './video.js'
import {loadRecentActions} from './db.js'
import * as actions from './actions.js'
const {Button, Icon, Select, InputLabel} = MaterialUI


function PlayerComponent({...props}) {
  let vidref = React.createRef()
  const show = props.pathname && props.pathname.startsWith('/player')
  let [playbackRate, setPlaybackRate] = React.useState(1)
  let [recentActions, setRecentActions] = React.useState(null)

  React.useEffect( () => {
    if (vidref.current) vidref.current.playbackRate = playbackRate
  }, [playbackRate])

  React.useEffect( () => {
    console.log('player routerchange',props.router)
    if (props.router &&
        props.router.view === 'player' &&
        props.router.data &&
        props.router.data.params &&
        props.router.data.params.length &&
        ! props.id) {
      // this is an initial load probably (with video id in url
      const id = props.router.data.params[0]
      props.dispatch(actions.playmedia(id))
    }
  }, [props.router])
  
  React.useEffect( () => {
    if (! props.id) return
    (async function() {
      setRecentActions(await loadRecentActions(props.id))
    })()
  }, [props.id])
  
  function seek(secs, absolute = false) {
    if (vidref.current) {
      vidref.current.currentTime = secs + (absolute ? 0 : vidref.current.currentTime)
    }
  }
  
  return (
    <div className={show ? "" : "hidden"}>
    {JSONView(props)}

    <p>Video player!</p>

    { props.url ?
      <video style={{width:'100%', height:'55px'}} ref={vidref} autoPlay src={props.url} controls /> : null }

    <br />
    
      <InputLabel htmlFor="playback-speed">Playback speed</InputLabel>        
      <Select native
              inputProps={{
                id: 'playback-speed',
                  }}
              value={playbackRate} onChange={(e) => { setPlaybackRate(e.target.value)}}>
        <option value={0.75}>0.75x speed</option>
        <option value={1}>normal speed</option>
        <option value={1.25}>1.25x speed</option>
        <option value={1.5}>1.5x speed</option>
        <option value={1.75}>1.75x speed</option>
        <option value={2}>2x speed</option>
        <option value={2.25}>2.25x speed</option>
        <option value={2.5}>2.5x speed</option>
      </Select>
      <Button onClick={(e) => { seek(-30) }}><Icon>replay_30</Icon></Button>
      <Button onClick={(e) => { seek(30) }}><Icon>forward_30</Icon></Button>

    <br />

    { props.id ? <Video key={props.id} id={props.id} /> : null }

    { recentActions ?
    recentActions.map( a => (<div key={a.timestamp} onClick={e=>seek(a.videotime, true)} >Continue playback from {a.videotime}</div>) )
    : null }


    
      <div style={{height:'50px'}}>
      </div>
    
    </div>
  )
}

function mapState(state) {
  return {
    router: state.router,
    pathname: (state.router && state.router.pathname), // needed to know to show only on /player page
    ...state.player
  }
}
function mapDispatch(dispatch) {
  return {dispatch}
}

export const Player = ReactRedux.connect(mapState, mapDispatch)(PlayerComponent)
