'use strict';
const $=s=>document.querySelector(s),norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase(),esc=s=>s.replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';'),nf=x=>String(x).replace('.',','),fmt=t=>String(t/60|0).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
const KEY='alertaLab1',NAMES=['Archivo de muestras','Etiquetas perdidas','Terminal de disoluciones','Mesa de análisis','Candado del armario'];
const D0={team:'',go:0,st:0,t:0,warn:0,p1:{},ok1:{},bad:{},found:[],cw:{},att:0,cwOk:0,ex:0,exw:0,exa:[0,0,0,0],cards:[],wait:0,open:0};
const fresh=()=>JSON.parse(JSON.stringify(D0));
let S;try{S=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)))}catch(e){S=fresh()}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const SAMP=[['fe','🔩','Hierro puro','E'],['o2','🫧','Oxígeno puro','E'],['h2o','💧','Agua destilada (H₂O)','C'],['co2','🌫️','Dióxido de carbono puro (CO₂)','C'],['aire','🌬️','Aire limpio','H'],['sal','🧂','Agua con sal completamente disuelta','H'],['arena','🏖️','Agua con arena','T'],['aceite','🛢️','Agua con aceite','T']];
const CATS={E:'Elemento',C:'Compuesto',H:'Mezcla homogénea',T:'Mezcla heterogénea'};
const WS=["QFEEIRANEGD","DISOLVENTEI","IINRNOFOSSS","LSHTDLASAOO","SAOARDUOTVL","RADLIQULUVU","EIAUULOERPC","CALEITNVALI","AIEDILOFDEO","DDMSMFNNAEN","AENGALCZEMA"].join('');
const WORDS=[['SOLUTO','SOLUTO','Sustancia que se disuelve.'],['DISOLVENTE','DISOLVENTE','Sustancia en la que se disuelve el soluto.'],['DISOLUCION','DISOLUCIÓN','Mezcla homogénea de dos o más sustancias.'],['MEZCLA','MEZCLA','Sistema formado por dos o más sustancias.'],['DILUIDA','DILUIDA','Disolución con poca cantidad de soluto en relación con el disolvente.'],['SATURADA','SATURADA','Disolución que ha alcanzado la cantidad máxima de soluto que puede disolver a esa temperatura.']];
const CW=[[1,'HETEROGENEA','d',0,6,'Tipo de mezcla en la que pueden distinguirse partes con distinta composición.'],[2,'HOMOGENEA','d',1,1,'Tipo de mezcla en la que no se distinguen sus componentes.'],[3,'CONCENTRADA','a',2,0,'Disolución que contiene una proporción relativamente alta de soluto.'],[4,'ACUOSA','d',2,10,'Disolución cuyo disolvente es agua.'],[5,'GASEOSA','a',9,3,'Estado físico del aire, que es una mezcla homogénea.']];
const CWD=['HETEROGÉNEA','HOMOGÉNEA','CONCENTRADA','ACUOSA','GASEOSA'],BANK=['ACUOSA','COLOIDE','CONCENTRADA','GASEOSA','HETEROGÉNEA','HOMOGÉNEA','SATURADA'];
const cwCells=i=>{const [,w,d,r,c]=CW[i];return [...w].map((_,k)=>d=='a'?[r,c+k]:[r+k,c])};
const NM=new Map();CW.forEach((_,i)=>cwCells(i).forEach(([r,c])=>{const k=r+','+c;NM.has(k)||NM.set(k,[]);NM.get(k).push(i)}));
const fr=(a,b)=>`<span class="fr"><b>${a}</b><b>${b}</b></span>`,sb=(a,b)=>a+'<sub>'+b+'</sub>';
const EX=[
{ic:'💧',n:'gota',d:7,t:'Porcentaje en masa',q:'Se disuelven 14 g de sal en 186 g de agua. Calculad la masa de la disolución y su porcentaje en masa.',f:[['Masa de la disolución','g',200],['Porcentaje en masa','%',7]],h1:'Sumad la masa del soluto y la del disolvente antes de hacer el porcentaje.',h2:`% en masa = ${fr(sb('m','soluto'),sb('m','disolución'))} · 100<br><small>m soluto: la sal · m disolución: soluto + disolvente</small>`},
{ic:'⚗️',n:'matraz',d:9,t:'Porcentaje en volumen',q:'Una disolución contiene 36 mL de un soluto líquido en 0,4 L de disolución. Calculad el porcentaje en volumen.',f:[['Volumen total de la disolución','mL',400],['Porcentaje en volumen','%',9]],h1:'Expresad los dos volúmenes en la misma unidad antes de dividir.',h2:`% en volumen = ${fr(sb('V','soluto'),sb('V','disolución'))} · 100<br><small>V soluto: el soluto líquido · V disolución: volumen total, en la misma unidad</small>`},
{ic:'⚖️',n:'balanza',d:4,t:'Concentración en g/L',q:'Se disuelven 12 g de azúcar y se añade agua hasta obtener 500 mL de disolución. Calculad la concentración en g/L.',f:[['Volumen de la disolución','L',0.5],['Concentración','g/L',24]],h1:'Para obtener g/L, usad la masa de soluto en gramos y el volumen total en litros.',h2:`c (g/L) = ${fr(sb('m','soluto')+' (g)',sb('V','disolución')+' (L)')}<br><small>Dígito de la tarjeta: la cifra de las unidades de la concentración.</small>`},
{ic:'🧪',n:'tubo de ensayo',d:6,t:'Masa de soluto',q:'Una disolución tiene una concentración de 24 g/L. ¿Qué masa de soluto hay en 250 mL de disolución?',f:[['Volumen de la disolución','L',0.25],['Masa de soluto','g',6]],h1:'24 g/L significa que cada litro de disolución contiene 24 g de soluto. Calculad cuánto corresponde al volumen dado.',h2:`${sb('m','soluto')} (g) = c (g/L) · ${sb('V','disolución')} (L)<br><small>c: gramos de soluto por cada litro · V: volumen de la disolución en litros</small>`}];
const ORD=[['balanza','⚖️'],['gota','💧'],['tubo de ensayo','🧪'],['matraz','⚗️']];
const WINT=['🗄️ Armario de muestras iluminado: las 8 muestras están bien archivadas.','🏷️ Etiquetas recuperadas: las 6 palabras están a salvo.','💻 Terminal encendido: todas las palabras del crucigrama son correctas.','🔬 Mesa de análisis completada: ya tenéis los cuatro dígitos en el registro.'];
let sel=null,wsA=null,wsF=0,aw=0,code='',tt,tog=0;
const say=t=>{const m=$('#msg');if(m)m.textContent=t},toast=t=>{$('#toast').textContent=t;clearTimeout(tt);tt=setTimeout(()=>$('#toast').textContent='',9000)};
const doors=()=>{const d=$('#doors');d.classList.add('go');setTimeout(()=>d.classList.remove('go'),900)};
const complete=()=>{S.wait=1;save();doors();render()};
const tok=c=>`<div class="tok">${c.ic} <b>${c.n}</b> <span>${c.d}</span></div>`;
function sec(t,a){return a.length?`<h4>${t}</h4><ul>${a.map(x=>'<li>'+x+'</li>').join('')}</ul>`:''}
function regHTML(){let h='<h3>📋 Registro del equipo</h3>';
h+=sec('Muestras archivadas',SAMP.filter(s=>S.ok1[s[0]]).map(s=>`${s[1]} ${s[2]} → ${CATS[s[3]]}`));
h+=sec('Palabras encontradas',S.found.map(f=>WORDS[f.w][1]));
h+=sec('Terminal',S.cwOk?CWD:[]);
h+=sec('Resultados validados',S.cards.map((c,i)=>`Ficha ${i+1}: `+EX[i].f.map(x=>nf(x[2])+' '+x[1]).join(' · ')));
h+=sec('Tarjetas de dígito',S.cards.map(tok));
return h+(S.go?'':'<p>Todavía no hay datos validados.</p>')}
function render(){const m=$('#main');m.onclick=m.onkeydown=m.oninput=m.onfocusin=m.onmousedown=null;
$('#nav').hidden=!S.go;$('#nav').innerHTML=NAMES.map((n,i)=>{const d=i<S.st||(i==S.st&&S.wait)||S.open,c=i==S.st&&!d;return `<li class="${d?'done':c?'cur':'lock'}"><span>${d?'🔓 Superada':c?'🔑 En curso':'🔒 Cerrada'}</span>${i+1}. ${n}</li>`}).join('');
$('#alarm').className='alarm'+(S.open?' okk':'');$('#alarm').textContent=S.open?'✅ Laboratorio operativo':'🚨 Alarma activa';
if(!$('#reg').hidden)$('#reg').innerHTML=regHTML()+'<button class="big" id="rc">Cerrar</button>';
if(!S.go)return intro(m);if(S.open)return fin(m);if(S.wait)return win(m);[p1,p2,p3,p4,p5][S.st](m)}
function intro(m){m.innerHTML=`<section class="card"><h2>🚨 Ha saltado la alarma</h2><p>Ha saltado la alarma del laboratorio. Las muestras siguen a salvo, pero el armario de control se ha bloqueado. Recuperad el registro de las muestras y reunid los cuatro dígitos para abrirlo.</p><p>🔄 Id rotando: <b>quién maneja</b> el dispositivo, <b>quién lee</b> y <b>quién comprueba</b> los cálculos.</p><label>Nombre del equipo (opcional) <input id="tn" maxlength="30"></label><br><button class="big" id="go">Empezar ▶</button></section>`;
m.onclick=e=>{if(e.target.id=='go'){S.team=$('#tn').value.trim();S.go=1;save();render()}}}
function win(m){m.innerHTML=`<section class="card win"><h2>✅ Prueba ${S.st+1} superada</h2><p>${WINT[S.st]}</p>${S.st==3?S.cards.map(tok).join(''):''}<button class="big" id="nx">Siguiente prueba ▶</button></section>`;
m.onclick=e=>{if(e.target.id=='nx'){S.st++;S.wait=0;save();doors();render()}}}
function fin(m){m.innerHTML=`<section class="card win"><div class="cab"><i></i><i></i>🧫</div><h2>✅ Laboratorio operativo</h2><p>${S.team?'Equipo <b>'+esc(S.team)+'</b> · ':''}Tiempo: <b>${fmt(S.t)}</b></p><div style="text-align:left">${regHTML()}</div><h3>Para comentar en voz alta</h3><ol style="text-align:left"><li>¿Por qué la masa de la disolución se usa en el denominador del porcentaje en masa?</li><li>¿Por qué convertimos los mililitros a litros al calcular una concentración en g/L?</li></ol></section>`}
function p1(m){let h='<section class="card"><h2>🗄️ Prueba 1 · El archivo de muestras</h2><p>Pulsad una muestra y, después, su categoría.</p><div class="cards">';
SAMP.forEach(s=>{const a=S.p1[s[0]],o=S.ok1[s[0]],b=S.bad[s[0]];h+=`<button class="samp ${o?'ok':b?'bad':''} ${sel==s[0]?'sel':''}" data-id="${s[0]}" aria-pressed="${sel==s[0]}" ${o?'disabled':''}><span class="ico">${s[1]}</span><b>${s[2]}</b><em>${a?(o?'✔ ':b?'✘ ':'')+CATS[a]:'Sin clasificar'}</em></button>`});
h+='</div><div class="cats">'+Object.keys(CATS).map(k=>`<button class="cat" data-k="${k}">${CATS[k]}</button>`).join('')+'</div><button class="big" id="chk">Comprobar</button><p id="msg" role="status"></p></section>';m.innerHTML=h;
m.onclick=e=>{const b=e.target.closest('button');if(!b)return;
if(b.dataset.id){sel=b.dataset.id;render();say('Muestra elegida. Ahora pulsad su categoría.')}
else if(b.dataset.k){if(!sel)return say('Elegid primero una muestra.');S.p1[sel]=b.dataset.k;delete S.bad[sel];sel=null;save();render()}
else if(b.id=='chk'){const n=SAMP.filter(s=>!S.p1[s[0]]).length;if(n)return say('Faltan '+n+' muestras por clasificar.');
SAMP.forEach(s=>{if(S.p1[s[0]]==s[3]){S.ok1[s[0]]=1;delete S.bad[s[0]]}else S.bad[s[0]]=1});save();
if(SAMP.every(s=>S.ok1[s[0]]))return complete();render();say('✘ Hay muestras mal clasificadas. Recordad: una sustancia pura tiene composición fija; una mezcla tiene varias sustancias. ¿Se distinguen partes en la muestra?')}}}
function paintWS(){document.querySelectorAll('.ws button').forEach(b=>{const i=+b.dataset.i;b.className=S.found.some(f=>f.c.includes(i))?'f':i===wsA?'s':''});
$('#wl').innerHTML=WORDS.map((w,i)=>`<li>${w[2]} <small>(${w[0].length} letras)</small> ${S.found.some(x=>x.w==i)?'<span class="got">✔ '+w[1]+'</span>':'<span>🔒</span>'}</li>`).join('');$('#wc').textContent=S.found.length+' de 6'}
function p2(m){m.innerHTML=`<section class="card"><h2>🏷️ Prueba 2 · Etiquetas perdidas</h2><p>Encontrad cada palabra: pulsad su primera y su última letra (en cualquier sentido). Encontradas: <b id="wc"></b></p><div class="two"><div class="ws" role="group" aria-label="Sopa de letras">${[...WS].map((l,i)=>`<button data-i="${i}" tabindex="${i==wsF?0:-1}" aria-label="Fila ${i/11+1|0}, columna ${i%11+1}, ${l}">${l}</button>`).join('')}</div><ol class="clues" id="wl"></ol></div><p id="msg" role="status"></p></section>`;paintWS();
m.onkeydown=e=>{const t=e.target.dataset.i;if(t==null||e.key.slice(0,5)!='Arrow')return;e.preventDefault();const c=t%11;let n=+t+({ArrowLeft:c?-1:0,ArrowRight:c<10?1:0,ArrowUp:-11,ArrowDown:11}[e.key]);if(n<0||n>120)return;wsF=n;const bs=m.querySelectorAll('.ws button');bs.forEach((b,k)=>b.tabIndex=k==n?0:-1);bs[n].focus()};
m.onclick=e=>{const b=e.target.closest('.ws button');if(!b)return;const i=+b.dataset.i;wsF=i;
if(wsA===null){wsA=i;paintWS();return say('Primera letra marcada. Pulsad la última.')}
if(wsA==i){wsA=null;paintWS();return say('')}
const r1=wsA/11|0,c1=wsA%11,r2=i/11|0,c2=i%11,dr=r2-r1,dc=c2-c1,n=Math.max(Math.abs(dr),Math.abs(dc));wsA=null;let cells=[];
if(!dr||!dc||Math.abs(dr)==Math.abs(dc))for(let k=0;k<=n;k++)cells.push((r1+Math.sign(dr)*k)*11+c1+Math.sign(dc)*k);
const s=cells.map(x=>WS[x]).join(''),rv=[...s].reverse().join(''),w=cells.length?WORDS.findIndex(x=>x[0]==s||x[0]==rv):-1;
if(w>=0&&!S.found.some(f=>f.w==w)){S.found.push({w,c:cells});save();paintWS();if(S.found.length==6)return complete();say('✔ ¡Palabra encontrada!')}
else{paintWS();say('✘ Esa selección no coincide con ninguna palabra pendiente. Probad de nuevo.')}}}
const cin=(r,c)=>document.querySelector(`input[data-r="${r}"][data-c="${c}"]`);
function paintCW(){document.querySelectorAll('.cell input').forEach(t=>t.classList.remove('aw'));cwCells(aw).forEach(([r,c])=>cin(r,c).classList.add('aw'))}
function step(t,d){const cs=cwCells(aw),k=cs.findIndex(([r,c])=>r==t.dataset.r&&c==t.dataset.c),n=cs[k+d];if(n)cin(n[0],n[1]).focus()}
function p3(m){let g='';for(let r=0;r<11;r++)for(let c=0;c<11;c++){const k=r+','+c;if(!NM.has(k)){g+='<div></div>';continue}const st=CW.find(w=>w[3]==r&&w[4]==c);g+=`<div class="cell">${st?'<i>'+st[0]+'</i>':''}<input maxlength="2" data-r="${r}" data-c="${c}" value="${S.cw[k]||''}" autocomplete="off" aria-label="Fila ${r+1}, columna ${c+1}"></div>`}
m.innerHTML=`<section class="card"><h2>💻 Prueba 3 · El terminal de las disoluciones</h2><p>Pulsad una pista para situaros en su palabra. Se escribe sin tildes o con ellas, da igual.</p><div class="two"><div class="cwg">${g}</div><ul class="cwc" style="flex:1 1 16em;list-style:none;padding:0">${CW.map((w,i)=>`<li><button data-w="${i}">${w[0]} ${w[2]=='a'?'→ Horizontal':'↓ Vertical'}: ${w[5]} (${w[1].length} letras)</button> <b id="cs${i}"></b></li>`).join('')}</ul></div><button class="big" id="vc">Validar</button><p id="msg" role="status"></p><div class="bank" id="bank" ${S.att>=3?'':'hidden'}>💡 Banco de palabras (hay 2 de más): <b>${BANK.join(' · ')}</b></div></section>`;paintCW();
m.onfocusin=e=>{const t=e.target;if(!t.dataset.r)return;const w=NM.get(t.dataset.r+','+t.dataset.c);if(!w.includes(aw)){aw=w[0];paintCW()}};
m.onmousedown=e=>{tog=e.target===document.activeElement&&e.target.dataset.r};
m.oninput=e=>{const t=e.target;if(!t.dataset.r)return;const ch=norm(t.value).replace(/[^A-Z]/g,'').slice(-1);t.value=ch;S.cw[t.dataset.r+','+t.dataset.c]=ch;save();if(ch)step(t,1)};
m.onkeydown=e=>{const t=e.target;if(!t.dataset.r)return;
if(e.key=='Backspace'&&!t.value){e.preventDefault();step(t,-1);const p=document.activeElement;p.value='';delete S.cw[p.dataset.r+','+p.dataset.c];save()}
const d={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[e.key];if(d){const n=cin(+t.dataset.r+d[0],+t.dataset.c+d[1]);if(n){e.preventDefault();n.focus()}}};
m.onclick=e=>{const t=e.target,b=t.closest('button');
if(t.dataset.r&&tog){const w=NM.get(t.dataset.r+','+t.dataset.c);if(w.length>1){aw=w[(w.indexOf(aw)+1)%w.length];paintCW()}return}
if(!b)return;if(b.dataset.w!=null){aw=+b.dataset.w;paintCW();const f=cwCells(aw)[0];cin(f[0],f[1]).focus()}
else if(b.id=='vc'){const okw=CW.map((w,i)=>cwCells(i).map(([r,c])=>S.cw[r+','+c]||'').join('')==w[1]);
document.querySelectorAll('.cell input').forEach(x=>x.classList.remove('ok','rv'));
[0,1].forEach(p=>okw.forEach((o,i)=>{if(o==!!p)cwCells(i).forEach(([r,c])=>{const x=cin(r,c);if(p==0)x.classList.add('rv');else if(!x.classList.contains('rv'))x.classList.add('ok')})}));
okw.forEach((o,i)=>$('#cs'+i).textContent=o?'✔ Correcta':'✘ Revisar');
if(okw.every(Boolean)){S.cwOk=1;return complete()}S.att++;save();say('✘ Revisad las pistas marcadas.');if(S.att>=3)$('#bank').hidden=false}}}
function p4(m){const e=EX[S.ex];
if(S.exw){m.innerHTML=`<section class="card win"><h2>✅ Ficha ${S.ex+1} validada</h2>${tok(S.cards[S.ex])}<br><button class="big" id="nx">Siguiente ficha ▶</button></section>`;m.onclick=x=>{if(x.target.id=='nx'){S.ex++;S.exw=0;save();render()}};return}
m.innerHTML=`<section class="card"><h2>🔬 Prueba 4 · Mesa de análisis · Ficha ${S.ex+1} de 4: ${e.t}</h2><p class="q">${e.q}</p><p class="paper">✏️ Anotad la operación en papel antes de validar. Se admite coma o punto decimal.</p>${e.f.map((f,i)=>`<label class="fld">${f[0]}<span><input data-i="${i}" inputmode="decimal" autocomplete="off"> <u>${f[1]}</u> <em id="f${i}"></em></span></label>`).join('')}<div id="hint">${S.exa[S.ex]>=2?'<div><b>Segunda pista:</b> '+e.h2+'</div>':''}</div><button class="big" id="h1">💡 Pista</button><button class="big" id="vf">Validar ficha</button></section>`;
m.onclick=x=>{const b=x.target.closest('button');if(!b)return;
if(b.id=='h1'){if(!$('#hint').textContent.includes(e.h1.slice(0,12)))$('#hint').insertAdjacentHTML('afterbegin','<div>'+e.h1+'</div>')}
else if(b.id=='vf'){let all=1;e.f.forEach((f,i)=>{const s=m.querySelector(`input[data-i="${i}"]`).value.trim().replace(',','.'),v=s===''?NaN:Number(s),o=Math.abs(v-f[2])<0.001,el=$('#f'+i);el.textContent=o?'✔':'✘ Revisad este paso';el.className=o?'g':'';if(!o)all=0});
if(all){S.cards.push({n:e.n,ic:e.ic,d:e.d});if(S.ex==3)return complete();S.exw=1;save();return render()}
S.exa[S.ex]++;save();if(S.exa[S.ex]>=2&&!$('#hint').textContent.includes('Segunda'))$('#hint').insertAdjacentHTML('beforeend','<div><b>Segunda pista:</b> '+e.h2+'</div>')}}}
const paintCode=()=>document.querySelectorAll('.slots b').forEach((b,i)=>b.textContent=code[i]||'·');
const add=d=>{if(code.length<4){code+=d;paintCode()}},del=()=>{code=code.slice(0,-1);paintCode()};
function opn(){if(code.length<4)return say('Faltan dígitos.');
if(code=='4769'){$('#lk').classList.add('spin');say('🔓 ¡Código correcto!');setTimeout(()=>{S.open=1;save();render()},900)}
else{code='';paintCode();say('✘ Código incorrecto. Revisad el orden de los símbolos.')}}
function p5(m){code='';m.innerHTML=`<section class="card"><h2>🔐 Prueba 5 · El candado del armario</h2><div style="text-align:center"><b>Registro, por orden de obtención:</b><br>${S.cards.map(tok).join('')}<p>Introducid los dígitos siguiendo este orden de símbolos:</p><div class="seq">${ORD.map(o=>`<span>${o[1]}<small>${o[0]}</small></span>`).join('<i>→</i>')}</div><div class="lock" id="lk">🔒</div><div class="slots"><b></b><b></b><b></b><b></b></div></div><div class="pad">${[1,2,3,4,5,6,7,8,9,0].map(d=>`<button data-d="${d}" aria-label="${d}">${d}</button>`).join('')}</div><div class="ctl"><button class="big" id="bk">Borrar</button><button class="big" id="op">Abrir</button></div><p id="msg" role="status" style="text-align:center"></p></section>`;paintCode();
m.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.d)add(b.dataset.d);else if(b.id=='bk')del();else if(b.id=='op')opn()}}
document.addEventListener('keydown',e=>{if(!S.go||S.open||S.wait||S.st!=4||e.target.tagName=='INPUT')return;if(/^\d$/.test(e.key))add(e.key);else if(e.key=='Backspace')del();else if(e.key=='Enter'&&e.target.tagName!='BUTTON')opn()});
const clock=()=>$('#clock').textContent='⏱ '+fmt(S.t);
setInterval(()=>{if(!S.go||S.open)return;S.t++;clock();if(S.t>=2700&&!S.warn){S.warn=1;toast('⏳ Quedan unos 5 minutos de clase. Podéis seguir resolviendo después.')}save()},1000);
$('#regBtn').onclick=()=>{const r=$('#reg');r.hidden=!r.hidden;if(!r.hidden)r.innerHTML=regHTML()+'<button class="big" id="rc">Cerrar</button>'};
$('#reg').onclick=e=>{if(e.target.id=='rc')$('#reg').hidden=true};
$('#resetBtn').onclick=()=>$('#cf').hidden=false;$('#cfn').onclick=()=>$('#cf').hidden=true;
$('#cfy').onclick=()=>{S=fresh();try{localStorage.removeItem(KEY)}catch(e){}sel=wsA=null;aw=0;code='';$('#cf').hidden=true;$('#reg').hidden=true;clock();render()};
$('#fsBtn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(e){toast('No se puede activar la pantalla completa aquí. Abrid index.html en el navegador o pulsad F11.')}};
document.onfullscreenchange=()=>$('#fsBtn').textContent=document.fullscreenElement?'⛶ Salir de pantalla completa':'⛶ Pantalla completa';
clock();render();
