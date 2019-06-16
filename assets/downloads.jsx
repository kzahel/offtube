class Downloads extends React.Component {
  state = {
    fetching:false,
    files:null
  }
  async componentDidMount() {
    if (! this.state.files) {
      let files = await fs.readdir(`${SAVEPATH}`)
      files = files.filter( f => f.name.endsWith('.mp4') )
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
        return <Video onDeleteCallback={(e)=>this.onDelete(e, id)} key={id} videoid={id} />
      })
      return videos
    } else {
      return JSONView({props:this.props, state:this.state})
    }
  }
}

Downloads.propTypes = {
  fetching: PropTypes.bool.isRequired
}
