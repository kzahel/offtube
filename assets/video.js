import {SAVEPATH, initfs, getfile, sleep} from './index.js'
import {SimpleMenu} from './menu.js'
import * as api from './api.js'
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

export class OldVideo extends React.Component {
  state = {
    bytesdown: 0,
    speed: 1,
    gettingFormats: false,
    isDownloading: false,
    actionInProgress: false,
    file: null,
    fileSize: 0,
    mediaurl: null,
    duration: null,
    downloadDialog: false
  }
  static getDerivedStateFromProps(props, state) {
    const videoid = props.videoid || props.contentDetails.videoId
    return {...state,
            filepath:`${SAVEPATH}/${videoid}`,
            videoid
    }
  }
  async componentDidMount() {
    this.debug = false
    let fileentry
    let formats
    while (! store.getState().status.FS_READY) {
      await sleep(0.1);
    }
    try {
      fileentry = await fs.getEntry(this.mediapath)
      formats = await fs.readFile(this.mediainfopath)
      formats = JSON.parse(formats)
      this.formats = formats
      //console.log('read stored formats',formats)
    } catch(e) {}
    if (fileentry) {
      const file = await getfile(fileentry)
      this.setState({file, fileSize: file.size})
    }
  }
  getMediaURL() {
    if (! this.state.file) return
    if (! this.state.mediaurl) {
      const url = URL.createObjectURL(this.state.file)
      this.setState({mediaurl:url})
      return url
    }
    return this.state.mediaurl
  }
  savefile = async (url, formats) => {
    const resp = await fetch(url)
    const stream = resp.body
    const outstream = fs.createWriteStream(this.mediapath)
    const reader = stream.getReader()
    const writer = outstream.getWriter()
    let bytesdown = 0
    while (true) {
      let result = await reader.read()
      if (result.done) break
      bytesdown += result.value.length
      this.setState({bytesdown})
      writer.write(result.value)
      // TODO -- delete file if there is some kind of error...
    }
    writer.close()
    fs.writeFile(this.mediainfopath, JSON.stringify(formats))
  }
  doDeleteFile = async (evt) => {
    // remove file from storage.
    if (this.state.file) {
      if (this.state.mediaurl) {
        URL.revokeObjectURL(this.state.mediaurl)
      }
      await fs.unlink(this.mediapath)
      this.setState({file:null,
                     bytesdown:0,
                     fileSize:0, mediaurl:null})
      if (this.props.onDeleteCallback) { this.props.onDeleteCallback() }
      // if on downloads page. it should disappear...
    }
  }
  get mediapath() {
    return this.state.filepath + '.mp4'
  }
  get mediainfopath() {
    return this.state.filepath + '.json'
  }
  doDownload = async (evt) => {
    initfs() // todo ensure
    const id = this.state.videoid
    //window.open(`https://youtube.com/watch?v=${this.props.contentDetails.videoId}`, '_blank');
    this.setState({actionInProgress:true})
    console.log('click download')
    if (this.state.actionInProgress) {
      console.warn('action already in progress')
      return
    }

    let fileentry
    try {
      //throw Exception('always download!')
      fileentry = await fs.getEntry(this.mediapath)
      console.log('already had file',this.mediapath)
    } catch(e) {console.warn(e)}


    if (! fileentry) {
      console.log('file not found, getting formats')
      this.setState({gettingFormats:true})
      const formats = await api.get_video_formats(id)
      this.setState({gettingFormats:false})
      console.log('got formats',formats)
      this.formats = formats
      const duration = formats.duration
      this.setState({duration})
      const format = select_audio_format(formats.formats)
      const format_id = format.format_id
      console.log('selected format', format)
      const url = api.get_video_url(id, format_id)
      console.log('starting download')
      this.setState({isDownloading:true})
      await this.savefile(url,formats)
      this.setState({isDownloading:false})
      fileentry = await fs.getEntry(this.mediapath)
    }
    
    const file = await getfile(fileentry)
    
    this.setState({file, fileSize:file.size})
    this.setState({actionInProgress:false})
  }
  speedChange = evt => {
    const speed = parseFloat(evt.target.value)
    this.setState({speed})
    if (this.videoElt) {
      this.videoElt.playbackRate = speed
    }
  }
  doRemoveFromPlaylist = () => {
    console.log('remove from playlist')
  }
  doCancelDownload = () => {
  }
  doOpenInWindow = () => {
    window.open(this.getMediaURL(), '_blank')
    //openNewBackgroundTab(this.state.mediaurl) // does not work / impossible
  }
  doOpenInYoutube = () => {
    window.open(`https://www.youtube.com/watch?v=${this.state.videoid}`, '_blank')
    //openNewBackgroundTab(this.state.mediaurl) // does not work / impossible
  }
  dialogDownloadOpen = () => {
    this.setState({downloadDialog:true})
  }
  dialogDownloadClose = () => {
    this.setState({downloadDialog:false})
  }
  doPlay = () => {
    store.dispatch( actions.playmedia(this.state.videoid,this.title,this.getMediaURL()) )
  }
  menuactions() {
    const actions = {}
    if (this.state.file) {
      actions['Delete File'] = this.doDeleteFile;
      actions['Open in New Window'] = this.doOpenInWindow;
      actions['Open in Youtube'] = this.doOpenInYoutube;
      actions['Download...'] = this.dialogDownloadOpen;
    }
    if (this.state.actionInProgress) {
      actions['Cancel Download'] = this.doCancelDownload
    }
    return {
      ...actions,
      'Remove from playlist':this.doRemoveFromPlaylist,
      //      'Download':this.doDownload
    }
  }
  showInfo = () => {
    console.log({props:this.props, state:this.state})
  }
  get thumbnail() {
    if (this.props.snippet) return (<img className="vidthumb" src={this.props.snippet.thumbnails.default.url} />)
    else if (this.formats) return (<img className="vidthumb" src={this.formats.thumbnail} />)
    else return (<Icon>video_library</Icon>);
  }
  get duration() {
    return this.state.duration ||
           (this.formats && this.formats.duration) || null
  }
  get title() {
    if (this.props.snippet) return this.props.snippet.title
    else if (this.formats) return this.formats.title
    else if (this.state.file) return this.state.file.name
    else return this.props.id
  }
  render() {
    return (
      <div className="videodiv">
      <span onClick={this.showInfo}>{this.thumbnail}</span>
      <br />
      { this.state.actionInProgress ? <MaterialUI.CircularProgress /> : null }
      <br />
      {this.title}
      <br />
      {this.state.bytesdown ? 
       <span>{'Downloaded bytes:'} {this.state.bytesdown.toLocaleString()}<br /></span> : null }
      duration: {this.duration} seconds <br />
      {this.state.file && this.state.file.size ?
       <span>{'File size:'} {this.state.file.size.toLocaleString()}</span> : null }
      <div>

        { (! this.state.file && ! this.state.actionInProgress) ?
          <Button 
            onClick={this.doDownload} 
          >Download <Icon>arrow_downward</Icon></Button> : null }

        { (this.state.file && ! this.state.actionInProgress) ?
          <Button 
            onClick={this.doPlay} 
          ><Icon>play_arrow</Icon>Play</Button> : null }


        <Dialog open={this.state.downloadDialog} onClose={this.dialogDownloadClose}>
          <DialogTitle>Select Video Format</DialogTitle>
          <DownloadFormats onSelect={this.dialogDownloadClose} formats={this.formats} />
        </Dialog>
        
        <SimpleMenu actions={this.menuactions()} />

      </div>
      {this.debug ? JSONView({state:this.state,props:this.props}) : null }
  </div>
    )
  }
}


function VideoComponent({dispatch,id,mediaurl,...props}) {
  const debug=false
  console.assert(id !== "undefined")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const actionInProgress = false
  function doDeleteFile() {
    dispatch(actions.deletemedia(id, props))
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
  
  // lets pass in all these things as props ...
  function menuactions() {
    const actions = {}
    if (props.file) actions['Delete File'] = doDeleteFile;
    if (props.file) actions['Open in New Window'] = doOpenInWindow;
    if (id) actions['Open in Youtube'] = doOpenInYoutube;
      /*
      actions['Download...'] = this.dialogDownloadOpen;
      */

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
      dispatch( {type:'MEDIA_URL_GENERATED', payload:{id,mediaurl}} )
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
