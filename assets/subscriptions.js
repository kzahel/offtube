import {JSONView} from './common.js'
import * as actions from './actions.js'

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
  

  return (
    <div>
      Subscriptions! {loading}
      Loading: <span>{JSONView({loading})}</span>
      {JSONView(props)}
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
