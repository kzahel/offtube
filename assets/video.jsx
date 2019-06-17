import {SAVEPATH, initfs, getfile, sleep} from './index.js'
import {SimpleMenu} from './menu.js'
import * as api from './api.js'

const {Button,
       InputLabel,
       Input,
       Select,
       Icon} = MaterialUI

function select_audio_format(formats) {
  let audio_formats = []
  for (let format of formats) {
    if (format.format.indexOf('audio only') != -1 ||
        format.width === null ||
        format.vcodec == 'none') {
      audio_formats.push(format)
    }
  }
  audio_formats.sort((a,b)=>(b.abr-a.abr))
  // highest bitrate
  return audio_formats[0]
}

export function SampleVideo() {
  const props = {
    "id": "sample-video",
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

export class Video extends React.Component {
  state = {
    bytesdown: 0,
    speed: 1,
    gettingFormats: false,
    isDownloading: false,
    actionInProgress: false,
    file: null,
    fileSize: 0,
    mediaurl: null,
    duration: null
  }
  debug = false
  static getDerivedStateFromProps(props, state) {
    const videoid = props.videoid || props.contentDetails.videoId
    return {...state,
            filepath:`${SAVEPATH}/${videoid}`,
            videoid
    }
  }
  async componentDidMount() {
    let fileentry
    let formats
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
    window.open(this.state.mediaurl, '_blank')
    //openNewBackgroundTab(this.state.mediaurl) // does not work / impossible
  }
  menuactions() {
    const actions = {}
    if (this.state.file) {
      actions['Delete File'] = this.doDeleteFile;
      actions['Open in New Window'] = this.doOpenInWindow;
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
      {this.state.file ?
       <video ref={n=>this.videoElt=n} src={this.getMediaURL()} controls /> : null }
        <br />
      {this.title}
        <br />
        downloaded bytes: {this.state.bytesdown.toLocaleString()}
        <br />
        duration: {this.duration}
        <div>
          { (! this.state.file && ! this.state.actionInProgress && window.location.host.endsWith('8880')) ?
        <Button 
               disabled={this.actionInProgress}
               onClick={this.doDownload} 
        >Download <Icon>arrow_downward</Icon></Button> : null }

        <SimpleMenu actions={this.menuactions()} />

      <InputLabel htmlFor="playback-speed">Playback speed</InputLabel>        
      <Select native
              inputProps={{
                id: 'playback-speed',
                  }}
              value={this.state.speed} onChange={this.speedChange}>
        <option value={1}>1x speed</option>
        <option value={1.5}>1.5x speed</option>
        <option value={2}>2x speed</option>
      </Select>
      </div>
        {this.debug ? JSONView({state:this.state,props:this.props}) : null}
      </div>
      );
  }
}
