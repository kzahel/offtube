//const api_host = 'http://penguin.linux.test:3000'
const api_host = ''

export async function get_video_formats({id,url}) {
  let resp
  if (url) {
    resp = await fetch(`${api_host}/api/formats?url=${encodeURIComponent(url)}`)
  } else if (id) {
    resp = await fetch(`${api_host}/api/formats?id=${id}`)
  } else {
    debugger
  }
  const j = await resp.json()
  return j
}
export function get_video_url({id,url}, format) {
  console.assert(id||url)
  if (id) {
    return `${api_host}/api/download?id=${id}&format=${format}`
  } else {
    return `${api_host}/api/download?url=${encodeURIComponent(url)}&format=${format}`
  }
}

export function yt3_getvideoinfo(id) {
  return gapi.client.youtube.videos.list({
    "part": "snippet,contentDetails,statistics",
    "id": id
  })
}

export function yt3_getsubscriptions() {
  return yt3_paginated_list(gapi.client.youtube.subscriptions.list, 1, 5, {mine:true})
}

export function yt3_getplaylists() {
  return yt3_paginated_list(gapi.client.youtube.playlists.list, 1, 5, {mine:true})
}

async function yt3_paginated_list(apicall,
                                  limit = 1,
                                  perpage = 5,
                                  extraparams = {}) {
  let res
  let all = []
  let pageToken
  let count = 0

  while (true) {
    if (count++ > limit) break
    let params = {
      "part": "snippet,contentDetails",
      "maxResults": perpage,
      pageToken,
      ...extraparams
    }

    //console.log('req',params)
    res = await apicall(params)
    all = all.concat(res.result.items)
    //console.log('resp',all)
    pageToken = res.result.nextPageToken
    if (! pageToken) {
      break
    }
  }
  return all
}

export function yt3_deleteplaylistitem(id) {
  return gapi.client.youtube.playlistItems.delete({
    "id": id
  })
}
