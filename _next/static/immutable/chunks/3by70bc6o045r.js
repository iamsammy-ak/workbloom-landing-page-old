(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,36115,e=>{e.v({planet:"ibrDJW_planet"})},37583,e=>{"use strict";var t=e.i(43476),a=e.i(71645);let r=1/Math.sqrt(3.4*3.4-1),o=Math.PI/180;function n(e,t,a){let r=Math.cos(e),o=Math.sin(e),n=Math.cos(t),i=Math.sin(t),l=Math.cos(a),s=Math.sin(a),c=(e,t,a)=>{let r=e*s+t*l;return[e*l-t*s,r*n-a*i,r*i+a*n]};return[...c(r,0,-o),...c(0,1,0),...c(o,0,r)]}var i=e.i(36115);let l=["uDay","uRelief","uLights","uClouds"],s=[[45.46,9.19],[51.51,-.13],[40.71,-74.01],[-23.55,-46.63],[6.52,3.38],[25.2,55.27],[19.08,72.88],[1.35,103.82],[35.68,139.69],[-33.87,151.21],[-26.2,28.05],[19.43,-99.13],[-12.05,-77.04],[-6.2,106.85],[30.04,31.24],[-1.29,36.82],[41.01,28.98],[-34.6,-58.38],[43.65,-79.38],[37.57,126.98]],c=-15*Math.PI/180,u=`
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec3 uFrame;
uniform float uTime, uDpr;
uniform mat3 uR;
uniform vec4 uPing[${s.length+4}];
uniform sampler2D uDay, uRelief, uLights, uClouds;
const float CAMERA = 3.400;
const float PI = 3.14159265;
const vec3 SUN = vec3(-.779, .32, .539);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1., 0., 0.)), f.x), mix(hash3(i + vec3(0., 1., 0.)), hash3(i + vec3(1., 1., 0.)), f.x), f.y),
    mix(mix(hash3(i + vec3(0., 0., 1.)), hash3(i + vec3(1., 0., 1.)), f.x), mix(hash3(i + vec3(0., 1., 1.)), hash3(i + vec3(1., 1., 1.)), f.x), f.y),
    f.z);
}

void main() {
  float px = 1. / uFrame.z, cssPx = px * uDpr, t = uTime;
  vec2 q = (gl_FragCoord.xy - uFrame.xy) * px;
  vec3 ro = vec3(0., 0., CAMERA);
  vec3 rd = normalize(vec3(q / sqrt(CAMERA * CAMERA - 1.), -1.));
  float b = dot(ro, rd), closest = CAMERA * CAMERA - b * b, h = 1. - closest;
  float dist = sqrt(max(closest, 0.)), above = max(dist - 1., 0.);
  // Off-disc pixels use the silhouette point so texture derivatives stay continuous.
  vec3 p = h > 0. ? ro + rd * (-b - sqrt(h)) : normalize(ro - rd * b);
  vec3 nl = vec3(dot(uR[0], p), dot(uR[1], p), dot(uR[2], p));
  vec2 uv = vec2(atan(nl.x, nl.z) / (2. * PI) + .5, .5 - asin(clamp(nl.y, -1., 1.)) / PI);
#ifdef GL_OES_standard_derivatives
  float seamless = fract(uv.x + .5) - .5;
  if (fwidth(seamless) < fwidth(uv.x) - .001) uv.x = seamless;
#endif

  // Space: stars, blue glow, wispy limb and drifting atmosphere particles.
  vec3 col = vec3(0.);
  vec2 dir = q / max(length(q), 1e-4);
  vec2 starCell = floor(gl_FragCoord.xy / (3. * uDpr));
  float star = hash(starCell);
  if (star > .993) {
    float twinkle = .55 + .45 * sin(t * (.6 + star * 2.) + star * 90.);
    float d = length(fract(gl_FragCoord.xy / (3. * uDpr)) - .5) * 3.;
    col += vec3(.75, .85, 1.) * (1. - smoothstep(.2, 1.1, d)) * (.3 + .7 * hash(starCell + 7.)) * twinkle * smoothstep(1.05, 1.4, dist);
  }
  float glow = exp(-above * 10.) * .36 + exp(-above * 3.2) * .13;
  glow *= .75 + .35 * dot(dir, normalize(SUN.xy));
  col += vec3(.15, .34, 1.) * glow * step(1., dist);
  if (dist > .98 && dist < 1.4) {
    vec3 w = vec3(dir * 2.4, above * 9. - t * .14);
    float n = noise(w + vec3(t * .02, 0., 0.)) * .62 + noise(w * 2.3 + 3.1) * .38;
    float wisp = smoothstep(.5, .82, n) * exp(-above * 13.) * smoothstep(.985, 1.015, dist);
    col += mix(vec3(.3, .45, 1.), vec3(.72, .94, 1.), n) * wisp * .85;
    float lane = mod((atan(q.y, q.x) / (2. * PI) + .5) * 96. + t * .35, 96.), cell = floor(lane);
    float seed = hash(vec2(cell, 3.)), ring = 1.03 + seed * .24;
    float angle = (cell + .5 + (hash(vec2(cell, 9.)) - .5) * .6 - t * .35) / 96. * 2. * PI - PI;
    float mote = length(q - vec2(cos(angle), sin(angle)) * ring) / cssPx;
    col += vec3(.6, .78, 1.) * (1. - smoothstep(.3, 1.3, mote)) * step(.5, hash(vec2(cell, 5.))) * .7 * exp(-(ring - 1.) * 5.);
  }
  // Fade the backdrop before the canvas edge so the glow never shows a hard rectangle.
  vec2 edge = min(gl_FragCoord.xy, uFrame.xy * 2. - gl_FragCoord.xy) / uDpr;
  col *= smoothstep(0., min(56., min(uFrame.x, uFrame.y) / uDpr * .5), min(edge.x, edge.y));
  float alpha = min(1., max(col.r, max(col.g, col.b)));

  float cover = clamp((1. - dist) / (1.5 * px) + .5, 0., 1.);
  if (cover > 0.) {
    vec3 n = normalize(p), view = normalize(ro - p);
    float facing = max(dot(n, view), 0.), sun = dot(n, SUN);
    float day = smoothstep(-.15, .3, sun);
    // Terrain relief from the height map (0 = sea, land starts at 12/255).
    vec2 texel = vec2(1.5 / 2048., 1.5 / 1024.);
    float h0 = texture2D(uRelief, uv).r;
    float hE = max(texture2D(uRelief, uv + vec2(texel.x, 0.)).r - .047, 0.);
    float hN = max(texture2D(uRelief, uv - vec2(0., texel.y)).r - .047, 0.);
    float land = smoothstep(.02, .06, h0), hC = max(h0 - .047, 0.);
    vec3 east = normalize(vec3(nl.z, 0., -nl.x) + vec3(1e-5, 0., 0.));
    vec3 north = cross(nl, east);
    vec3 bumped = uR * normalize(nl - (east * (hE - hC) + north * (hN - hC)) * 22. * land);
    float diffuse = max(dot(bumped, SUN), 0.);

    // Deepened albedo, copper-warm sunlight on land, navy ocean with a faint blue ambient.
    vec3 albedo = pow(texture2D(uDay, uv).rgb, vec3(1.55)) * 1.9;
    vec3 ocean = mix(vec3(.012, .04, .12), albedo * vec3(.3, .5, 1.), .35);
    vec3 surface = mix(ocean, albedo * vec3(1.12, .94, .78), land) * (diffuse * vec3(1.3, 1.12, .95) + .01);
    surface += vec3(.004, .014, .045) * (1. - land * .6);
    float flow = texture2D(uClouds, uv * vec2(6., 3.) + vec2(t * .003, t * .001)).r;
    float spec = max(dot(n, normalize(SUN + view)), 0.);
    surface += vec3(1., .92, .78) * (pow(spec, 90.) * .9 + pow(spec, 12.) * .06) * (1. - land) * day * (.7 + .6 * flow);
    float night = 1. - smoothstep(-.2, .06, sun);
    surface += vec3(1., .74, .42) * pow(texture2D(uLights, uv).r, .6) * 3.2 * night;

    // Three cloud decks with their own spin, plus soft shadows cast by the lowest one.
    vec2 deck = uv + vec2(t * .0025, 0.);
    float c1 = texture2D(uClouds, deck).r;
    float c2 = texture2D(uClouds, vec2(.37 - uv.x + t * .004, 1. - uv.y)).r;
    float c3 = texture2D(uClouds, vec2(uv.x * 2. + .71 + t * .006, uv.y)).r;
    float cloud = 1. - (1. - c1 * .48) * (1. - c2 * .18) * (1. - c3 * c3 * .2);
    vec3 sunLocal = vec3(dot(uR[0], SUN), dot(uR[1], SUN), dot(uR[2], SUN));
    float cosLat = max(sqrt(1. - nl.y * nl.y), .15);
    vec2 shadowShift = vec2(dot(sunLocal, east) / (2. * PI * cosLat), -dot(sunLocal, north) / PI) * .02;
    surface *= 1. - texture2D(uClouds, deck + shadowShift).r * .5 * day;
    surface = mix(surface, vec3(.86, .9, 1.) * (max(sun, 0.) * 1.05 + .015), cloud * (.2 + .55 * day));

    float fresnel = 1. - facing;
    surface = mix(surface, vec3(.18, .4, 1.) * (.25 + day), pow(fresnel, 2.2) * .42);
    surface += vec3(.72, .94, 1.) * pow(fresnel, 8.) * (.2 + .95 * smoothstep(-.4, .6, sun));

    vec3 ping = vec3(0.);
    for (int i = 0; i < ${s.length+4}; i++) {
      vec4 target = uPing[i];
      float age = t - target.w, life = 2.6;
      if (i < ${s.length}) age = mod(age, 4.2); else if (age < 0. || age > life) continue;
      float gap = length(nl - target.xyz);
      float reach = i < ${s.length} ? .075 : .12;
      ping += (1. - smoothstep(cssPx * .5, cssPx * 1.4, abs(gap - age / life * reach))) * max(1. - age / life, 0.) * .85;
      ping += (1. - smoothstep(cssPx * 1., cssPx * 2.2, gap)) * .9;
    }
    surface += vec3(1., .93, .72) * ping * (.35 + .65 * facing);
    col = mix(col, surface, cover);
    alpha = mix(alpha, 1., cover);
  }
  gl_FragColor = vec4(col, alpha);
}`;e.s(["default",0,function(){let e=(0,a.useRef)(null);return(0,a.useEffect)(()=>{let t=e.current;if(!t)return;let a=t.getContext("webgl",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,powerPreference:"low-power"});if(!a)return;a.getExtension("OES_standard_derivatives");let i=matchMedia("(prefers-reduced-motion: reduce)"),d=matchMedia("(pointer: coarse)"),h=[],f=[],m=null,v=null,p={},g=0,x=0,E=0,w=1,b=1,R=1,M=!1,T=!1,P=!1,y=!1,A=c,_=0,L=0,D=0,S=0,C=0,I=0,U=null,F=n(A,.2,.41),N=0,X=new Float32Array((s.length+4)*4).fill(-1e3);s.forEach(([e,t],a)=>{let r;X.set([(r=Math.cos(e*o))*Math.sin(t*o),Math.sin(e*o),r*Math.cos(t*o),-(.35*a)],4*a)});let q=()=>{cancelAnimationFrame(g),g=0,x=0},z=()=>{T&&!y&&(F=n(A+D,.2+_+S,.41),a.viewport(0,0,t.width,t.height),a.uniform3f(p.uFrame,t.width/2,t.height/2,.37*Math.min(t.width,t.height)),a.uniform1f(p.uTime,E),a.uniform1f(p.uDpr,R),a.uniformMatrix3fv(p.uR,!1,F),a.uniform4fv(p.uPing,X),a.drawArrays(a.TRIANGLES,0,3),t.dataset.rendered="true")},O=e=>{if(g=0,!M||document.hidden||y)return;let t=x?Math.min((e-x)/1e3,.05):0;if(x=e,i.matches||(E+=t,A+=.06*t),!U){var a;let e,[r,o]=[(a=L)*(1-(e=Math.exp(-2.6*t)))/2.6,a*e];A+=r,L=o}let r=1-Math.exp(-(4*t));D+=(C-D)*r,S+=(I-S)*r,z();let o=Math.abs(L)>.002||Math.abs(C-D)+Math.abs(I-S)>5e-4;(!i.matches||U||o)&&(g=requestAnimationFrame(O))},B=()=>{g||!T||!M||document.hidden||y||(g=requestAnimationFrame(O))},Y=()=>{q(),t.dataset.motion=i.matches?"reduced":!M||document.hidden?"offscreen":"running",i.matches&&(L=D=S=C=I=_=0,U=null),T&&M&&!document.hidden&&!y&&(z(),i.matches||B())},k=()=>{let e=t.getBoundingClientRect();w=Math.max(1,e.width),b=Math.max(1,e.height),R=Math.min(devicePixelRatio||1,d.matches?1.25:1.5),t.width=Math.round(w*R),t.height=Math.round(b*R),M&&!document.hidden&&z()},G=e=>{let a=t.getBoundingClientRect(),r=.37*Math.min(w,b);return[(e.clientX-a.left-w/2)/r,-(e.clientY-a.top-b/2)/r]},$=e=>{!i.matches&&T&&("mouse"!==e.pointerType||0===e.button)&&(U={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,at:e.timeStamp,moved:!1},L=0,t.setPointerCapture(e.pointerId),t.dataset.dragging="true",B())},W=e=>{if(i.matches)return;if(!U){if("mouse"!==e.pointerType)return;let[t,a]=G(e);C=.14*Math.max(-1,Math.min(1,t/2.2)),I=.1*Math.max(-1,Math.min(1,-a/2.2)),B();return}if(e.pointerId!==U.id)return;let t=.37*Math.min(w,b),a=(e.clientX-U.x)/t,r=(e.clientY-U.y)/t,o=Math.max((e.timeStamp-U.at)/1e3,1/240);A+=a,_=Math.max(-.7,Math.min(.5,_+r)),L=.3*L+a/o*.7,U.x=e.clientX,U.y=e.clientY,U.at=e.timeStamp,Math.hypot(e.clientX-U.startX,e.clientY-U.startY)>6&&(U.moved=!0)},j=e=>{if(!U||e.pointerId!==U.id)return;let a=!U.moved&&"pointerup"===e.type;if(e.timeStamp-U.at>80&&(L=0),L=Math.max(-6,Math.min(6,L)),U=null,delete t.dataset.dragging,a&&!i.matches){let t=function(e,t){let a=e*r,o=t*r,n=Math.hypot(a,o,1),i=-3.4/n,l=i*i-(3.4*3.4-1);if(l<0)return null;let s=-i-Math.sqrt(l);return[a/n*s,o/n*s,3.4-s/n]}(...G(e));t&&(X.set([...function(e,[t,a,r]){return[e[0]*t+e[1]*a+e[2]*r,e[3]*t+e[4]*a+e[5]*r,e[6]*t+e[7]*a+e[8]*r]}(F,t),E],(s.length+N++%4)*4),L=0)}B()},K=()=>{C=I=0,B()},H=()=>{y=!0,q(),delete t.dataset.rendered},V=e=>{e.preventDefault(),H()},J=new IntersectionObserver(([e])=>{M=e.isIntersecting,Y()}),Q=new ResizeObserver(k);return J.observe(t),Q.observe(t),document.addEventListener("visibilitychange",Y),i.addEventListener("change",Y),t.addEventListener("webglcontextlost",V),t.addEventListener("pointerdown",$),t.addEventListener("pointermove",W),t.addEventListener("pointerup",j),t.addEventListener("pointercancel",j),t.addEventListener("pointerleave",K),k(),(async()=>{try{let e=await Promise.all(l.map(async e=>{let t=new Image;return t.src=`/workbloom-landing-page-old/auth/planet/${e.slice(1).toLowerCase()}.webp`,await t.decode(),t}));if(P)return;let t=(e,t)=>{let r=a.createShader(e);if(!r)throw Error("Shader unavailable");if(h.push(r),a.shaderSource(r,t),a.compileShader(r),!a.getShaderParameter(r,a.COMPILE_STATUS))throw Error(a.getShaderInfoLog(r)??"Shader compilation failed");return r};if(!(m=a.createProgram()))throw Error("Program unavailable");if(a.attachShader(m,t(a.VERTEX_SHADER,"attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0., 1.); }")),a.attachShader(m,t(a.FRAGMENT_SHADER,u)),a.linkProgram(m),!a.getProgramParameter(m,a.LINK_STATUS))throw Error("Program linking failed");if(a.useProgram(m),!(v=a.createBuffer()))throw Error("Quad buffer unavailable");a.bindBuffer(a.ARRAY_BUFFER,v),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),a.STATIC_DRAW);let r=a.getAttribLocation(m,"aPos");a.enableVertexAttribArray(r),a.vertexAttribPointer(r,2,a.FLOAT,!1,0,0),p=Object.fromEntries(["uFrame","uTime","uDpr","uR","uPing"].map(e=>[e,a.getUniformLocation(m,e)])),e.forEach((e,t)=>{let r=a.createTexture();if(!r)throw Error("Texture unavailable");f.push(r),a.activeTexture(a.TEXTURE0+t),a.bindTexture(a.TEXTURE_2D,r);let o=0===t?a.RGB:a.LUMINANCE;a.texImage2D(a.TEXTURE_2D,0,o,o,a.UNSIGNED_BYTE,e),a.generateMipmap(a.TEXTURE_2D),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR_MIPMAP_LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.REPEAT),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.uniform1i(a.getUniformLocation(m,l[t]),t)}),a.clearColor(0,0,0,0),T=!0,Y()}catch(e){P||(console.warn("Planet scene unavailable",e),H())}})(),()=>{P=!0,q(),J.disconnect(),Q.disconnect(),document.removeEventListener("visibilitychange",Y),i.removeEventListener("change",Y),t.removeEventListener("webglcontextlost",V),t.removeEventListener("pointerdown",$),t.removeEventListener("pointermove",W),t.removeEventListener("pointerup",j),t.removeEventListener("pointercancel",j),t.removeEventListener("pointerleave",K),f.forEach(e=>a.deleteTexture(e)),v&&a.deleteBuffer(v),m&&a.deleteProgram(m),h.forEach(e=>a.deleteShader(e))}},[]),(0,t.jsx)("canvas",{ref:e,className:i.default.planet,"data-auth-scene":"globe","aria-hidden":"true"})}],37583)},62605,function(e){e.n(e.i(37583))}]);