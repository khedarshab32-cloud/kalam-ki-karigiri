const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const SPOTIFY_ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN || '';
const AUTHORIZED_TRACKS_URLS = String(process.env.AUTHORIZED_TRACKS_URLS || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(express.json({limit:'100kb'}));
app.use(express.static(path.join(__dirname, 'public')));

function normalizeYouTube(x){
  const s=x.snippet||{};
  return {id:`youtube:${x.id.videoId}`, videoId:x.id.videoId, provider:'youtube', title:s.title||'Untitled', artist:s.channelTitle||'YouTube', album:'', artwork:s.thumbnails?.high?.url||s.thumbnails?.medium?.url||'', duration:null, playable:true, playbackType:'youtube-iframe', providerUrl:`https://www.youtube.com/watch?v=${x.id.videoId}`, explicit:false, source:'youtube'};
}
function score(q,t){
  const a=q.toLowerCase(), b=(t.title+' '+t.artist).toLowerCase();
  return (t.title.toLowerCase()===a?100:0)+(t.title.toLowerCase().startsWith(a)?35:0)+(b.includes(a)?15:0);
}
async function youtubeSearch(q){
  if(!YOUTUBE_API_KEY) return [];
  const u=new URL('https://www.googleapis.com/youtube/v3/search');
  u.searchParams.set('part','snippet'); u.searchParams.set('q',q); u.searchParams.set('type','video');
  u.searchParams.set('videoCategoryId','10'); u.searchParams.set('maxResults','25'); u.searchParams.set('key',YOUTUBE_API_KEY);
  const r=await fetch(u); const d=await r.json(); if(!r.ok) throw new Error(d.error?.message||'YouTube API error');
  return (d.items||[]).filter(x=>x.id?.videoId).map(normalizeYouTube);
}
async function spotifySearch(q){
  if(!SPOTIFY_ACCESS_TOKEN) return [];
  const u=new URL('https://api.spotify.com/v1/search'); u.searchParams.set('q',q); u.searchParams.set('type','track'); u.searchParams.set('limit','20');
  const r=await fetch(u,{headers:{Authorization:`Bearer ${SPOTIFY_ACCESS_TOKEN}`}}); const d=await r.json();
  if(!r.ok) throw new Error(d.error?.message||'Spotify API error');
  return (d.tracks?.items||[]).map(t=>({id:`spotify:${t.id}`,provider:'spotify',title:t.name,artist:(t.artists||[]).map(a=>a.name).join(', '),album:t.album?.name||'',artwork:t.album?.images?.[0]?.url||'',duration:t.duration_ms||null,playable:false,playbackType:'spotify-sdk-or-provider',providerUrl:t.external_urls?.spotify||`https://open.spotify.com/track/${t.id}`,explicit:!!t.explicit,source:'spotify'}));
}
async function authorizedSearch(q){
  // Optional JSON endpoints can return [{id,title,artist,album,artwork,duration,streamUrl,providerUrl}].
  const out=[];
  for(const url of AUTHORIZED_TRACKS_URLS){
    try { const r=await fetch(url); if(!r.ok) continue; const rows=await r.json();
      for(const t of (Array.isArray(rows)?rows:[])){
        const hay=(t.title+' '+(t.artist||'')+' '+(t.album||'')).toLowerCase(); if(!hay.includes(q.toLowerCase())) continue;
        if(!t.streamUrl) continue; out.push({id:`authorized:${t.id||encodeURIComponent(t.title)}`,provider:t.provider||'authorized',title:t.title,artist:t.artist||'',album:t.album||'',artwork:t.artwork||'',duration:t.duration||null,playable:true,playbackType:'html5-audio',providerUrl:t.providerUrl||'',explicit:!!t.explicit,source:'authorized',streamUrl:t.streamUrl});
      }
    } catch {}
  }
  return out;
}
app.get('/api/music/providers',(req,res)=>res.json({providers:[
  {id:'youtube',enabled:!!YOUTUBE_API_KEY,playback:'youtube-iframe'},
  {id:'spotify',enabled:!!SPOTIFY_ACCESS_TOKEN,playback:'official-sdk-or-open'},
  {id:'authorized',enabled:AUTHORIZED_TRACKS_URLS.length>0,playback:'html5-audio-background'}
]}));
app.get('/api/music/search',async(req,res)=>{
  const q=String(req.query.q||'').trim(); if(!q) return res.json({query:'',results:[],providers:[]});
  const providers=['youtube','spotify','authorized']; const settled=await Promise.allSettled([youtubeSearch(q),spotifySearch(q),authorizedSearch(q)]);
  let results=settled.flatMap(x=>x.status==='fulfilled'?x.value:[]);
  const seen=new Set(); results=results.filter(t=>{const key=(t.title+'|'+t.artist).toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g,' '); if(seen.has(key)) return false; seen.add(key); return true;});
  results.sort((a,b)=>score(q,b)-score(q,a));
  res.json({query:q,results,providers:providers.map((id,i)=>({id,enabled:settled[i].status==='fulfilled' && (id==='youtube'?!!YOUTUBE_API_KEY:id==='spotify'?!!SPOTIFY_ACCESS_TOKEN:AUTHORIZED_TRACKS_URLS.length>0)}))});
});
app.get('/api/health',(req,res)=>res.json({ok:true,version:'7.0.0'}));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`Kalam Ki Karigiri V7: http://localhost:${PORT}`));
