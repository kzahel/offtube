import {JSONView} from './common.js'
import {sleep} from './index.js'
import {SAVEPATH} from './index.js'
import {Video} from './video.js'
import {store} from './store.js'
const {Card,
       CardContent,
       CardActions } = MaterialUI

function DownloadsInProgressComponent({downloading}) {
  if (downloading && downloading.length) {
    return (
      <div>
        {downloading.map(m=>(
        <Card>
          <CardContent>
            Download:
            {JSONView(m)}
          </CardContent>
        </Card>))}
      </div>
    )
  }
  return null
}
function mapState(state) {
  return {downloading: Object.values(state.media).filter( m => m.downloading === true )}
}
export const DownloadsInProgress = ReactRedux.connect(mapState)(DownloadsInProgressComponent)

export class DownloadsComponent extends React.Component {
  state = {
    fetching:false,
    files:null
  }
  static propTypes = {
    fetching: PropTypes.bool.isRequired
  }
  async componentDidMount() {
    while (! store.getState().status.FS_READY) {
      await sleep(0.1);
    }
    if (! this.state.files) {
      let files = await fs.readdir(`${SAVEPATH}`)
      files = files.filter( f => f.name.endsWith('.mp4') )
      files = files.filter( f => ! f.name.startsWith('undefined') )
      this.setState({files})
    }
  }
  onDelete = (evt, id) => {
    // remove video with id from the list of files
    let files = this.state.files.filter( f => ! f.name.split('.')[0].startsWith(id) )
    this.setState({files})
  }
  render() {
    if (this.state.files) {
      const videos = this.state.files.map( f => {
        const id = f.name.split('.')[0] 
        return <Video onDeleteCallback={(e)=>this.onDelete(e, id)} key={id} id={id} />
      })
      return videos
    } else {
      return JSONView({props:this.props, state:this.state})
    }
  }
}


function mapProps(state) {
  return {}
}
function mapDispatch() {}

export const Downloads = ReactRedux.connect(mapProps)(DownloadsComponent)
