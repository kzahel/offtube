import {SAVEPATH, initfs, getfile, sleep} from './index.js'
import {SimpleMenu} from './menu.js'
import * as api from './api.js'
import {types} from './actions.js'
import {store} from './store.js'
import * as actions from './actions.js'
import {JSONView} from './common.js'

const {Button,
       Dialog,
       Card,
       CardContent,
       CardActions,
       Typography,
       DialogTitle,
       ListItem,
       List,
       InputLabel,
       Input,
       Select,
       Icon} = MaterialUI


function DownloadFormats({formats,onSelect}) {
  if (! formats) {
    return <div>No formats</div>
  }

  const id = formats.id
  function handleClick(format_id) {
    // start download !
    store.dispatch( actions.downloadmedia(id, format_id) )
    onSelect()
  }
  
  return (
    <List>
      {formats.formats.map( f => {
        return <ListItem onClick={()=>handleClick(f.format_id)}key={`${id}-${f.format_id}`}>{f.format}</ListItem>
      })}
    </List>
  )
}

export function SampleVideo() {
  const props = {
    "id": "hnme8REPenQ",
    "snippet": {
      "title": "Hallelujah",
      "thumbnails": {
        "default": {
          "url": "https://i.ytimg.com/vi/hnme8REPenQ/default.jpg",
        },
      },
    },
    "contentDetails": {
      "videoId": "hnme8REPenQ",
    }
  }
  return (<div>
    <h4>Sample Video</h4>
    <Video {...props} />
  </div>)
}

function VideoComponent({dispatch,id,mediaurl,...props}) {
  const debug=false
  console.assert(id !== "undefined")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const actionInProgress = false

  React.useEffect( () => {
    if (props.fileEntry && ! props.file) {
      //actions.loadFileInfo(props.id, props.fileEntry)
      dispatch(actions.mediaload(id))
    }
  }, [props.fileEntry])
  
  function doDeleteFile() {
    dispatch(actions.deletemedia({id, ...props}))
    const cb = props.onDeleteCallback
    if (cb) cb()
  }
  function doOpenInWindow() {
    mediaurl = ensureMediaUrl()
    window.open(mediaurl, '_blank')
  }
  function doOpenInYoutube() {
    window.open(`https://www.youtube.com/watch?v=${id}`, '_blank')
  }
  function doOpenDownloadDialog() {
    setDialogOpen(true)
  }
  
  // lets pass in all these things as props ...
  function menuactions() {
    const actions = {}
    if (props.file) actions['Delete File'] = doDeleteFile;
    if (props.file) actions['Open in New Window'] = doOpenInWindow;
    if (id) actions['Open in Youtube'] = doOpenInYoutube;

    if (! props.file) actions['Download...'] = doOpenDownloadDialog;


    return {
      ...actions,
      //      'Remove from playlist':this.doRemoveFromPlaylist,
      //      'Download':this.doDownload
    }
  }

  React.useEffect( () => {
    if (! props.file && props.fs) dispatch(actions.mediaload(id))
  }, [props.fs])


  function thumbnail() {
    if (props.snippet) return (<img className="vidthumb" src={props.snippet.thumbnails.default.url} />)
    else if (props.formats) return (<img className="vidthumb" src={props.formats.thumbnail} />)
    else return (<Icon>video_library</Icon>);
  }
  function duration() {
    return props.duration ||
           (props.formats && props.formats.duration) || null
  }
  function title() {
    if (props.snippet) return props.snippet.title
    else if (props.formats) return props.formats.title
    else if (props.file) return props.file.name
    else return id
  }
  function startDownload() {
    dispatch( actions.dodownload({id}) )
  }
  function ensureMediaUrl() {
    if (! mediaurl) {
      mediaurl = URL.createObjectURL(props.file)
      dispatch( {type:types.MEDIA_URL_GENERATED, payload:{id,mediaurl}} )
    }
    return mediaurl
  }
  function doPlay() {
    ensureMediaUrl()
    dispatch( actions.playmedia(id, title(), mediaurl) )
  }
  
  return (

    <Card key={id} className="mediacard">
      <CardContent>


        <Typography>
          {title()}
        </Typography>
        {thumbnail()}

        { props.downloading ? <MaterialUI.CircularProgress /> : null }

        {props.bytesdown ? 
         <span>{'Downloaded bytes:'} {props.bytesdown.toLocaleString()}<br /></span> : null }

        {duration() ? <span>{'Duration: '} {duration().toLocaleString()} seconds</span> : null}

        <br />
        {props.file && props.file.size ?
         <span>{'File size:'} {props.file.size.toLocaleString()}</span> : null }


        {debug ? JSONView({props,dialogOpen}) : null }
      </CardContent>
      <CardActions>

        { (! props.file && ! props.downloading) ?
          <Button 
            onClick={startDownload} 
          >Download <Icon>arrow_downward</Icon></Button> : null }

        { (props.file && ! props.downloading) ?
          <Button 
            onClick={doPlay}
          ><Icon>play_arrow</Icon>Play</Button> : null }


        <SimpleMenu actions={menuactions()} />
        <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)}>
          <DialogTitle>Select Video Format</DialogTitle>
          <DownloadFormats onSelect={()=>setDialogOpen(false)} formats={props.formats} />
        </Dialog>
      </CardActions>
      
    </Card>)
}

function mapProps(state, props) {
  return {
    fs: state.status.FS_READY,
    ...state.media[props.id]
  }
}

export const Video = ReactRedux.connect(mapProps)(VideoComponent)
