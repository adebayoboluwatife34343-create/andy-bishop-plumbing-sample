import * as T from './three.module.js';
export {T};
export const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $=(s,r=document)=>r.querySelector(s);
export const $$=(s,r=document)=>[...r.querySelectorAll(s)];
export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export function initReveal(){const els=$$('.rv');if(reduced||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});els.forEach(e=>io.observe(e))}
export function initMenu(){const b=$('[data-menu]');if(!b)return;b.addEventListener('click',()=>{const o=document.body.classList.toggle('menu');b.setAttribute('aria-expanded',o)});$$('[data-menulink]').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu');b.setAttribute('aria-expanded',false)}));addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu')){document.body.classList.remove('menu');b.setAttribute('aria-expanded',false);b.focus()}})}
export function initQuote(){const f=$('#quote');if(!f)return;const st=$('#qstatus'),fb=$('#qfallback');
 $$('[data-pick]').forEach(b=>b.addEventListener('click',()=>{const s=f.elements.job;if(s){s.value=b.dataset.pick;}const t=$('#quote-anchor')||f;t.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});setTimeout(()=>f.elements.name&&f.elements.name.focus({preventScroll:true}),400)}));
 f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f),name=(d.get('name')||'').toString().trim(),area=(d.get('area')||'').toString().trim(),job=(d.get('job')||'').toString().trim(),msg=(d.get('msg')||'').toString().trim();
  f.querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));
  const bad=[];if(!name)bad.push('name');if(!area)bad.push('area');if(!msg)bad.push('msg');
  if(bad.length){bad.forEach(n=>f.elements[n].setAttribute('aria-invalid','true'));st.textContent='Please add '+bad.map(n=>({name:'your name',area:'your area',msg:'a few details'}[n])).join(', ')+' first.';st.className='err';f.elements[bad[0]].focus();return}
  const text=`Hi ${f.dataset.biz}, my name is ${name} (${area}).${job?' I need a quote for: '+job+'.':''} ${msg} (Sent from the sample website concept by LeadSky Limited)`;
  const url='https://wa.me/'+f.dataset.wa+'?text='+encodeURIComponent(text);
  st.textContent='Opening WhatsApp. Check the message there, then press Send yourself. Nothing is sent from this page.';st.className='ok';
  if(fb){fb.href=url;fb.hidden=false}
  window.__lastWa=url;window.open(url,'_blank','noopener')})}
/* stage: shared three.js helper. build(ctx) must return {tick(ctx,dt)} */
export function stage(host,build,o={}){
 const ctx={T,host,state:{px:0,py:0,sp:0,sy:0,rx:0,ry:0,vx:0,vy:0,t:0,drag:false},r:null,scene:null,cam:null,vis:true,w:1,h:1,reduced};
 let obj,raf=0,last=0,pending=false;
 try{
  const r=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});r.setPixelRatio(Math.min(devicePixelRatio||1,o.dpr||1.75));
  if(o.shadow){r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap}
  r.outputColorSpace=T.SRGBColorSpace;host.appendChild(r.domElement);r.domElement.setAttribute('aria-hidden','true');
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(o.fov||34,1,.1,200);cam.position.set(...(o.cam||[0,1.5,9]));
  Object.assign(ctx,{r,scene,cam});
  obj=build(ctx)||{};
 }catch(err){console.warn('WebGL unavailable',err);host.classList.add('nogl');return null}
 const size=()=>{ctx.w=Math.max(1,host.clientWidth);ctx.h=Math.max(1,host.clientHeight);ctx.r.setSize(ctx.w,ctx.h,false);ctx.r.domElement.style.width='100%';ctx.r.domElement.style.height='100%';ctx.cam.aspect=ctx.w/ctx.h;ctx.cam.updateProjectionMatrix();if(obj.resize)obj.resize(ctx);draw()};
 const S=ctx.state;
 function scrollP(){const b=(o.scrollEl||host).getBoundingClientRect();return clamp((innerHeight-b.top)/(innerHeight+b.height))}
 function draw(){S.sp=reduced?(o.rsp??.5):scrollP();S.sy=reduced?0:clamp(scrollY/(innerHeight*.9));if(obj.tick)obj.tick(ctx,0);ctx.r.render(ctx.scene,ctx.cam)}
 ctx.invalidate=()=>{if(reduced&&!pending){pending=true;requestAnimationFrame(()=>{pending=false;draw()})}};
 function loop(t){raf=0;if(!ctx.vis)return;const dt=Math.min(.05,(t-last)/1000||.016);last=t;S.t+=dt;
  if(!S.drag){S.ry+=S.vy;S.rx+=S.vx;S.vx*=.93;S.vy*=.93}
  S.sp=scrollP();S.sy=clamp(scrollY/(innerHeight*.9));if(obj.tick)obj.tick(ctx,dt);ctx.r.render(ctx.scene,ctx.cam);raf=requestAnimationFrame(loop)}
 const start=()=>{if(!reduced&&!raf&&ctx.vis){last=performance.now();raf=requestAnimationFrame(loop)}};
 new ResizeObserver(size).observe(host);
 if('IntersectionObserver' in window)new IntersectionObserver(e=>{ctx.vis=e[0].isIntersecting;if(ctx.vis){start();ctx.invalidate()}}).observe(host);
 const pe=host;let lx=0,ly=0;
 pe.addEventListener('pointermove',e=>{const b=host.getBoundingClientRect();if(!reduced){S.px=((e.clientX-b.left)/b.width-.5)*2;S.py=((e.clientY-b.top)/b.height-.5)*2}
  if(S.drag){const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;S.vy=dx*.0035;S.vx=dy*.0018;S.ry+=S.vy;S.rx=clamp(S.rx+S.vx,-.7,.7);if(reduced)ctx.invalidate()}});
 pe.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,label,a'))return;S.drag=true;lx=e.clientX;ly=e.clientY;try{pe.setPointerCapture(e.pointerId)}catch(_){}host.classList.add('grab')});
 const up=()=>{S.drag=false;host.classList.remove('grab')};pe.addEventListener('pointerup',up);pe.addEventListener('pointercancel',up);
 pe.addEventListener('pointerleave',()=>{if(!S.drag){S.px=0;S.py=0}});
 if(!host.hasAttribute('tabindex'))host.tabIndex=0;
 host.addEventListener('keydown',e=>{const k={ArrowLeft:[0,-.12],ArrowRight:[0,.12],ArrowUp:[-.06,0],ArrowDown:[.06,0]}[e.key];if(k){e.preventDefault();S.rx=clamp(S.rx+k[0],-.7,.7);S.ry+=k[1];ctx.invalidate();if(!reduced){S.vx=0;S.vy=0}}});
 addEventListener('scroll',()=>{if(reduced)return;},{passive:true});
 size();start();
 ctx.obj=obj;return ctx}
export function makeCanvasTex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t}
export function addLights(ctx,{key=0xffffff,fill=0x8fb3d6,ground=0x203040,ki=2.6,hi=1.6}={}){const s=ctx.scene;s.add(new T.HemisphereLight(fill,ground,hi));const d=new T.DirectionalLight(key,ki);d.position.set(4,8,6);d.castShadow=!!ctx.r.shadowMap.enabled;if(d.castShadow){d.shadow.mapSize.set(1024,1024);const c=d.shadow.camera;c.left=-8;c.right=8;c.top=8;c.bottom=-8}s.add(d);return d}
