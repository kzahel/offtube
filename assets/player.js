import {JSONView} from './common.js'
import {Video} from './video.js'
const {Button, Icon, Select, InputLabel} = MaterialUI

function PlayerComponent({...props}) {
  let vidref = React.createRef()
  const show = props.pathname && props.pathname.startsWith('/player')
  let [playbackRate, setPlaybackRate] = React.useState(1)

  React.useEffect( () => {
    if (vidref.current) vidref.current.playbackRate = playbackRate
  }, [playbackRate])

  function seek(secs) {
    if (vidref.current) vidref.current.currentTime = vidref.current.currentTime + secs
  }
  
  return (
    <div className={show ? "" : "hidden"}>
    {JSONView(props)}
    <p>Video player!</p>


    { props.url ?
      <video ref={vidref} autoPlay src={props.url} controls /> : null }

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
      </Select>
      <Button onClick={(e) => { seek(-30) }}><Icon>replay_30</Icon></Button>
      <Button onClick={(e) => { seek(30) }}><Icon>forward_30</Icon></Button>

    <br />

    { props.id ? <Video key={props.id} id={props.id} /> : null }

      <div style={{height:'50px'}}>
      </div>
    
    </div>
  )
}

function mapState(state) {
  return {
    pathname: state.pathname, // needed to know to show only on /player page
    ...state.player
  }
}
function mapDispatch(dispatch) {
}

export const Player = ReactRedux.connect(mapState, mapDispatch)(PlayerComponent)
