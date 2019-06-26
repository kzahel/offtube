import { openDB, deleteDB, wrap, unwrap } from './idb/idb.js';

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
//window.db_append = db_append

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
  const tx = db.transaction('actions')
  const index = tx.store.index('videoid')
  let cursor = await index.openCursor(id, 'prev')
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
window.loadRecentActions = loadRecentActions


function isVideoPlaying(v) {
  return !!(v.currentTime > 0 && !v.paused && !v.ended && v.readyState > 2);
}

async function periodicallyRecordPlayStatus() {
  const v = document.querySelector('video')
  if (v && isVideoPlaying(v)) {
    const tx = db.transaction('actions', 'readwrite');
    const state = _store.getState()
    //const istore = tx.objectStore('actions');
    const payload = {videoid:state.player.id, videotime: v.currentTime, timestamp:Date.now()}
    //console.log('add action to db', payload)
    await db.add('actions', payload)
    await tx.done;
  }
}

export async function doDatabaseStuff() {
  const db = await dbPromise
  window.db=db
  setInterval( periodicallyRecordPlayStatus, 10000 )
  //db_inc()
}


