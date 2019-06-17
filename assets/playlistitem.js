const {Box} = MaterialUI

export class PlaylistItem extends React.Component {
  render() {
    return (
      <Box>
        <div className="playlistitem" onClick={this.props.actions.onClickPlaylist}>
          <img src={this.props.snippet.thumbnails.default.url} />
          <div>Playlist {this.props.snippet.title}</div>
        </div>
      </Box>
    );
  }
}
