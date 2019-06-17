import {store} from './store.js'
import * as actions from './actions.js'

const {
  BottomNavigation,
  BottomNavigationAction,
  Icon,
} = MaterialUI;



export function SimpleBottomNavigation(props) {
  const view = props.view
  const viewmap = {
    'main':{idx: 0, path:'/'},
    'subscriptions':{idx:1, path:'/subscriptions'},
    'player':{idx:2, path:'/player'},
    'downloads':{idx:3, path:'/downloads'}
  }
  const [value, setValue] = React.useState(viewmap[view] && viewmap[view].idx);
  return (
    <BottomNavigation
      className="stickToBottom"
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
        const newpath = Object.entries(viewmap).filter( ([k,v]) => v.idx === newValue )[0][1].path
        store.dispatch(actions.change_route(newpath))
      }}
      showLabels
    >
      <BottomNavigationAction label="Home" icon={<Icon>home</Icon>} />
      <BottomNavigationAction label="Subscriptions" icon={<Icon>subscriptions</Icon>} />
      <BottomNavigationAction label="Player" icon={<Icon>play_circle_outline</Icon>} />
      <BottomNavigationAction label="Downloads" icon={<Icon>folder</Icon>} />
    </BottomNavigation>
  );
}

