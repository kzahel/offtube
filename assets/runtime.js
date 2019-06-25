import {store} from './store.js'
import * as actions from './actions.js'
import {ConnectedAppRouter} from './router.js'

import { openDB, deleteDB, wrap, unwrap } from './idb/idb.js';

window._store = store


ReactDOM.render(
  (
    <ReactRedux.Provider store={store}>
      <ConnectedAppRouter />
    </ReactRedux.Provider>)
  ,document.getElementById('root')
)
/*
localforage.config({
  name: 'localforage',
  description: 'stores local cache data for offtube',
  driver: [localforage.INDEXEDDB]
})
*/

async function db_inc() {
  const tx = db.transaction('keyval', 'readwrite');
  const istore = tx.objectStore('keyval');
  const val = await istore.get('counter') || 0;
  istore.put(val + 1, 'counter');
  await tx.done;
}
async function db_append() {
  const tx = db.transaction('actions', 'readwrite');
  //const istore = tx.objectStore('actions');
  await db.add('actions', {foo:Math.random(), timestamp:Date.now()})
  await db.add('actions', {foo2:Math.random(), timestamp:Date.now()})
  await tx.done;
}
window.db_append = db_append

const dbPromise = openDB('offtube-actions', 1, {
  upgrade(db) {
    const s = db.createObjectStore('actions',
      {keyPath: 'id',
       autoIncrement: true}
    );
    s.createIndex('videoid','videoid')
  }
})

export async function loadRecentActions(id) {
  let cursor = await db.transaction('actions').store.index('videoid').openCursor(null, 'prev');
  const limit = 5
  let count = 0
  const res = []
  while (cursor && count < limit) {
    res.push(cursor.value)
    cursor = await cursor.continue();
    count++
  }
  return res
}


function isVideoPlaying(v) {
  return !!(v.currentTime > 0 && !v.paused && !v.ended && v.readyState > 2);
}

async function periodicallyRecordPlayStatus() {
  const v = document.querySelector('video')
  if (v && isVideoPlaying(v)) {
    const tx = db.transaction('actions', 'readwrite');
    const state = store.getState()
    //const istore = tx.objectStore('actions');
    const payload = {videoid:state.player.id, videotime: v.currentTime, timestamp:Date.now()}
    console.log('add action to db', payload)
    await db.add('actions', payload)
    await tx.done;
  }
}

async function doDatabaseStuff() {
  const db = await dbPromise
  window.db=db
  setInterval( periodicallyRecordPlayStatus, 10000 )
  //db_inc()
}
doDatabaseStuff()
  

store.dispatch( actions.request_fs() )
store.dispatch( actions.change_route() )
store.dispatch( actions.load_gapi_client() )
