import {T,stage,initReveal,initMenu,initQuote,addLights,reduced,clamp,lerp,$} from './common.js';
initMenu();initQuote();initReveal();
setTimeout(()=>document.documentElement.classList.add('tide-skip'),3800);addEventListener('keydown',()=>document.documentElement.classList.add('tide-skip'),{once:true});
/* hours chart: Mon-Fri 07:00-19:00 (Nextdoor), Sat/Sun not listed */
const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],chart=$('#chart');const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());const wd=parts.find(p=>p.type==='weekday').value.slice(0,3),hr=+parts.find(p=>p.type==='hour').value%24;const ti=days.indexOf(wd);
days.forEach((d,i)=>{const on=i<5;const el=document.createElement('div');el.className=(on?'':'off ')+(i===ti?'today':'');el.innerHTML=`<i style="--h:${on?100:14}%"></i><span>${d}</span><small>${on?'07-19':'not listed'}</small>`;chart.appendChild(el)});
requestAnimationFrame(()=>setTimeout(()=>chart.querySelectorAll('i').forEach(i=>i.style.height=getComputedStyle(i).getPropertyValue('--h')),200));
const openNow=ti>=0&&ti<5&&hr>=7&&hr<19;$('#now').innerHTML=openNow?'<b>Open now</b> (UK time, per published hours)':'Closed right now (UK time). Message anyway and Andy can reply when he is next in.';
const host=$('#flow'),vb=$('#valve'),ft=$('#flowtxt');let open=true;
const ctx=stage(host,ctx=>{
 const {scene,cam}=ctx;addLights(ctx,{fill:0x9fd8dc,ground:0x052a33,ki:2.6,hi:1.3});
 const g=new T.Group();scene.add(g);
 const pipeM=new T.MeshStandardMaterial({color:0xc9d9e2,metalness:.4,roughness:.25,transparent:true,opacity:.5,depthWrite:false}),dark=new T.MeshStandardMaterial({color:0x7b93a2,metalness:.5,roughness:.4});
 const P=[[-8,-1.2],[-3.2,-1.2],[-3.2,1.4],[2.6,1.4],[2.6,-1.2],[8,-1.2]].map(a=>new T.Vector3(a[0],a[1],0));
 const seg=[];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],len=a.distanceTo(b);const m=new T.Mesh(new T.CylinderGeometry(.34,.34,len,32),pipeM);m.position.copy(a).add(b).multiplyScalar(.5);m.lookAt(b);m.rotateX(Math.PI/2);g.add(m);seg.push(len)}
 for(let i=1;i<P.length-1;i++){const s=new T.Mesh(new T.SphereGeometry(.4,24,16),pipeM);s.position.copy(P[i]);g.add(s)}
 for(const p of [P[0],P[P.length-1]]){const f=new T.Mesh(new T.CylinderGeometry(.5,.5,.22,32),dark);f.position.copy(p);f.rotation.z=Math.PI/2;g.add(f)}
 for(let x of [-5.6,-1.2,5.3]){const col=new T.Mesh(new T.CylinderGeometry(.4,.4,.18,32),dark);col.position.set(x,x<0&&x>-3?1.4:-1.2,0);if(x===-1.2)col.position.y=1.4;col.rotation.z=Math.PI/2;g.add(col)}
 // valve on top run
 const vx=-0.2,vy=1.4;const body=new T.Mesh(new T.CylinderGeometry(.5,.5,.9,32),dark);body.position.set(vx,vy,0);body.rotation.z=Math.PI/2;g.add(body);const bon=new T.Mesh(new T.CylinderGeometry(.3,.38,.6,24),pipeM);bon.position.set(vx,vy+.55,0);g.add(bon);const stem=new T.Mesh(new T.CylinderGeometry(.07,.07,.9,12),pipeM);stem.position.set(vx,vy+1.1,0);g.add(stem);
 const wheel=new T.Group();wheel.position.set(vx,vy+1.55,0);const tor=new T.Mesh(new T.TorusGeometry(.65,.07,12,48),new T.MeshStandardMaterial({color:0x55e0e0,metalness:.4,roughness:.35,emissive:0x0b5a5a,emissiveIntensity:.6}));tor.rotation.x=Math.PI/2;wheel.add(tor);for(let i=0;i<3;i++){const sp=new T.Mesh(new T.BoxGeometry(1.3,.06,.08),tor.material);sp.rotation.y=i*Math.PI/3;wheel.add(sp)}g.add(wheel);
 // water particles
 const N=90,total=seg.reduce((a,b)=>a+b,0);const pm=new T.MeshBasicMaterial({color:0x55e0e0,transparent:true,opacity:.95});const ps=new T.InstancedMesh(new T.SphereGeometry(.16,10,8),pm,N);g.add(ps);const t0=[];for(let i=0;i<N;i++)t0.push(i/N);const tmp=new T.Object3D();
 function pos(u){let d=u*total;for(let i=0;i<seg.length;i++){if(d<=seg[i]){const a=P[i],b=P[i+1];return a.clone().lerp(b,d/seg[i])}d-=seg[i]}return P[P.length-1].clone()}
 // inner glow tube
 const glowM=new T.MeshBasicMaterial({color:0x55e0e0,transparent:true,opacity:.0});
 let flow=1,off=0,wr=0;
 const tick=(c,dt)=>{const S=c.state;const tgt=open?1:0;flow=lerp(flow,tgt,.06);const sp=reduced?0:(.045+S.sy*.12)*flow;off=(off+sp*(dt||.016))%1;
  for(let i=0;i<N;i++){const u=(t0[i]+off)%1;const p=pos(u);const j=Math.sin(i*12.9)*.1;tmp.position.set(p.x,p.y+j*.9,j*1.2);const sc=.25+.75*(flow);tmp.scale.setScalar(sc);tmp.updateMatrix();ps.setMatrixAt(i,tmp.matrix)}
  ps.instanceMatrix.needsUpdate=true;pm.opacity=.15+.8*flow;
  wr=lerp(wr,open?0:Math.PI*1.5,.08);wheel.rotation.y=wr+(reduced?0:S.sy*3);
  g.rotation.y=-.28+S.ry+(reduced?0:S.px*.25);g.rotation.x=.18+S.rx*.5+(reduced?0:S.py*.08);g.position.y=-.3;
  const tt=open?'Water flowing':'Valve closed';if(ft.textContent!==tt)ft.textContent=tt;
  if(reduced&&Math.abs(flow-tgt)>.01)c.invalidate()};
 return {tick}},{fov:30,cam:[0,.4,15.5]});
vb.addEventListener('click',()=>{open=!open;vb.setAttribute('aria-pressed',open);vb.textContent=open?'Valve open':'Valve closed';if(ctx){ctx.invalidate();if(reduced){let n=0;const iv=setInterval(()=>{ctx.invalidate();if(++n>30)clearInterval(iv)},30)}}});
