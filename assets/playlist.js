import {Video} from './video.js'
const {Box} = MaterialUI


export class Playlist extends React.Component {
  constructor() {
    super()
    this.state = {
      items:[]
    }

  }
  componentDidMount() {
    this.loaditems()
  }
  loaditems = async () => {
    // TODO -- put thru dispatch / connect
    const resp = await gapi.client.youtube.playlistItems.list({
      "part": "snippet,contentDetails",
      "maxResults": 50,
      "playlistId": this.props.id
    })
    resp.result.items.sort( (a,b) => b.snippet.position - a.snippet.position )
    this.setState({items:resp.result.items})
  }
  render() {
    const items = []
    for (let item of this.state.items) {
      items.push( (
        <div key={item.id} className="playlist">
          <Video {...item} />
        </div>
      )
      )
    }
    return (
      <Box>
        <div>Playlist {this.props.id}
          {items}
        </div>
      </Box>
    )
  }
}
