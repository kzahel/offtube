//const api_host = 'http://penguin.linux.test:3000'
const api_host = ''

async function get_video_formats(id) {
  const resp = await fetch(`${api_host}/api/formats?id=${id}`)
  const j = await resp.json()
  return j
}
function get_video_url(id, format) {
  return `${api_host}/api/download?id=${id}&format=${format}`
}

function yt3_getvideoinfo(id) {
  return gapi.client.youtube.videos.list({
    "part": "snippet,contentDetails,statistics",
    "id": id
  })
}
async function yt3_getsubscriptions() {
  // handles pagination
  let res
  let all = []
  let pageToken
  let count = 0
  const limit = 2

  while (true) {
    if (count++ > limit) break
    let params = {
      "part": "snippet,contentDetails",
      "maxResults": 5,
      pageToken,
      "mine": true
    }
    console.log('req',params)
    res = await gapi.client.youtube.subscriptions.list(params)
    all = all.concat(res.result.items)
    console.log('resp',all)
    pageToken = res.result.nextPageToken
    if (! pageToken) {
      break
    }
  }
  return all
}

function yt3_deleteplaylistitem(id) {
  return gapi.client.youtube.playlistItems.delete({
    "id": id
  })
}
