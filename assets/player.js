import {JSONView} from './common.js'
import {Video} from './video.js'

function PlayerComponent({...props}) {
  //let vidref = React.createRef()
  const show = props.pathname == '/player'
  //ref={vidref}
  return (
    <div className={show ? "" : "hidden"}>
    {JSONView(props)}
    Video player!
    
    { props.id ? <Video key={props.id} videoid={props.id} /> : null }
    { props.url ?

      <video autoPlay src={props.url} controls /> : null }
    </div>
  )
}

function mapState(state) {
  return {
    pathname:state.pathname,
    ...state.player
  }
}
function mapDispatch(dispatch) {
}

export const Player = ReactRedux.connect(mapState, mapDispatch)(PlayerComponent)
