(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,16495,e=>{e.v(t=>Promise.all(["static/immutable/chunks/3tm7x9pqk-owx.js"].map(t=>e.l(t))).then(()=>t(20697)))},29526,e=>{e.v({canvas:"EgGSoa_canvas",photo:"EgGSoa_photo",reveal:"EgGSoa_reveal"})},49687,e=>{"use strict";var t=e.i(43476),r=e.i(98194),a=e.i(71645),o=e.i(29526);let i=`
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,n=`
precision highp float;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uProgress;
uniform float uPixelSize;
uniform vec3 uInk;
uniform vec3 uGreen;
uniform vec3 uGround;
varying vec2 vUv;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}
float Bayer4(vec2 a) { return Bayer2(a * 0.5) * 0.25 + Bayer2(a); }
float Bayer8(vec2 a) { return Bayer4(a * 0.5) * 0.25 + Bayer2(a); }
float ordered3(float gray, float threshold) {
  float adjusted = gray + (threshold - 0.5) * 0.5;
  return adjusted < 0.33 ? 0.0 : (adjusted < 0.66 ? 0.5 : 1.0);
}
vec2 fitUv(vec2 uv, float waveMargin) {
  float aspect = uResolution.x / uResolution.y;
  vec2 cover = aspect < uImageAspect
    ? vec2(aspect / uImageAspect, 1.0)
    : vec2(1.0, uImageAspect / aspect);
  vec2 scale = cover / (1.0 + 2.0 * waveMargin);
  return (uv - 0.5) * scale + 0.5;
}
void main() {
  vec2 uv = vUv;
  float waveSpeed = 0.82;
  float waveFrequency = 2.5;
  float waveAmplitude = waveSpeed * 0.4 * (1.0 - uProgress);
  float waveStrength = waveAmplitude * 0.1;
  float revealRadius = 100.0;
  float revealSoftness = 0.5;
  float revealNorm = revealRadius / max(min(uResolution.x, uResolution.y), 1.0);
  vec2 distortedUv = uv;
  distortedUv.x += sin(uv.y * waveFrequency + uTime * waveSpeed) * waveStrength;
  distortedUv.y += sin(uv.x * waveFrequency * 0.7 + uTime * waveSpeed * 0.8) * waveStrength * 0.5;
  if (uMouseActive > 0.01) {
    float dist = distance(uv, uMouse);
    float influence = 1.0 - smoothstep(0.0, revealNorm, dist);
    float ripple = sin(dist * waveFrequency * 5.0 - uTime * waveSpeed)
      * waveAmplitude * 0.05 * influence * uMouseActive;
    distortedUv += vec2(ripple);
  }
  vec3 color = texture2D(uTexture, fitUv(distortedUv, waveAmplitude * 0.15)).rgb;
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  float tone = ordered3(gray, Bayer8(gl_FragCoord.xy / max(uPixelSize, 0.25)));
  vec3 ditherColor = tone < 0.25 ? uInk : (tone < 0.75 ? uGreen : uGround);
  float revealDist = distance(uv * uResolution, uMouse * uResolution);
  float innerRadius = max(0.0, revealRadius * (1.0 - revealSoftness));
  float outerRadius = revealRadius * (1.0 + revealSoftness) + 0.001;
  float cursorReveal = (1.0 - smoothstep(innerRadius, outerRadius, revealDist)) * uMouseActive;
  float reveal = max(cursorReveal, smoothstep(0.0, 1.0, uProgress));
  gl_FragColor = vec4(mix(ditherColor, color, reveal), 1.0);
}
`;e.s(["DitherReveal",0,function({src:e,alt:u,className:s}){let l=(0,a.useRef)(null),c=(0,a.useRef)(null),[v,d]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{let e=matchMedia("(prefers-reduced-motion: reduce)"),t=()=>d(!e.matches);return t(),e.addEventListener("change",t),()=>e.removeEventListener("change",t)},[]),(0,a.useEffect)(()=>{let t,r=l.current,a=c.current;if(!r||!a||!v)return;let o=!1,u=!1,s=!1,d=()=>{},m=()=>{},f=new IntersectionObserver(([l])=>{l.isIntersecting&&(!function(){let l;if(s||o)return;s=!0;try{l=a.getContext("webgl",{antialias:!1,alpha:!1,premultipliedAlpha:!1})}catch{return}let c=l;if(!c)return;let v=null,f=null,h=null,g=[],p=0,E=!1,R=!1,T=1,x=1,A=0,w=!0,L=0,y=0,S=0,U=1,b={x:.5,y:.5,active:0,target:0},_=new window.Image,P=()=>{cancelAnimationFrame(p),p=0,S=0},M=()=>{P(),delete r.dataset.ready,_.onload=null,_.onerror=null,g.forEach(e=>c.deleteShader(e)),c.deleteProgram(v),c.deleteBuffer(f),c.deleteTexture(h)};t=M;let D=()=>{R=!0,M()};function I(e,t){let r=c.createShader(e);if(!r)throw Error("Dither shader unavailable");if(g.push(r),c.shaderSource(r,t),c.compileShader(r),!c.getShaderParameter(r,c.COMPILE_STATUS))throw Error("Dither shader compilation failed");return r}try{if(!(v=c.createProgram()))throw Error("Dither program unavailable");if(c.attachShader(v,I(c.VERTEX_SHADER,i)),c.attachShader(v,I(c.FRAGMENT_SHADER,n)),c.linkProgram(v),!c.getProgramParameter(v,c.LINK_STATUS))throw Error("Dither shader linking failed");if(c.useProgram(v),f=c.createBuffer(),h=c.createTexture(),!f||!h)throw Error("Dither resources unavailable");c.bindBuffer(c.ARRAY_BUFFER,f),c.bufferData(c.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),c.STATIC_DRAW);let e=c.getAttribLocation(v,"aPos");c.enableVertexAttribArray(e),c.vertexAttribPointer(e,2,c.FLOAT,!1,0,0),c.bindTexture(c.TEXTURE_2D,h),c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,!0),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.CLAMP_TO_EDGE),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.CLAMP_TO_EDGE),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,c.LINEAR),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,c.LINEAR)}catch{D();return}let B={time:c.getUniformLocation(v,"uTime"),mouse:c.getUniformLocation(v,"uMouse"),active:c.getUniformLocation(v,"uMouseActive"),resolution:c.getUniformLocation(v,"uResolution"),imageAspect:c.getUniformLocation(v,"uImageAspect"),progress:c.getUniformLocation(v,"uProgress"),pixelSize:c.getUniformLocation(v,"uPixelSize"),ink:c.getUniformLocation(v,"uInk"),green:c.getUniformLocation(v,"uGreen"),ground:c.getUniformLocation(v,"uGround")};function F(e){if(p=0,!E||R||o||!u||document.hidden)return;if(w){let e=r.getBoundingClientRect(),t=.9*innerHeight,a=.42*innerHeight-.5*x;A=Math.max(0,Math.min(1,(t-e.top)/(t-a))),w=!1}let t=S?Math.min(e-S,50):16.67;S=e,y+=t/1e3,b.active+=(b.target-b.active)*(1-Math.exp(-t/110)),c.uniform1f(B.time,y),c.uniform2f(B.mouse,b.x,b.y),c.uniform1f(B.active,b.active),c.uniform1f(B.progress,A),c.drawArrays(c.TRIANGLES,0,3),r.dataset.ready="true",e-L<180||Math.abs(b.active-b.target)>.001?G():S=0}function G(){p||!E||R||o||!u||document.hidden||(p=requestAnimationFrame(F))}function C(){if(R)return;T=Math.max(1,r.clientWidth),x=Math.max(1,r.clientHeight);let e=Math.min(devicePixelRatio||1,1.5);a.width=Math.round(T*e),a.height=Math.round(x*e),c.viewport(0,0,a.width,a.height),c.uniform2f(B.resolution,T,x),c.uniform1f(B.pixelSize,2.5*e),d()}function N(){if(R)return;let e=getComputedStyle(r),t=e=>new Float32Array((e.match(/[\d.]+/g)??["0","0","0"]).slice(0,3).map(Number).map(e=>e/255));c.uniform3fv(B.ink,t(e.color)),c.uniform3fv(B.green,t(e.borderTopColor)),c.uniform3fv(B.ground,t(e.backgroundColor)),d()}function X(e,t){if(R)return;let a=r.getBoundingClientRect();b.x=(e-a.left)/T,b.y=1-(t-a.top)/x,b.target=1,L=performance.now(),G()}d=()=>{w=!0,L=performance.now(),G()},m=P;let k=e=>{"touch"!==e.pointerType&&X(e.clientX,e.clientY)},O=e=>{let t=e.touches[0];t&&X(t.clientX,t.clientY)},j=()=>{b.target=0,G()},z=e=>{"touch"!==e.pointerType&&j()},q=e=>{e.preventDefault(),D()},H=new ResizeObserver(C);H.observe(r);let W=new MutationObserver(N);W.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});let Y=matchMedia("(prefers-color-scheme: dark)");Y.addEventListener("change",N),r.addEventListener("pointermove",k,{passive:!0}),r.addEventListener("touchstart",O,{passive:!0}),r.addEventListener("touchmove",O,{passive:!0}),r.addEventListener("touchend",j,{passive:!0}),r.addEventListener("touchcancel",j,{passive:!0}),r.addEventListener("pointerleave",z),a.addEventListener("webglcontextlost",q),t=()=>{H.disconnect(),W.disconnect(),Y.removeEventListener("change",N),r.removeEventListener("pointermove",k),r.removeEventListener("pointerleave",z),r.removeEventListener("touchstart",O),r.removeEventListener("touchmove",O),r.removeEventListener("touchend",j),r.removeEventListener("touchcancel",j),a.removeEventListener("webglcontextlost",q),M()},C(),N(),_.onload=()=>{if(!o&&!R)try{U=_.naturalWidth/_.naturalHeight,c.bindTexture(c.TEXTURE_2D,h),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,_),c.uniform1f(B.imageAspect,U),E=!0,d()}catch{D()}},_.onerror=D,_.src=e}(),f.disconnect())},{rootMargin:"400px"}),h=new IntersectionObserver(([e])=>{(u=e.isIntersecting)?d():m()}),g=()=>{u&&d()},p=()=>{document.hidden?m():u&&d()};return f.observe(r),h.observe(r),window.addEventListener("scroll",g,{passive:!0}),document.addEventListener("visibilitychange",p),()=>{o=!0,f.disconnect(),h.disconnect(),window.removeEventListener("scroll",g),document.removeEventListener("visibilitychange",p),t?.()}},[e,v]),(0,t.jsxs)("div",{ref:l,className:`${o.default.reveal} ${s??""}`,"data-dither-reveal":"",children:[(0,t.jsx)(r.default,{src:e,alt:u,fill:!0,unoptimized:!0,sizes:"(max-width: 1536px) 94vw, 1440px",className:o.default.photo}),(0,t.jsx)("canvas",{ref:c,className:o.default.canvas,"aria-hidden":"true"})]})}])}]);