import {JSONView} from './common.js'
import * as actions from './actions.js'
const {Card, CardContent, Typography} = MaterialUI

function SubscriptionsComponent({dispatch, ...props}) {
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (loading && props.subscriptions) setLoading(false)
    
    if (! loading &&
        ! props.subscriptions &&
        props.youtubeLoggedIn) {
      setLoading(true)
      dispatch( actions.getsubscriptions() )
    }
  })

  function onClick(sub) {
    // dispatch path change ?
    console.log(sub)
    dispatch(actions.change_route(`/subscriptions/${sub.id}`))
  }
  
  let subcontent
  if (props.subscriptions) {
    const subs = props.subscriptions.sort( (a,b) => {
      return new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime()
    })
    subcontent = subs.map( sub => {
      const t = new Date(sub.snippet.publishedAt)
      return (
      <Card key={sub.id} className="mediacard" onClick={()=>onClick(sub)}>
        <CardContent>
        <div>
          <img src={sub.snippet.thumbnails.default.url} />
          <Typography>
            {sub.snippet.title}
            <br />
            Last activity: {t.toLocaleDateString()} {t.toLocaleTimeString()}
          </Typography>
        </div>
        </CardContent>
      </Card>)
    })
  }
  return (
    


    <div>
    {subcontent}
      {JSONView({props, loading})}
    </div>
  )
}

function mapStateToProps(state) {
  return {
    youtubeLoggedIn: state.status.YOUTUBE_USER_AUTHENTICATED,
    gapi: state.status.GAPI_CLIENT_LOADED,
    subscriptions: state.subscriptions
  }
}

export const Subscriptions = ReactRedux.connect(mapStateToProps)(SubscriptionsComponent)
