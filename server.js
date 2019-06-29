const express = require('express')
const {OAuth2Client} = require('google-auth-library')
const {exec, spawn} = require('child_process')
const {config} = require('./config')

const app = express();
//const morgan = require('morgan')
//to log requests
//app.use(morgan('combined'))
const youtube_dl = `${process.env.HOME}/.local/bin/youtube-dl`
function get_video_formats({id,url}) {
  return new Promise( resolve => {
    let vurl
    if (url) {
      vurl = url
    } else {
      vurl = `https://www.youtube.com/watch?v=${id}`
    }
    exec(`${youtube_dl} -j "${vurl}"`,{maxBuffer:1024*1024*10},
         (error, stdout, stderr) => {
           if (error || stderr.trim()) {
             console.error(`exec error: ${error}`);
             
             return resolve({stderr:stderr, error:error})
           }
           //console.log(`stderr: ${stderr}`);
           //console.log(stdout)
           return resolve(JSON.parse(stdout))
         });
    })
}

function verify_id_token(token) {
  const {client_id} = config;
  const client = new OAuth2Client(client_id);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: client_id,
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    return {payload,userid}
  }
  return verify()
}


app.get('/checktoken', async function(req, res){
  const tok = 'abcdefg'
  let resp = await verify_id_token(tok);
  console.log('verified',resp)
  res.send("Hello world!");
});


function SPA( req, res, next ) {
  // uri has a forward slash followed any number of any
  // characters except full stops (up until the end of the string)
  if (req.url.startsWith('/api')) return next()
  console.log('SPA middleware',req.path)
  
  if (/\/[^.]*$/.test(req.url)) {
    res.sendFile(__dirname + '/assets/index.html');
  } else {
    next();
  }
}

app.use(express.static('assets'))
app.use(SPA);

app.get('/api/formats', async function(req, res) {
  const id = req.query.id
  const url = req.query.url
  const resp = await get_video_formats({id,url})
  res.setHeader('content-type','text/plain')
  //res.setHeader('access-control-allow-origin','*')
  res.send(JSON.stringify(resp,null,' '))
})

app.get('/api/download', function(req, res) {
  const format = req.query.format
  const id = req.query.id
  const url = req.query.url
  const inp = id || url
  //res.setHeader('access-control-allow-origin','*')
  const cmd = youtube_dl
  const args =  ['-f',format,inp,'-o','-']
  console.log('dl args',[youtube_dl].concat(args))
  // TODO on bad urls need to send error...
  
  const proc = spawn(cmd, args)
  console.log('begin: streaming video',inp)

  const state = {} // generate/use a session id or something?
  // proc.stdout.pipe(res) // it was crashing ?
  proc.stdout.on('data', d=>{
    console.assert(! state.ended)
    res.write(d)
  })
  
  proc.stderr.on('data', d=>{
    // have to drain the stderr or it fails
    //console.log('download stderr',d)
  })
  proc.on('end', ()=>{
    console.log('end: video stream over',id)
    state.ended=true
    res.end()
  })
  proc.on('exit', ()=>{
    console.log('exit: video stream exit',id)
    state.ended=true
    res.end()
  })
})

const port = 8880;
console.log('app starting',port)
app.listen(port);
