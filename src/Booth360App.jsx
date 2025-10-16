import React, {useRef,useState,useEffect} from 'react';
export default function Booth360App(){
  const video=useRef(null),can=useRef(null),over=useRef(null),raf=useRef(0),rec=useRef(null),chunks=useRef([]);
  const [ready,setReady]=useState(false),[recOn,setRecOn]=useState(false),[cd,setCd]=useState(0),[dur,setDur]=useState(8);
  const [devices,setDevices]=useState([]),[devId,setDevId]=useState(''),[res,setRes]=useState('');
  useEffect(()=>{(async()=>{try{await init();await list();setReady(true);}catch{alert('Autoriza la cámara')}})();return()=>{cancelAnimationFrame(raf.current);}} ,[]);
  async function list(){const all=await navigator.mediaDevices.enumerateDevices();const cams=all.filter(d=>d.kind==='videoinput');setDevices(cams);if(!devId&&cams[0])setDevId(cams[0].deviceId);}
  async function init(id){const s=await navigator.mediaDevices.getUserMedia(id?{video:{deviceId:{exact:id}}}:{video:true}); if(video.current){video.current.srcObject=s; await video.current.play();}}
  function loop(){const v=video.current,c=can.current,o=over.current; const W=720,H=1280; c.width=W;c.height=H;o.width=W;o.height=H;const ctx=c.getContext('2d'),ox=o.getContext('2d'); const f=()=>{if(v.videoWidth){ctx.drawImage(v,0,0,W,H);} ox.clearRect(0,0,W,H); ox.strokeStyle='#00e0ff'; ox.lineWidth=18; ox.globalAlpha=.7; ox.strokeRect(12,12,W-24,H-24); ox.globalAlpha=1; ox.font='800 40px system-ui'; ox.textAlign='center'; ox.fillStyle='#fff'; ox.fillText('COTILLÓN XPRESS 360',W/2,84); ox.font='600 24px system-ui'; ox.fillText('Eventos • Plataforma 360°',W/2,120); ctx.drawImage(o,0,0); raf.current=requestAnimationFrame(f);}; f();}
  async function go(){for(let n=3;n>=1;n--){setCd(n);await new Promise(r=>setTimeout(r,1000));} setCd(0); loop(); const ms=can.current.captureStream(30); const opts=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(m=>MediaRecorder.isTypeSupported(m)); const mr=new MediaRecorder(ms,{mimeType:opts}); rec.current=mr; chunks.current=[]; mr.ondataavailable=e=>{if(e.data?.size>0)chunks.current.push(e.data)}; mr.onstop=()=>{cancelAnimationFrame(raf.current); setRecOn(false); const blob=new Blob(chunks.current,{type:opts}); setRes(URL.createObjectURL(blob));}; mr.start(); setRecOn(true); setTimeout(()=>{try{mr.stop()}catch{}},dur*1000);}
  return (<div style={{display:'grid',placeItems:'center',minHeight:'100vh',padding:16}}>
    <div style={{width:'100%',maxWidth:430,display:'grid',gap:12}}>
      <div style={{position:'relative',borderRadius:16,overflow:'hidden'}}>
        <video ref={video} playsInline muted style={{position:'absolute',inset:0,width:0,height:0}}/>
        <canvas ref={can} style={{width:'100%',aspectRatio:'9/16',background:'#000'}}/>
        <canvas ref={over} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>
        {cd>0 && <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',fontSize:64,fontWeight:800,background:'rgba(0,0,0,.4)'}}>{cd}</div>}
      </div>
      <select value={devId} onChange={async e=>{setDevId(e.target.value); await init(e.target.value);}} style={{padding:10,borderRadius:12,background:'#15151a',color:'#fff'}}>
        {devices.map(d=>(<option key={d.deviceId} value={d.deviceId}>{d.label||'Cámara'}</option>))}
      </select>
      <label>Duración: {dur}s</label>
      <input type="range" min={4} max={20} value={dur} onChange={e=>setDur(+e.target.value)}/>
      <button onClick={go} disabled={!ready||recOn} style={{padding:12,borderRadius:16,background:'#10b981'}}>Grabar</button>
      {res && <video src={res} controls style={{width:'100%',borderRadius:12}}/>}
    </div>
  </div>);
}