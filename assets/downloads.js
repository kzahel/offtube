import {JSONView, getfilenameid} from './common.js'
import {sleep} from './index.js'
import {SAVEPATH} from './index.js'
import {Video} from './video.js'
import {store} from './store.js'
import * as actions from './actions.js'

const {Card,
       CardContent,
       CardActions } = MaterialUI
const {useEffect} = React

function DownloadsInProgressComponent({downloading}) {
  if (downloading && downloading.length) {
    // TODO add key
    return (
      <div>
        { downloading.length ? "Downloads in Progress:" : null }
        {downloading.map(m=>(
        <Card key={m.id}>
          <CardContent>
            Download:
            {JSONView({id:m.id,
                       bytesdown:m.bytesdown,
                       name:(m.formats && m.formats.title),
                       downloading:m.downloading,
                       error:m.error})}
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

function DownloadsComponent(props) {
  useEffect( () => {
    if (! Object.keys(props.downloads).length && props.fs) {
      // dont have downloads loaded yet
      store.dispatch( actions.listDownloads() )
    }

  },[props.fs]) // how do we know if a new vid has been downloaded ?
  function onDelete(evt, id, f) {
    // remove video with id from the list of files
    actions.deletemedia({id, file:f.file})
  }

  let content
  if (props.downloads && props.downloads.length) {
    content = props.downloads.map( f => {
      const id = getfilenameid((f.file || f.fileEntry).name)
      return <Video onDeleteCallback={(e)=>onDelete(e, id, f)} key={id} id={id} />
    })
  } else {
    content = JSONView({props})
  }

  return (
    <div>
      <DownloadsInProgress />
      {content}
    </div>
    );
}


function mapProps(state) {
  return {
    downloads: Object.values(state.media).filter( m => (m.file || m.fileEntry)  ),
    //downloads: Object.values(state.media), // all media are downloads ?
    fs: state.status.FS_READY
  }
}
function mapDispatch() {}

export const Downloads = ReactRedux.connect(mapProps)(DownloadsComponent)
