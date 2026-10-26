(()=>{'use strict';
const $=id=>document.getElementById(id);
const asset=(f)=>typeof ASSET_URLS!=='undefined'&&ASSET_URLS[f]?ASSET_URLS[f]:'assets/'+f;
const canvas=$('gameCanvas'),c=canvas.getContext('2d');
let W=1152;const H=648,twopi=Math.PI*2;
const worlds=[
 ['Escola Monster High','realm-escola.webp','Corredores e segredos','Encontre Lagoona na escola encantada'],
 ['Skull Shores','realm-praia.webp','Praias e falésias','A costa das aventuras monstruosas'],
 ['Great Scarrier Reef','realm-recife.webp','A cidade submersa','Nade por ruínas e desperte a guardiã do recife'],
 ['Navio Fantasma','realm-navio.webp','Um mistério no mar','Explore o convés e as passagens do navio'],
 ['Reino das Marés','realm-reino.webp','O palácio mágico','Descubra a morada das sereias'],
 ['Templo das Profundezas','realm-templo.webp','Ruínas ancestrais','Ative selos marinhos e derrote a Serpente das Profundezas'],
 ['Floresta de Cristal','realm-floresta.webp','O jardim secreto','Raízes e criaturas luminosas'],
 ['Abismo Final','realm-abismo.webp','O grande resgate','A aventura final de Jonathas']
];
const heroes=['Lauana','Jonathas','Lagoona','Draculaura','Frankie','Clawdeen','Cleo','Abbey','Spectra','Twyla'];
const powers=['Ondas mágicas · Jonathas protege por 5 segundos','Guardião das Marés · tridente elétrico','Impulso de correnteza','Morcegos de corais rosas','Raios da tempestade','Garras de maré e velocidade','Escudo de relíquias','Cristais de gelo','Véu espectral','Passagem pelas sombras'];
const tint=['#36dfff','#f963d7','#b16aff','#52fad0','#ffd46a','#67acff','#c8edff','#ff9fdc','#6b6ffb','#eab3ff','#25f3ff','#ff6baf'];
const outfitNames=['Sereia Azul','Coral Rosa','Ametista','Turquesa','Dourada','Oceano Real','Pérola','Baile das Marés','Noite Neon','Princesa Lunar','Luz do Recife','Rainha do Abismo'];
const images={},imgNames=['templo-aurora.webp','palacio-prismas-eclipse.webp','caverna-serpente.webp','arena-conchas.webp','school-hall-renascida.webp','beach-cove-renascida.webp','beach-play.webp','realm-floresta.webp','realm-abismo.webp','realm-praia.webp','cover-heroes.webp','portrait-lauana.webp','portrait-jonathas.webp',...worlds.map(w=>w[1])];
for(let j=0;j<12;j++) imgNames.push('lauana-sprite-tail-'+j+'.webp','lauana-sprite-upper-'+j+'.webp');
for(const h of heroes)imgNames.push('portrait-'+h.toLowerCase()+'.webp');
for(const f of new Set(imgNames)){const im=new Image();im.src=asset(f);images[f]=im}
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let persisted;try{persisted=JSON.parse(localStorage.getItem('lauana_deluxe_live_v1'))}catch{}
let save={name:'Lauana',pearls:0,skin:0,hero:0,done:false,arenaCleared:false,arenaBest:0,difficulty:'normal',controls:'analog',volume:45,particles:'high',...persisted};
function persist(){try{localStorage.setItem('lauana_deluxe_live_v1',JSON.stringify(save))}catch{}}
let current='opening',slide=0,selectedHero=0,selectedSkin=save.skin;
function screen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));current=id;if(id==='home') renderHome();if(id==='collection')renderCollection();if(id==='settings') renderSettings()}
function tone(hz=450,dur=.08,type='sine',gain=.035){if(save.volume===0)return;try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();let o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(hz,audio.currentTime);g.gain.setValueAtTime(gain*(save.volume/50),audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+dur)}catch{}}
let audio=null;
$('enterBtn').onclick=()=>{tone(530,.13);screen('profile')};
$('playerName').value=save.name;
$('guestBtn').onclick=()=>{save.name=($('playerName').value.trim()||'Lauana').slice(0,24);persist();tone(640,.13);screen('home')};
document.querySelectorAll('[data-screen]').forEach(el=>el.onclick=()=>screen(el.dataset.screen));
function renderHome(){ $('greet').textContent=save.name.toUpperCase();$('pearlBalance').textContent=`◈ ${save.pearls}`;$('saveStatus').textContent=save.done?'✦ MISSÃO DELUXE CONCLUÍDA':'PROGRESSO SALVO NESTE APARELHO';slide=clamp(slide,0,7);$('slideTitle').textContent=worlds[slide][0];$('slideSubtitle').textContent=worlds[slide][2];$('slideDetails').textContent=worlds[slide][3];$('slideVisual').style.backgroundImage=`url('${asset(worlds[slide][1])}')`;$('slideCount').textContent=String(slide+1).padStart(2,'0')+' / 08';$('slideAction').textContent=slide===3?'ABRIR CAMPANHA CLÁSSICA':'▶ JOGAR ESTE PORTAL';$('worldThumbs').innerHTML=worlds.map((w,i)=>`<button class="${i===slide?'active':''}" data-world="${i}" title="${w[0]}"><img src="${asset(w[1])}" alt="${w[0]}"></button>`).join('');$('worldThumbs').querySelectorAll('button').forEach(b=>b.onclick=()=>{slide=+b.dataset.world;renderHome()});}
$('slidePrev').onclick=()=>{slide=(slide+7)%8;renderHome()};$('slideNext').onclick=()=>{slide=(slide+1)%8;renderHome()};
function goClassic(){window.location.href='campanha/index.html'}
function onNav(a){tone(370,.07);if(a==='mission'||a==='continue')startMission(a==='continue');else if(a==='beach'){startMission(false);loadBeach();}else if(a==='grove'){startMission(false);loadGrove()}else if(a==='temple'){startMission(false);loadTemple()}else if(a==='leviathan'){startMission(false);loadLeviathan()}else if(a==='prism'){startMission(false);loadPrism()}else if(a==='arena'){startMission(false);loadArena()}else if(a==='rescue'){startMission(false);loadRescue()}else if(a==='classic')goClassic();else if(a==='worlds'){slide=(slide+1)%8;renderHome();$('worldThumbs').scrollIntoView({block:'nearest',behavior:'smooth'})}else if(a==='heroes'||a==='outfits'){selectedHero=a==='outfits'?save.hero:0;selectedSkin=save.skin;isOutfits=a==='outfits';screen('collection')}else if(a==='options')screen('settings')}
document.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>onNav(b.dataset.target));$('slideAction').onclick=()=>{if(slide===3){goClassic();return}startMission(false);const loaders=[loadSchool,loadBeach,loadReef,null,loadGrove,loadTemple,loadLeviathan,loadRescue];loaders[slide]?.()};$('seeWorld').onclick=goClassic;$('settingsQuick').onclick=()=>screen('settings');
let isOutfits=false;
function renderCollection(){ $('collectionTitle').textContent=isOutfits?'ROUPAS E CAUDAS':'PERSONAGENS';$('selectedTitle').textContent=selectedHero===0?'SEREIA AZUL DAS MARÉS':'PERSONAGEM DO REINO';$('heroDisplay').textContent=heroes[selectedHero].toUpperCase();$('heroPower').textContent=powers[selectedHero];$('charGrid').innerHTML=heroes.map((h,i)=>`<button data-hero="${i}" class="${i===selectedHero?'selected':''}"><img src="${asset(`portrait-${h.toLowerCase()}.webp`)}" alt="${h}"/><b>${h}</b></button>`).join('');$('charGrid').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedHero=+b.dataset.hero;renderCollection()});$('outfitPalette').innerHTML=outfitNames.map((name,i)=>`<button class="${i===selectedSkin?'selected':''}" style="--tint:${tint[i]}" data-skin="${i}" title="${name}">${i+1}</button>`).join('');$('outfitPalette').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedSkin=+b.dataset.skin;renderCollection()});$('upperPreview').src=asset('lauana-sprite-upper-'+selectedSkin+'.webp');$('tailPreview').src=asset('lauana-sprite-tail-'+selectedSkin+'.webp');$('paperDoll').style.filter=`drop-shadow(0 0 23px ${tint[selectedSkin]}88) hue-rotate(${selectedHero*14}deg)`;}
$('saveLook').onclick=()=>{save.skin=selectedSkin;save.hero=selectedHero;persist();tone(600,.18);$('saveLook').textContent='✓ VISUAL EQUIPADO';setTimeout(()=>$('saveLook').textContent='EQUIPAR VISUAL',900)};
$('openOtherCollection').onclick=()=>{isOutfits=!isOutfits;renderCollection()};
function renderSettings(){ $('difficulty').value=save.difficulty;$('controlScheme').value=save.controls;$('volume').value=save.volume;$('particles').value=save.particles;}
for(const [el,key] of [['difficulty','difficulty'],['controlScheme','controls'],['volume','volume'],['particles','particles']])$(el).onchange=()=>{save[key]=$(el).value;persist();syncControls()};
$('fullscreenBtn').onclick=()=>document.documentElement.requestFullscreen?.().catch(()=>{});
$('exportSave').onclick=()=>{const blob=new Blob([JSON.stringify(save,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lauana_marés_vivas_progresso.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
$('importSave').onclick=()=>$('fileInput').click();$('fileInput').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());if(typeof obj.name!=='string'||typeof obj.pearls!=='number')throw Error();save={...save,...obj};persist();renderSettings();alert('Progresso importado com sucesso!')}catch{alert('Arquivo de progresso inválido')}};

// Gameplay — three designed acts, each with independent mechanics and camera behavior.
const difficultyStats={iniciante:{damage:.62,hp:6,boss:11},normal:{damage:1,hp:5,boss:17},dificil:{damage:1.3,hp:4,boss:21},profissional:{damage:1.6,hp:3,boss:26}};
let templeSeals=[],templePhase=0,prisms=[],prismCount=0,prismPulse=0,leviathanTail=[],templeHint='',groveOrder=0,groveLanterns=[],groveHitTimer=0,finalPhase=1,arenaWave=0,arenaScore=0,arenaCountdown=0,arenaClear=false,arenaQuiet=0,arenaWarning=0,mode='school',t=0,frame=0,run=false,paused=false,ended=false,cam=0,toastTTL=0,areaTimer=0,tideFront=0,tideWarning=false;
const p={x:135,y:450,vx:0,vy:0,face:1,health:5,maxHealth:5,shield:0,inv:0,dash:0,dashCD:0,attackCD:0,specialCD:0,assist:0,assistHit:0,grounded:true,anim:0,coyote:0,jumpBuffer:0,jumpHeld:false,combo:0,comboTimer:0,charged:0};
let schoolSigils=[],beachSigils=[],reefSigils=[],enemies=[],shots=[],enemyShots=[],particles=[],sparkles=[],platforms=[],boss=null,pearlsThis=0,checkpointX=135,schoolPortalOpen=false,beachPortalOpen=false,reefPortalOpen=false,invokations=0;
const keys=new Set(),control={x:0,y:0},pressed={left:false,right:false,up:false,down:false};let joyPointer=null;
function toast(s,sec=2.5){$('gameToast').textContent=s;$('gameToast').style.opacity=1;toastTTL=sec;}
function setHint(s){$('tip').textContent=s}
function resetP(x,y){p.x=x;p.y=y;p.vx=p.vy=0;p.face=1;p.inv=2;p.dash=0;p.dashCD=0;p.attackCD=0;p.specialCD=0;p.assist=0;p.shield=0;p.charged=0;p.grounded=false;p.coyote=0;p.jumpBuffer=0;p.jumpHeld=false;p.combo=0;p.comboTimer=0;p.health=p.maxHealth;}
function startMission(continuation=false){const d=difficultyStats[save.difficulty]||difficultyStats.normal;p.maxHealth=d.hp;pearlsThis=0;schoolPortalOpen=false;beachPortalOpen=false;reefPortalOpen=false;invokations=0;ended=false;paused=false;t=0;shots=[];enemyShots=[];particles=[];sparkles=[];screen('gameScreen');syncControls();$('endModal').classList.remove('open');$('pauseModal').classList.remove('open');loadSchool();run=true;tone(590,.14);if(continuation&&save.lastAct==='beach')loadBeach();if(continuation&&save.lastAct==='reef')loadReef();if(continuation&&save.lastAct==='boss')loadBoss();if(continuation&&save.lastAct==='grove')loadGrove();if(continuation&&save.lastAct==='temple')loadTemple();if(continuation&&save.lastAct==='leviathan')loadLeviathan();if(continuation&&save.lastAct==='prism')loadPrism();if(continuation&&save.lastAct==='rescue')loadRescue();if(continuation&&save.lastAct==='arena')loadArena()}
function makeE(x,y,kind,health=3){return{x,y,kind,health,maxHealth:health,phase:rand(0,6),shoot:rand(.4,2),hit:0,vx:0,vy:0,r:kind==='crab'?45:kind==='clockwork'?44:37}}
function loadSchool(){mode='school';areaTimer=0;cam=0;save.lastAct='school';persist();resetP(245,450);platforms=[{x:440,y:475,w:165},{x:830,y:436,w:145},{x:1120,y:488,w:180},{x:1410,y:436,w:150}];schoolSigils=[{x:630,y:362,taken:false},{x:1280,y:338,taken:false}];enemies=[makeE(905,452,'book',3),makeE(1200,452,'clockwork',4),makeE(1640,452,'book',4)];shots=[];enemyShots=[];sparkles=[];checkpointX=245;$('areaName').textContent='MONSTER HIGH';setHint('Encontre dois emblemas mágicos e alcance o portal');toast('ESCOLA • CORREDORES, ENIGMAS E SENTINELAS',3);$('bossBar').style.display='none'}
function loadBeach(){mode='beach';areaTimer=0;tideFront=-320;tideWarning=false;cam=0;save.lastAct='beach';persist();resetP(175,450);platforms=[{x:490,y:455,w:185},{x:895,y:421,w:175},{x:1330,y:465,w:180},{x:1800,y:414,w:210},{x:2225,y:442,w:180}];beachSigils=[{x:670,y:360,taken:false},{x:1470,y:343,taken:false},{x:2220,y:326,taken:false}];enemies=[makeE(850,475,'crab',4),makeE(1250,478,'crab',4),makeE(1940,473,'crab',5),makeE(2370,473,'crab',5)];shots=[];enemyShots=[];sparkles=[];checkpointX=175;$('areaName').textContent='SKULL SHORES';$('bossBar').style.display='none';setHint('Colete 3 conchas e chegue ao portal antes da maré!');toast('SKULL SHORES • A MARÉ NÃO ESPERA',3);tone(620,.22)}
function loadReef(){mode='reef';areaTimer=0;cam=0;save.lastAct='reef';persist();resetP(245,345);reefSigils=[{x:725,y:390,taken:false},{x:1595,y:178,taken:false},{x:2515,y:385,taken:false}];enemies=[makeE(500,270,'jelly',3),makeE(1090,360,'jelly',3),makeE(1830,250,'eel',4),makeE(2330,370,'jelly',4)];shots=[];enemyShots=[];sparkles=[];checkpointX=245;$('areaName').textContent='GREAT SCARRIER REEF';$('bossBar').style.display='none';setHint('Nade em qualquer direção e reúna os três cristais');toast('RECIFE • DESVIE DAS CORRENTES E DAS ÁGUAS-VIVAS',3);tone(400,.32)}
function loadBoss(){mode='boss';areaTimer=0;cam=0;save.lastAct='boss';persist();resetP(245,325);enemies=[];shots=[];enemyShots=[];sparkles=[];boss={x:970,y:305,hp:difficultyStats[save.difficulty].boss,max:difficultyStats[save.difficulty].boss,shoot:2.3,ring:4.8,open:3.2,phase:0,flash:0,dead:false,warning:0};$('areaName').textContent='CÂMARA DAS ÁGUAS-VIVAS';$('bossBar').style.display='block';$('bossName').textContent='RAINHA ÁGUA-VIVA';setHint('Desvie dos ataques e acerte o núcleo quando ele brilhar');toast('CHEFE • A RAINHA ÁGUA-VIVA',3);tone(180,.5,'sawtooth')}
function loadGrove(){mode='grove';areaTimer=0;groveOrder=0;groveHitTimer=0;cam=0;save.lastAct='grove';persist();resetP(170,450);platforms=[{x:350,y:472,w:170},{x:710,y:440,w:175},{x:1130,y:488,w:190},{x:1570,y:440,w:195}];groveLanterns=[{x:430,y:367,lit:false},{x:980,y:357,lit:false},{x:1560,y:351,lit:false}];enemies=[makeE(710,456,'bloom',4),makeE(1260,459,'bloom',5),makeE(1710,445,'bloom',4)];shots=[];enemyShots=[];sparkles=[];checkpointX=170;$('areaName').textContent='JARDIM DAS CONSTELAÇÕES';$('bossBar').style.display='none';setHint('Ative as três lanternas na ordem indicada: LUA → ESTRELA → SOL');toast('NOVA FASE • ENIGMA DAS CONSTELAÇÕES',3);tone(670,.25)}
function loadTemple(){mode='temple';areaTimer=0;cam=0;save.lastAct='temple';persist();resetP(170,315);templeSeals=[{x:640,y:240,lit:false},{x:1330,y:440,lit:false},{x:2050,y:210,lit:false}];templePhase=0;enemies=[makeE(840,380,'eel',4),makeE(1520,200,'jelly',5),makeE(2230,360,'eel',5)];shots=[];enemyShots=[];sparkles=[];checkpointX=170;$('areaName').textContent='TEMPLO DAS CORRENTES';$('bossBar').style.display='none';setHint('Desvende os três selos: aproxime-se, mire e use ATAQUE');toast('NOVO ATO · TRÊS SELOS, TRÊS CORRENTES',3);tone(430,.26)}

function loadPrism(){
 mode='prism';areaTimer=0;cam=0;save.lastAct='prism';persist();resetP(155,323);
 prisms=[{x:690,y:190,lit:false,phase:0},{x:1400,y:405,lit:false,phase:1.4},{x:2150,y:250,lit:false,phase:2.8}];prismCount=0;prismPulse=1.4;
 platforms=[];enemies=[makeE(1040,390,'eel',5),makeE(1680,230,'jelly',5)];shots=[];enemyShots=[];sparkles=[];checkpointX=155;
 $('areaName').textContent='GALERIA DOS PRISMAS';$('bossBar').style.display='none';
 setHint('Observe o brilho: atinja os três prismas apenas quando estiverem ABERTOS');
 toast('DESAFIO DE PRECISÃO • PRISMAS COM ESCUDOS TEMPORIZADOS',3);tone(770,.21);
}
function prismOpen(q){return (t+q.phase)%4.8<1.9}
function strikePrism(s){const q=prisms.find(q=>!q.lit&&Math.hypot(s.x-q.x,s.y-q.y)<70);if(!q)return false;
 if(prismOpen(q)){q.lit=true;prismCount++;checkpointX=q.x-100;burst(q.x,q.y,'#c5fff8',40);tone(650+prismCount*140,.22);toast('PRISMA ACESO • '+prismCount+'/3',2)}
 else {burst(q.x,q.y,'#f58bff',12);tone(195,.10,'square');toast('ESCUDO FECHADO • OBSERVE A JANELA AZUL',1.25)}
 return true;
}

// New skill-based arena: three encounters, timed wave transitions, a distinct end guardian.
function loadArena(){
 mode='arena';areaTimer=0;cam=0;save.lastAct='arena';persist();resetP(290,345);
 arenaWave=0;arenaScore=0;arenaCountdown=1.9;arenaClear=false;arenaQuiet=0;arenaWarning=0;
 enemies=[];shots=[];enemyShots=[];sparkles=[];platforms=[];boss=null;
 $('areaName').textContent='ARENA DA MARÉ SUPREMA';$('bossBar').style.display='none';
 setHint('Três ondas: esquive perfeitamente para reduzir a recarga do poder');
 toast('DESAFIO NOVO · SOBREVIVA ÀS TRÊS ONDAS',3);tone(720,.34);
}
function arenaSpawn(){
 arenaWave++;arenaCountdown=0;arenaQuiet=0;arenaWarning=0;
 if(arenaWave===1)enemies=[makeE(695,290,'eel',4),makeE(895,415,'jelly',4)];
 if(arenaWave===2)enemies=[makeE(520,250,'jelly',4),makeE(870,230,'eel',5),makeE(1060,430,'jelly',4)];
 if(arenaWave===3){
  enemies=[];let hp=difficultyStats[save.difficulty].boss+12;
  boss={x:935,y:328,hp,max:hp,shoot:2,ring:4,open:1.4,phase:0,flash:0,dead:false,warning:0,charge:0};
  $('bossBar').style.display='block';$('bossName').textContent='SENTINELA DAS CONCHAS';
 }
 toast(arenaWave===3?'ONDA FINAL • SENTINELA DAS CONCHAS':'ONDA '+arenaWave+'/3 • PREPARE A ESQUIVA',2.4);
 burst(900,300,arenaWave===3?'#ff9d63':'#72e8ff',30);
}
function arenaWin(){
 if(arenaClear)return;arenaClear=true;ended=true;run=false;
 const best=Math.max(save.arenaBest||0,arenaScore);save.arenaBest=best;
 const reward=save.arenaCleared?0:6;save.arenaCleared=true;
 save.pearls+=reward;save.lastAct='arena';persist();
 $('endReward').textContent=`PONTOS ${arenaScore} • RECORDE ${best} • +${reward} PÉROLAS`;
 $('endModal').classList.add('open');tone(850,.45);
}
function loadLeviathan(){mode='leviathan';areaTimer=0;cam=0;save.lastAct='leviathan';persist();resetP(200,305);enemies=[];shots=[];enemyShots=[];sparkles=[];let v=(difficultyStats[save.difficulty]||difficultyStats.normal).boss+9;boss={x:940,y:312,hp:v,max:v,shoot:2.4,ring:6,open:1.4,phase:0,flash:0,dead:false,warning:0,attack:'current',charge:0};$('areaName').textContent='CAVERNA DA SERPENTE';$('bossBar').style.display='block';$('bossName').textContent='LEVIATÃ DAS PROFUNDEZAS';setHint('A Serpente carrega em linha reta: desvie e ataque após a investida');toast('NOVO CHEFE · LEVIATÃ DAS PROFUNDEZAS',3);tone(150,.55,'sawtooth')}
function strikeTemple(s){const target=templeSeals.find(x=>!x.lit&&Math.hypot(s.x-x.x,s.y-x.y)<68);if(!target)return false;target.lit=true;templePhase++;checkpointX=target.x-100;burst(target.x,target.y,'#82f8ff',38);tone(590+templePhase*140,.21);toast('SELO ANCESTRAL ATIVADO · '+templePhase+'/3',2);return true}
function loadRescue(){mode='rescue';areaTimer=0;finalPhase=1;cam=0;save.lastAct='rescue';persist();resetP(160,450);platforms=[{x:420,y:448,w:175},{x:970,y:475,w:180}];enemies=[];shots=[];enemyShots=[];sparkles=[];boss={x:1130,y:330,hp:difficultyStats[save.difficulty].boss+11,max:difficultyStats[save.difficulty].boss+11,shoot:1.8,ring:3.8,open:2.4,phase:0,flash:0,dead:false,warning:0};$('areaName').textContent='ABISMO FINAL • JONATHAS';$('bossBar').style.display='block';$('bossName').textContent='GUARDIÃO DO ABISMO';setHint('Controle Jonathas e salve Lauana! Desvie, ataque e procure a abertura do escudo.');toast('ATO FINAL • SOMENTE JONATHAS',3);tone(170,.4,'sawtooth')}
function activateLantern(){let near=groveLanterns.findIndex(l=>Math.hypot(p.x-l.x,p.y-l.y)<150&&!l.lit);if(near===-1){toast('APROXIME-SE DE UMA LANTERNA APAGADA',1.8);return}const order=[0,2,1];if(near===order[groveOrder]){groveLanterns[near].lit=true;groveOrder++;burst(groveLanterns[near].x,groveLanterns[near].y,'#f9d6ff',34);tone(640+groveOrder*130,.27);toast('CONSTELAÇÃO ATIVADA • '+groveOrder+'/3',2)}else{groveLanterns.forEach(l=>l.lit=false);groveOrder=0;groveHitTimer=1;toast('ORDEM INCORRETA! LUA → ESTRELA → SOL',3);tone(180,.15,'sawtooth')}}
function hitPlayer(dmg=1){if(p.inv>0||p.assist>0||p.shield>0||ended)return;let m=difficultyStats[save.difficulty].damage;p.health-=dmg*m;p.inv=1.25;shake=15;tone(115,.2,'sawtooth');emit(p.x,p.y,'#ff73bb',18);if(p.health<=0){p.health=p.maxHealth;p.inv=3;enemyShots=[];p.x=(mode==='school'||mode==='beach'||mode==='grove'||mode==='rescue'||mode==='reef')?checkpointX:155;p.y=(mode==='school'||mode==='beach'||mode==='grove'||mode==='rescue')?450:310;p.vx=p.vy=0;toast('VOCÊ RETORNOU AO ÚLTIMO PONTO SEGURO',2.8)}}
let shake=0;
function burst(x,y,color='#4feaff',n=10){if(save.particles==='low')n=Math.floor(n/2);emit(x,y,color,n)}
function emit(x,y,color,n){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-190,190),vy:rand(-180,150),life:rand(.35,1),r:rand(1.5,5),color})}
function fire(){
 if(!run||paused||p.attackCD>0||ended)return;
 const hero=mode==='rescue'?1:save.hero;
 const heroStyles=['#58f0ff','#f2b1ff','#5ffff3','#ff71b5','#ebff68','#ffb98d','#ffde7b','#baf8ff','#bcbbff','#ba7eff'];
 const col=heroStyles[hero]||'#67edff';
 p.attackCD=hero===5?.14:hero===1?.32:.24;
 p.combo=p.comboTimer>0?(p.combo%3)+1:1;p.comboTimer=.85;
 tone(hero===4?740:470,.1,'triangle');
 let vx=p.face*720,vy=0;
 const candidates=[...enemies.filter(e=>e.health>0),...(['boss','rescue','leviathan','arena'].includes(mode)&&boss&&!boss.dead?[boss]:[])];
 let target=null,dist=820;
 for(const en of candidates){const dx=en.x-p.x,dy=en.y-p.y,d=Math.hypot(dx,dy);if(d<dist){dist=d;target={dx,dy,d}}}
 if(mode==='prism'){const q=prisms.find(q=>!q.lit&&Math.hypot(q.x-p.x,q.y-p.y)<460);if(q)target={dx:q.x-p.x,dy:q.y-p.y,d:Math.hypot(q.x-p.x,q.y-p.y)}}if(mode==='temple'){const seal=templeSeals.find(q=>!q.lit&&Math.hypot(q.x-p.x,q.y-p.y)<410);if(seal){target={dx:seal.x-p.x,dy:seal.y-p.y,d:Math.hypot(seal.x-p.x,seal.y-p.y)}}}if(target&&Math.abs(target.dy)<450){vx=target.dx/(target.d||1)*720;vy=target.dy/(target.d||1)*720}
 const base=Math.atan2(vy,vx);
 const multishot=hero===2||hero===3;const count=multishot?3:hero===5?2:1;
 for(let n=0;n<count;n++){
  const spread=(n-(count-1)/2)*(hero===3?.18:.16),ang=base+spread;
  shots.push({x:p.x+30*p.face,y:p.y-5,vx:Math.cos(ang)*750,vy:Math.sin(ang)*750,r:hero===1?14:hero===4?11:8,life:hero===4?2.1:1.45,damage:hero===1?1.5:p.combo===3?1.8:hero===5?.75:.85,color:col,pierce:hero===4?2:0});
 }
 if(hero===7){for(const e of enemies)if(e.health>0&&Math.hypot(e.x-p.x,e.y-p.y)<240)e.freeze=1.4}
 emit(p.x+25*p.face,p.y-5,p.combo===3?'#fff4b8':col,hero===1?15:8);
}
function dodge(){if(!run||paused||p.dashCD>0)return;p.dash=.23;p.dashCD=1.4;p.inv=Math.max(p.inv,.3);p.vx=(control.x||((keys.has('a')||keys.has('arrowleft'))?-1:1))*700;p.vy=((mode==='school'||mode==='beach'||mode==='grove'||mode==='rescue')?0:control.y*650);tone(730,.085);emit(p.x,p.y,'#95edff',14)}
function summon(){
 if(!run||paused||ended||p.specialCD>0||(['boss','rescue','leviathan','arena'].includes(mode)&&boss&&boss.dead))return;
 const h=mode==='rescue'?1:save.hero;
 const name=heroes[h];p.specialCD=h===0?24:18;invokations++;
 const close=enemies.filter(e=>e.health>0&&Math.hypot(e.x-p.x,e.y-p.y)<500);
 if(h===0){p.assist=5;p.assistHit=.1;p.shield=5;toast('JONATHAS · GUARDIÃO POR 5 SEGUNDOS',2.5)}
 else if(h===1){p.shield=5;p.assist=0;close.forEach(e=>{e.health-=3;e.hit=.3});toast('JONATHAS · ESCUDO E TRIDENTE',2.1)}
 else if(h===2){p.inv=3;p.dash=1;p.vx=p.face*720;p.vy=0;toast('LAGOONA · CORRENTEZA VELOZ',2)}
 else if(h===3){p.inv=2.5;for(let k=0;k<8;k++){let ang=k*twopi/8;shots.push({x:p.x,y:p.y,vx:Math.cos(ang)*390,vy:Math.sin(ang)*390,r:9,life:1.5,damage:1.3,color:'#ff77bc',pierce:0})}toast('DRACULAURA · ROSA DE MORCEGOS',2)}
 else if(h===4){close.forEach(e=>{e.health-=4;e.hit=.4;e.freeze=1.8});if(['boss','leviathan'].includes(mode))boss.open=2.7;toast('FRANKIE · TEMPESTADE ELÉTRICA',2)}
 else if(h===5){p.inv=3;p.vx=p.face*800;p.dash=.5;close.forEach(e=>{e.health-=2;e.hit=.25});toast('CLAWDEEN · FÚRIA DAS GARRAS',2)}
 else if(h===6){p.shield=5;close.forEach(e=>e.freeze=2);toast('CLEO · ESCUDO DOS OCEANOS',2)}
 else if(h===7){close.forEach(e=>{e.freeze=5;e.health-=1});if(boss&&(mode==='boss'||mode==='leviathan'||mode==='arena'))boss.open=2.9;toast('ABBEY · CONGELAMENTO PROFUNDO',2)}
 else if(h===8){p.inv=4;p.shield=4;toast('SPECTRA · FORMA FANTASMA',2)}
 else if(h===9){p.inv=2;close.forEach(e=>{e.freeze=3;e.health-=2});toast('TWYLA · SOMBRAS DO RECIFE',2)}
 tone(280,.32,'triangle');emit(p.x,p.y,h===0?'#42dfff':'#d58aff',42);
}
function interact(){if(!run||paused||ended)return;if(mode==='prism'){if(p.x>2440){if(prismCount===3)loadLeviathan();else toast('FALTAM PRISMAS ACESOS',2.1)}else toast('ATAQUE OS PRISMAS NO MOMENTO AZUL',1.8);return}if(mode==='grove'){if(p.x>1780){if(groveOrder===3)loadTemple();else toast('AINDA FALTAM LANTERNAS',2.1)}else activateLantern();return}if(mode==='temple'&&p.x>2420){if(templePhase===3)loadPrism();else toast('AINDA HÁ SELOS APAGADOS',2.2)}else if(mode==='school'&&p.x>1720){if(schoolSigils.every(s=>s.taken)){loadBeach()}else toast('ENCONTRE OS DOIS EMBLEMAS DA ESCOLA',2.3)}else if(mode==='beach'&&p.x>2530){if(beachSigils.every(s=>s.taken)){loadReef()}else toast('AINDA FALTAM CONCHAS DA PRAIA',2.3)}else if(mode==='reef'&&p.x>2820){if(reefSigils.every(s=>s.taken)){loadBoss()}else toast('AINDA FALTAM CRISTAIS DO RECIFE',2.3)}else{toast('EXPLORE E SIGA OS SINAIS LUMINOSOS',1.5)}}
const bound=()=>mode==='arena'?1480:mode==='school'?2200:mode==='beach'?2850:mode==='reef'?3210:mode==='grove'?2170:mode==='temple'?2650:mode==='prism'?2660:mode==='leviathan'?1580:mode==='rescue'?1700:1580;
function playerPosInput(){let x=control.x,y=control.y;if(keys.has('arrowleft')||keys.has('a'))x=-1;if(keys.has('arrowright')||keys.has('d'))x=1;if(keys.has('arrowup')||keys.has('w'))y=-1;if(keys.has('arrowdown')||keys.has('s'))y=1;if(pressed.left)x=-1;if(pressed.right)x=1;if(pressed.up)y=-1;if(pressed.down)y=1;return{x,y}}
function tick(dt){if(!run||paused||ended)return;t+=dt;areaTimer+=dt;p.anim+=dt;p.coyote=p.grounded?0.12:Math.max(0,p.coyote-dt);p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.comboTimer=Math.max(0,p.comboTimer-dt);p.inv=Math.max(0,p.inv-dt);p.dash=Math.max(0,p.dash-dt);p.dashCD=Math.max(0,p.dashCD-dt);p.attackCD=Math.max(0,p.attackCD-dt);p.specialCD=Math.max(0,p.specialCD-dt);p.assist=Math.max(0,p.assist-dt);p.shield=Math.max(0,p.shield-dt);if(shake>0)shake=Math.max(0,shake-dt*33);
const move=playerPosInput();if(p.dash<=0){if(mode==='school'||mode==='beach'||mode==='grove'||mode==='rescue'){let ax=clamp(move.x,-1,1)*1550;p.vx+=ax*dt;if(!move.x)p.vx*=Math.max(0,1-dt*14);p.vx=clamp(p.vx,-335,335);let wantJump=move.y<-.3||keys.has(' ')||keys.has('space');if(wantJump&&!p.jumpHeld)p.jumpBuffer=.16;p.jumpHeld=wantJump;if(p.jumpBuffer>0&&(p.grounded||p.coyote>0)){p.vy=-515;p.grounded=false;p.coyote=0;p.jumpBuffer=0;tone(550,.07);burst(p.x,p.y+85,'#e1a5ff',8)}if(!wantJump&&p.vy<-115)p.vy+=1250*dt;let prevFoot=p.y+95;p.vy+=940*dt;p.y+=p.vy*dt;p.grounded=false;const floor=553;if(p.y+95>=floor){p.y=floor-95;p.vy=0;p.grounded=true}if(p.vy>=0){for(const q of platforms){if(p.x>q.x-25&&p.x<q.x+q.w+25&&prevFoot<=q.y+8&&p.y+95>=q.y&&p.y+95<q.y+48){p.y=q.y-95;p.vy=0;p.grounded=true}}}p.x+=p.vx*dt;p.x=clamp(p.x,58,bound()-80)}else{const mul=mode==='boss'?305:mode==='arena'?350:330;const mag=Math.max(1,Math.hypot(move.x,move.y));const targetX=move.x/mag*mul,targetY=move.y/mag*mul;p.vx+=(targetX-p.vx)*Math.min(1,dt*10.8);p.vy+=(targetY-p.vy)*Math.min(1,dt*10.8);if(mode==='arena'){p.vx+=Math.sin(t*1.65+p.y/150)*32*dt;p.vy+=Math.cos(t*1.6+p.x/210)*31*dt}if(mode==='prism'){p.vx+=Math.sin(t*1.4+p.x/220)*42*dt;p.vy+=Math.cos(t*1.4+p.x/180)*38*dt}if(mode==='temple'){p.vx+=Math.sin(t*1.1+p.x/220)*52*dt;p.vy+=Math.cos(t*.8+p.x/280)*42*dt;}if(mode==='reef'&&p.x>1120&&p.x<1620){p.vy-=115*dt;p.vx+=Math.sin(t*2)*42*dt}if(mode==='reef'&&p.x>2150&&p.x<2510){p.vx+=65*dt;p.vy+=Math.sin(t*3)*40*dt};if(!move.x&&!move.y)p.vy+=Math.sin(t*1.3)*6*dt;p.x=clamp(p.x+p.vx*dt,52,bound()-85);p.y=clamp(p.y+p.vy*dt,122,535)}}else{p.x=clamp(p.x+p.vx*dt,45,bound()-70);if(mode!=='school')p.y=clamp(p.y+p.vy*dt,120,530)}if(move.x!==0)p.face=Math.sign(move.x);
if(mode==='grove'&&p.x>1020)checkpointX=1000;if(mode==='school'&&p.x>1030)checkpointX=1010;if(mode==='beach'&&p.x>1080)checkpointX=1050;if(mode==='beach'&&p.x>1930)checkpointX=1890;if(mode==='prism'&&p.x>1050)checkpointX=970;if(mode==='prism'&&p.x>1860)checkpointX=1770;if(mode==='temple'&&p.x>970)checkpointX=900;if(mode==='temple'&&p.x>1810)checkpointX=1780;if(mode==='reef'&&p.x>1460)checkpointX=1460;if(mode==='reef'&&p.x>2230)checkpointX=2190;
for(const s of (mode==='school'?schoolSigils:mode==='beach'?beachSigils:mode==='reef'?reefSigils:[])){if(!s.taken&&Math.hypot(p.x-s.x,p.y-s.y)<75){s.taken=true;pearlsThis+=2;save.pearls+=2;persist();burst(s.x,s.y,'#ff75eb',24);tone(820,.15);toast('✧ CRISTAL ENCONTRADO • +2 PÉROLAS',1.3)}}
for(const e of enemies){if(e.health<=0)continue;e.phase+=dt;e.charge=Math.max(0,(e.charge||0)-dt);e.freeze=Math.max(0,(e.freeze||0)-dt);e.hit=Math.max(0,e.hit-dt);if(e.freeze>0)continue;if(e.kind==='crab'){e.x+=Math.sin(e.phase*1.5)*31*dt;e.y=482+Math.sin(e.phase*3)*3;if(Math.abs(p.x-e.x)<275&&e.charge<=0){e.charge=2.1;e.vx=Math.sign(p.x-e.x)*265}if(e.charge>1.65)e.x+=e.vx*dt}else if(e.kind==='book'){e.x+=Math.sin(e.phase*.8)*20*dt;e.y=444+Math.sin(e.phase*2.2)*26}else if(e.kind==='clockwork'){e.x+=Math.sin(e.phase*1.2)*26*dt;e.y=452+Math.sin(e.phase*2)*9}else if(e.kind==='jelly'){e.y+=Math.sin(e.phase*1.2)*36*dt;e.x+=Math.cos(e.phase)*14*dt}else if(e.kind==='eel'){e.x+=Math.sin(e.phase*1.7)*62*dt;e.y+=Math.cos(e.phase)*22*dt}else if(e.kind==='bloom'){e.x+=Math.sin(e.phase*1.4)*46*dt;e.y=461+Math.sin(e.phase*3)*7}if(Math.hypot(p.x-e.x,p.y-e.y)<(e.r+53))hitPlayer(1);e.shoot-=dt;if(e.shoot<0&&(mode==='reef'||mode==='boss'||mode==='grove'||mode==='temple'||mode==='arena')){e.shoot=rand(2.4,4);let dx=p.x-e.x,dy=p.y-e.y,d=Math.max(1,Math.hypot(dx,dy));enemyShots.push({x:e.x,y:e.y,vx:dx/d*165,vy:dy/d*165,r:9,life:5,color:'#fe78d6'})}}
if(mode==='prism'&&p.inv<=0&&p.dash<=0){for(const q of prisms){if(q.lit)continue;const cy=(t+q.phase)%4.8;if(cy>3.1&&cy<3.6&&Math.abs(p.x-q.x-185)<35&&p.y>115&&p.y<520){hitPlayer(.55);break}}}groveHitTimer=Math.max(0,groveHitTimer-dt);if(mode==='beach'){tideFront=-320+areaTimer*65;let gap=p.x-tideFront;if(gap<460&&!tideWarning){tideWarning=true;toast('A MARÉ ESTÁ SE APROXIMANDO! CORRA!',2.5);tone(185,.3,'sawtooth')}if(gap<80&&gap>0&&p.y>390&&p.inv<=0){hitPlayer(.7);p.vx=Math.max(p.vx,280)}if(gap<-115&&p.y>390){p.x=Math.max(checkpointX,tideFront+180);p.inv=1.6;toast('A MARÉ TE ALCANÇOU! VOLTE À FRENTE!',2);}}
if(mode==='arena'){
 if(arenaCountdown>0){arenaCountdown-=dt;if(arenaCountdown<=0)arenaSpawn();}
 if(arenaWave>0&&arenaWave<3&&!enemies.some(e=>e.health>0)){
  arenaQuiet+=dt;
  if(arenaQuiet>.45&&arenaCountdown<=0){arenaScore+=Math.max(0,Math.floor(40-areaTimer*1.5));arenaCountdown=2.2;arenaQuiet=-100;toast('ONDA '+arenaWave+' CONCLUÍDA • PRÓXIMA EM 2s',2);}
 }
 if(arenaWave===3&&boss&&!boss.dead){
  boss.phase+=dt;boss.flash=Math.max(0,boss.flash-dt);boss.open-=dt;
  if(boss.open< -2.5)boss.open=1.9;
  boss.shoot-=dt;boss.ring-=dt;
  boss.y=315+Math.sin(t*1.7)*92;
  if(boss.shoot<=0){const n=boss.hp/boss.max<.45?7:4;
   for(let j=0;j<n;j++){let a=Math.atan2(p.y-boss.y,p.x-boss.x)+(j-(n-1)/2)*.17;
     enemyShots.push({x:boss.x-48,y:boss.y,vx:Math.cos(a)*235,vy:Math.sin(a)*235,r:9,life:5,color:'#ffad63'});
   } boss.shoot=boss.hp/boss.max<.45?1.25:1.9;burst(boss.x,boss.y,'#ffd7ae',12);
  }
  if(boss.ring<=0){arenaWarning=1.15;boss.ring=5.1;toast('MARÉ DE CHOQUE! FIQUE NO ALTO OU ESQUIVE',1.5);}
  if(arenaWarning>0){arenaWarning-=dt;if(arenaWarning<=0){
   // A horizontal tide wall rewards anticipation, swimming higher or dashing.
   enemyShots.push({x:1300,y:453,vx:-320,vy:0,r:58,life:5,color:'#ffb45e',wall:true});
   burst(1200,453,'#ffd3ab',24);
  }}
 }
}
if((mode==='boss'||mode==='rescue')&&boss&&!boss.dead){boss.phase+=dt;if(mode==='rescue'){boss.y=320+Math.sin(t*1.2)*43;boss.x=1120+Math.sin(t*.55)*180;}boss.warning=boss.ring<1.2?Math.max(0,boss.ring):0;boss.flash=Math.max(0,boss.flash-dt);boss.open-=dt;if(boss.open<-2.2)boss.open=2.7;boss.shoot-=dt;boss.ring-=dt;if(boss.shoot<=0){const volley=mode==='rescue'?(boss.hp/boss.max<.5?7:4):(boss.hp/boss.max<.45?5:3);for(let j=0;j<volley;j++){const ang=Math.atan2(p.y-boss.y,p.x-boss.x)+(j-(volley-1)/2)*.18;enemyShots.push({x:boss.x-50,y:boss.y+25,vx:Math.cos(ang)*rand(175,220),vy:Math.sin(ang)*rand(175,220),r:10,life:6,color:'#ff59ef'})}boss.shoot=mode==='rescue'?(boss.hp/boss.max<.5?1.2:1.85):(boss.hp/boss.max<.45?1.6:2.35);burst(boss.x,boss.y,'#f560f4',12)}if(boss.ring<=0){for(let k=0;k<12;k++){let a=k*twopi/12;enemyShots.push({x:boss.x,y:boss.y+20,vx:Math.cos(a)*(mode==='rescue'?225:185),vy:Math.sin(a)*(mode==='rescue'?225:185),r:8,life:6,color:mode==='rescue'?'#ffb05c':'#f8a9ff'})}boss.ring=5.6;toast('ANEL ELÉTRICO • ESQUIVE AGORA!',1.6)}}
if(mode==='leviathan'&&boss&&!boss.dead){
 boss.phase+=dt;boss.flash=Math.max(0,boss.flash-dt);boss.open=Math.max(-2,boss.open-dt);boss.shoot-=dt;boss.charge=Math.max(0,boss.charge-dt);
 const stage=boss.hp/boss.max<.45?2:1;
 if(boss.shoot<=0){boss.charge=1.2;boss.warning=1.2;boss.shoot=stage===2?2.6:3.6;toast('SERPENTE · INVESTIDA! SAIA DA LINHA ROSA',1.2)}
 if(boss.charge>0&&boss.charge<.7&&boss.warning>0){boss.warning=0;boss.x=clamp(boss.x-180,600,1030);boss.y=clamp(p.y,155,510);boss.open=1.8;burst(boss.x,boss.y,'#d25bff',24);shake=8;
  for(let k=0;k<(stage===2?9:6);k++){let a=k*twopi/(stage===2?9:6);enemyShots.push({x:boss.x,y:boss.y,vx:Math.cos(a)*195,vy:Math.sin(a)*195,r:9,life:4,color:'#e773ff'})}}
 if(boss.charge===0){boss.x+=(935-boss.x)*dt*.8;boss.y+=(310+Math.sin(t*1.4)*85-boss.y)*dt*1.7}
}
for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;let used=mode==='temple'?strikeTemple(s):mode==='prism'?strikePrism(s):false;for(const e of enemies){if(e.health>0&&!used&&Math.hypot(s.x-e.x,s.y-e.y)<e.r+12){e.health-=s.damage;e.hit=.17;used=s.pierce<=0;if(s.pierce>0)s.pierce--;burst(s.x,s.y,'#a9f7ff',8);if(e.health<=0){save.pearls+=1;persist();burst(e.x,e.y,'#ce79ff',20);tone(700,.16)}break}}if((mode==='boss'||mode==='rescue'||mode==='leviathan')&&!used&&boss&&!boss.dead&&Math.hypot(s.x-boss.x,s.y-boss.y)<110){used=true;let exposed=boss.open>0;if(exposed){boss.hp=Math.max(0,boss.hp-s.damage);boss.flash=.18;burst(s.x,s.y,'#ffffff',16);shake=9;tone(280,.11,'sawtooth')}else{burst(s.x,s.y,'#ac6cff',9);tone(150,.06)}}if(used||s.life<=0||s.x>bound()+100||s.x<-80)shots.splice(i,1)}
for(let i=enemyShots.length-1;i>=0;i--){const s=enemyShots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(Math.hypot(s.x-p.x,s.y-p.y)<(s.wall?88:40+s.r)){
 if(p.dash>0){s.life=-1;p.specialCD=Math.max(0,p.specialCD-2.2);arenaScore+=mode==='arena'?25:0;
  burst(p.x,p.y,'#89fff8',20);toast('ESQUIVA PERFEITA • PODER -2s',1);tone(820,.1);}
 else{hitPlayer(.7);s.life=-1;burst(s.x,s.y,'#fd74c8',6)}
}if(s.life<=0)enemyShots.splice(i,1)}
if(p.assist>0){p.assistHit-=dt;if(p.assistHit<=0){p.assistHit=.59;if((mode==='boss'||mode==='rescue'||mode==='leviathan')&&!boss.dead){boss.hp=Math.max(0,boss.hp-1.4);boss.flash=.2;burst(boss.x-50,boss.y,'#2afaff',11)}else{let nearest=enemies.filter(e=>e.health>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(nearest&&Math.hypot(nearest.x-p.x,nearest.y-p.y)<650){nearest.health-=2;nearest.hit=.2;burst(nearest.x,nearest.y,'#4ceaff',16)}}tone(220,.08,'triangle')}}
if(mode==='arena'&&arenaWave===3&&boss&&boss.hp<=0&&!boss.dead){boss.dead=true;arenaScore+=250;burst(boss.x,boss.y,'#ffe5a9',75);arenaWin();}
if((mode==='boss'||mode==='rescue'||mode==='leviathan')&&boss.hp<=0&&!boss.dead){boss.dead=true;burst(boss.x,boss.y,'#e8a9ff',75);tone(720,.7);if(mode==='boss'){toast('RAINHA ÁGUA-VIVA DERROTADA • NOVO PORTAL!',3);loadGrove()}else if(mode==='leviathan'){toast('LEVIATÃ DERROTADO • ABISMO FINAL ABERTO!',3);loadRescue()}else{ended=true;run=false;save.done=true;save.lastAct='school';save.pearls+=16;persist();$('endReward').textContent=`+16 PÉROLAS • JONATHAS SALVOU LAUANA`;setTimeout(()=>$('endModal').classList.add('open'),900)}}
if(mode==='prism'&&p.x>2390&&prismCount===3&&Math.floor(t*2)%9===0)toast('PASSAGEM ABERTA • PRESSIONE USAR',1.7);if(mode==='temple'&&p.x>2430&&templePhase===3&&Math.floor(t*2)%7===0){toast('OS TRÊS SELOS ESTÃO ATIVOS! PRESSIONE USAR',1.4)}if(mode==='school'&&p.x>1845&&!schoolPortalOpen){schoolPortalOpen=true;toast('PORTAL ENCONTRADO! APERTE USAR',2.6)}
if(mode==='beach'&&p.x>2580&&!beachPortalOpen){beachPortalOpen=true;toast('PORTAL DO RECIFE! APERTE USAR',2.7)}if(mode==='reef'&&p.x>2900&&!reefPortalOpen){reefPortalOpen=true;toast('PORTAL DO CHEFE! APERTE USAR',2.7)}
if(toastTTL>0){toastTTL-=dt;if(toastTTL<=0)$('gameToast').style.opacity=0}
for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=1-dt*.7;q.vy*=1-dt*.6;q.life-=dt;if(q.life<=0)particles.splice(i,1)}
cam+=(clamp(p.x-W*.32,0,bound()-W)-cam)*Math.min(1,dt*4.7);
updateHud();}
function updateHud(){let h=Math.max(0,Math.ceil(p.health));$('hearts').textContent=('♥ ').repeat(h)+('♡ ').repeat(Math.max(0,p.maxHealth-h));$('hudHero').textContent=mode==='rescue'?'JONATHAS':mode==='boss'?'LAUANA':heroes[save.hero].toUpperCase();$('hudPearls').textContent=`◈ ${save.pearls}`;if(mode==='beach'){$('objective').textContent='CONCHAS · FUJA DA MARÉ';$('hudSigils').textContent='◉ '+beachSigils.filter(s=>s.taken).length+'/3  •  MARÉ '+Math.max(0,Math.ceil((p.x-tideFront)/65))+'s'}if(mode==='school'){$('objective').textContent=schoolSigils.filter(s=>s.taken).length+'/2 EMBLEMAS · PORTAL';$('hudSigils').textContent='✧ '+schoolSigils.filter(s=>s.taken).length+'/2'}if(mode==='reef'){$('objective').textContent='REÚNA CRISTAIS · PORTAL';$('hudSigils').textContent='✧ '+reefSigils.filter(s=>s.taken).length+'/3'}if(mode==='arena'){$('objective').textContent=arenaWave===3?'VENÇA A SENTINELA DAS CONCHAS':`SOBREVIVA À ONDA ${Math.max(1,arenaWave)}/3`;$('hudSigils').textContent=`★ ${arenaScore} PTS` ;if(arenaWave===3&&boss)$('bossFill').style.width=Math.max(0,boss.hp/boss.max*100)+'%';}
if(mode==='prism'){$('objective').textContent='ACERTE PRISMAS NA JANELA AZUL';$('hudSigils').textContent='◈ '+prismCount+'/3'}if(mode==='temple'){$('objective').textContent='ATIVE OS TRÊS SELOS COM ATAQUES';$('hudSigils').textContent='♧ '+templePhase+'/3'}if(mode==='leviathan'){$('objective').textContent='DESVIE DA INVESTIDA E CONTRA-ATAQUE';$('hudSigils').textContent='⚡ SERPENTE';$('bossFill').style.width=Math.max(0,boss.hp/boss.max*100)+'%'}if(mode==='grove'){$('objective').textContent='ENIGMA DAS CONSTELAÇÕES';$('hudSigils').textContent='✦ '+groveOrder+'/3'}if(mode==='rescue'){$('objective').textContent='JONATHAS • RESGATE DA LAUANA';$('hudSigils').textContent=p.assist>0?'◈ '+Math.ceil(p.assist)+'s':'⚡ ESCUDO';$('bossFill').style.width=Math.max(0,boss.hp/boss.max*100)+'%'}if(mode==='boss'){$('objective').textContent='CHEFE FINAL · NÚCLEO VULNERÁVEL';$('hudSigils').textContent=p.assist>0?'♛ '+Math.ceil(p.assist)+'s':p.specialCD<=0?'♛ PRONTO':'♛ '+Math.ceil(p.specialCD)+'s';$('bossFill').style.width=Math.max(0,boss.hp/boss.max*100)+'%'}$('hudHero').textContent=mode==='rescue'?'JONATHAS':heroes[save.hero].toUpperCase();const hudPortrait=document.querySelector('.hudPlayer img');if(hudPortrait)hudPortrait.src=asset('portrait-'+(mode==='rescue'?'jonathas':heroes[save.hero].toLowerCase())+'.webp');$('specialBtn').querySelector('small').textContent=save.hero===0?'JONATHAS':'PODER';$('specialBtn').style.opacity=p.specialCD>0?.45:1;$('dashBtn').style.opacity=p.dashCD>0?.5:1;$('dashBtn').querySelector('small').textContent=p.dashCD>0?Math.ceil(p.dashCD)+'s':'ESQUIVA';$('specialBtn').querySelector('small').textContent=p.specialCD>0?Math.ceil(p.specialCD)+'s':save.hero===0?'JONATHAS':'PODER';$('specialBtn').setAttribute('aria-label',p.assist>0?'Jonathas protegendo por '+Math.ceil(p.assist)+' segundos':p.specialCD>0?'Poder recarrega em '+Math.ceil(p.specialCD)+' segundos':'Invocar Jonathas')}
function pauseGame(){if(!run||ended)return;paused=true;$('pauseModal').classList.add('open')}
$('pauseBtn').onclick=pauseGame;$('resumeBtn').onclick=()=>{paused=false;$('pauseModal').classList.remove('open')};$('restartBtn').onclick=()=>{paused=false;$('pauseModal').classList.remove('open');if(mode==='school')loadSchool();if(mode==='beach')loadBeach();if(mode==='reef')loadReef();if(mode==='boss')loadBoss();if(mode==='grove')loadGrove();if(mode==='rescue')loadRescue();if(mode==='temple')loadTemple();if(mode==='leviathan')loadLeviathan();if(mode==='prism')loadPrism();if(mode==='arena')loadArena()};$('leaveBtn').onclick=()=>{run=false;paused=false;$('pauseModal').classList.remove('open');save.lastAct=mode;persist();screen('home')};$('endBack').onclick=()=>{run=false;ended=false;$('endModal').classList.remove('open');screen('home')};$('endAgain').onclick=()=>startMission(false);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown',' ','space','shift'].includes(k))e.preventDefault();if(keys.has(k))return;keys.add(k);if(current!=='gameScreen'||paused)return;if(k==='j'||k==='f')fire();if(k==='k'||k==='r')summon();if(k==='shift'||k==='l')dodge();if(k==='e'||k==='enter')interact();if(k==='escape')pauseGame()},{passive:false});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function syncControls(){let dir=save.controls==='arrows';$('joystick').style.display=dir?'none':'';$('dpad').style.display=dir?'block':'none'}
for(let b of document.querySelectorAll('[data-hold]')){const key=b.dataset.hold;const release=()=>pressed[key]=false;b.addEventListener('pointerdown',e=>{e.preventDefault();pressed[key]=true;b.setPointerCapture(e.pointerId)});b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release)}
const stick=$('stick');const joy=$('joystick');function joyMove(e){const b=joy.getBoundingClientRect();const cx=b.left+b.width/2,cy=b.top+b.height/2,dx=e.clientX-cx,dy=e.clientY-cy,d=Math.max(1,Math.hypot(dx,dy)),radius=b.width*.33;control.x=clamp(dx/radius,-1,1);control.y=clamp(dy/radius,-1,1);if(d>radius){control.x=dx/d;control.y=dy/d}stick.style.transform=`translate(${control.x*radius}px,${control.y*radius}px)`}joy.addEventListener('pointerdown',e=>{e.preventDefault();joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);joyMove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)joyMove(e)});function resetJoy(){joyPointer=null;control.x=control.y=0;stick.style.transform='translate(0,0)'}joy.addEventListener('pointerup',resetJoy);joy.addEventListener('pointercancel',resetJoy);joy.addEventListener('lostpointercapture',resetJoy);
for(let [id,fn] of [['attackBtn',fire],['dashBtn',dodge],['specialBtn',summon],['interactBtn',interact]])$(id).addEventListener('pointerdown',e=>{e.preventDefault();fn()});
window.addEventListener('blur',()=>{if(current==='gameScreen'&&run&&!ended)pauseGame()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&current==='gameScreen'&&run&&!ended)pauseGame()});

// Illustration engine: detailed layered art is distinct from physics/entities; no screenshot hot-spots.
const scenery=[];function seedRand(n){let s=n|0;return()=>{s=(s*1664525+1013904223)|0;return(s>>>0)/4294967296}};
for(let w=0;w<8;w++){const r=seedRand(900+w);const elems=[];for(let i=0;i<95;i++){elems.push({x:r()*3400,y:440+r()*270,size:13+r()*58,color:r()>.5?'#f14ef2':'#27a8ff',kind:r()>.65?'coral':'grass',depth:r()})}scenery.push(elems)}
function fillBg(imgKey,camera=0,scale=1){const im=images[imgKey];if(!im||!im.complete||!im.naturalWidth){c.fillStyle='#081b4e';c.fillRect(0,0,W,H);return}let sw=im.width*scale,sh=im.height*scale;const h=760*scale;const w=h*im.width/im.height;let off=-(camera*.07)%w;if(off>0)off-=w;for(let x=off-w;x<W+w;x+=w){c.globalAlpha=.94;c.drawImage(im,x,-44,w,h)}c.globalAlpha=1}
function glow(x,y,r,color,a=.45){let gr=c.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,color);gr.addColorStop(1,'transparent');c.save();c.globalAlpha=a;c.fillStyle=gr;c.beginPath();c.arc(x,y,r,0,twopi);c.fill();c.restore()}
function starDots(offset,water){let num=save.particles==='low'?28:75;for(let i=0;i<num;i++){let x=((i*193.23+Math.sin(i)*750-offset*.14)%W+W)%W,y=((i*127.11+Math.cos(i)*300)%H+H)%H;let a=.12+.35*(.5+.5*Math.sin(t*2+i));c.fillStyle=`rgba(${water?'87,220,255':'229,169,255'},${a})`;c.beginPath();c.arc(x,y,i%5===0?2.6:1.1,0,twopi);c.fill()}}
function paintBg(){
 const beach=mode==='beach',school=mode==='school',reef=mode==='reef'||mode==='temple'||mode==='prism'||mode==='leviathan',grove=mode==='grove',bossroom=mode==='boss'||mode==='rescue';
 const scene=mode==='arena'?'arena-conchas.webp':school?'school-hall-renascida.webp':beach?'beach-cove-renascida.webp':grove?'realm-floresta.webp':mode==='temple'?'templo-aurora.webp':mode==='prism'?'palacio-prismas-eclipse.webp':mode==='leviathan'?'caverna-serpente.webp':reef?'realm-recife.webp':'realm-abismo.webp';
 fillBg(scene,cam*.37,1);
 // Calm, readable lighting with animated beams and subtle depth; moving sprites remain separate objects.
 c.fillStyle=school?'#050a290b':beach?'#24153412':grove?'#0b351a26':'#021a3b23';c.fillRect(0,0,W,H);
 if(school||grove||mode==='rescue'){
   const floor=c.createLinearGradient(0,550,0,H);floor.addColorStop(0,grove?'#2ab39170':'#ac71d150');floor.addColorStop(.35,grove?'#1b64476b':'#37205263');floor.addColorStop(1,'#0c1035b8');c.fillStyle=floor;c.fillRect(0,553,W,H-553);
   for(let i=0;i<12;i++){const x=((i*212-cam*.88)%2600+2600)%2600;if(x>W+180)continue;
      c.strokeStyle='#da9aff44';c.lineWidth=2;c.beginPath();c.moveTo(x,562);c.lineTo(x-65,647);c.stroke();}
   for(const q of platforms){const x=q.x-cam;if(x<-q.w||x>W)continue;
      let grad=c.createLinearGradient(0,q.y,0,q.y+35);grad.addColorStop(0,'#c99aed');grad.addColorStop(.28,'#6d4e9f');grad.addColorStop(1,'#1b1c47');c.fillStyle=grad;c.fillRect(x,q.y,q.w,25);c.strokeStyle='#ebc3ff88';c.strokeRect(x,q.y,q.w,23);
      for(let j=0;j<q.w/36;j++){c.fillStyle='#8ad8ff44';c.fillRect(x+9+j*36,q.y+7,21,3)}
   }
 }else if(beach){
    const floor=c.createLinearGradient(0,550,0,H);floor.addColorStop(0,'#ffe4bbcf');floor.addColorStop(.28,'#b779a9cc');floor.addColorStop(1,'#34234ccf');c.fillStyle=floor;c.fillRect(0,555,W,H-555);
    for(const q of platforms){const x=q.x-cam;if(x<-q.w||x>W)continue;
       c.fillStyle='#28203c';c.beginPath();c.moveTo(x-22,q.y+14);c.lineTo(x+q.w+18,q.y+14);c.lineTo(x+q.w-17,q.y+48);c.lineTo(x+34,q.y+40);c.closePath();c.fill();
       c.strokeStyle='#b46e9f';c.lineWidth=5;c.stroke();c.fillStyle='#ffbfa8';c.beginPath();c.ellipse(x+q.w/2,q.y+9,q.w/2+11,12,0,Math.PI,Math.PI*2);c.fill();
       for(let j=0;j<q.w/21;j++){let xx=x+j*22+8;glow(xx,q.y-2,23,'#ffddd2',.12)}
    }
    const waveX=tideFront-cam;
    if(waveX>-210){const w=Math.max(0,waveX+190);let g=c.createLinearGradient(Math.max(0,w-240),0,w,0);g.addColorStop(0,'#42ebff3a');g.addColorStop(.7,'#48e8ff7a');g.addColorStop(1,'#e8ffffef');c.fillStyle=g;c.fillRect(0,484,w,H-484);
       for(let i=0;i<18;i++){let x=waveX-20-i*43,y=518+Math.sin(t*3+i*.9)*19;glow(x,y,28,'#ffffff',.38)}}
 }else{
   // Underwater foreground uses live light shafts and parallax coral; no static gameplay screenshots.
   for(let i=0;i<11;i++){let x=((i*202-cam*.18)%W+W)%W;c.save();c.translate(x,-70);c.rotate(.17+Math.sin(t*.2+i)*.035);let g=c.createLinearGradient(0,0,100,0);g.addColorStop(0,'#9ffbff00');g.addColorStop(.5,'#ccf6ff20');g.addColorStop(1,'#c0ebff00');c.fillStyle=g;c.fillRect(-55,0,120,H+120);c.restore()}
   for(let j=0;j<70;j++){const x=((j*171.31-cam*(j%4===0?.85:.22)+t*(j%4+1)*3)%W+W)%W,y=((j*73.15-t*(j%6+1)*11)%H+H)%H,r=2+(j%5)*.9;
     c.beginPath();c.arc(x,y,r,0,twopi);c.strokeStyle='#ccf9ff';c.lineWidth=1.4;c.globalAlpha=.12+(j%5)*.1;c.stroke()}
   c.globalAlpha=1;
   const art=scenery[reef?(mode==='temple'?5:mode==='leviathan'?7:2):7];for(const q of art){let x=q.x-cam*(q.depth>.5?.64:1.15),y=q.y;if(x<-90||x>W+90)continue;drawCoral(x,y,q.size,q.color,q.kind)}
   if(bossroom||mode==='leviathan'){glow(860,275,360,'#db4bff',.23);for(let k=0;k<7;k++){let xx=k*190+60;glow(xx,565,65,'#cc5afc',.12)}}
 }
 starDots(cam,!(beach||school));
}
function drawPalm(x,y,scale){c.save();c.translate(x,y);c.scale(scale,scale);c.strokeStyle='#372041';c.lineWidth=15;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-17,-90,28,-152,7,-220);c.stroke();c.translate(7,-223);for(let k=0;k<7;k++){let a=-3.2+k*.85+Math.sin(t*.8+k)*.04;c.save();c.rotate(a);c.fillStyle=k%2?'#194863':'#1f6b70';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(32,-28,112,20);c.quadraticCurveTo(43,-11,0,0);c.fill();c.restore()}c.restore()}
function drawCoral(x,y,s,color,kind){c.save();c.translate(x,y);c.globalAlpha=.45;if(kind==='coral'){c.strokeStyle=color;c.lineCap='round';c.lineWidth=s*.12;for(let j=-2;j<=2;j++){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(j*s*.31,-s*.55,j*s*.22,-s*(.75+Math.abs(j%2)*.16));c.stroke();c.beginPath();c.arc(j*s*.22,-s*(.75+Math.abs(j%2)*.16),s*.1,0,twopi);c.fillStyle=color;c.fill()}}else{c.strokeStyle=color;c.lineWidth=2;for(let j=0;j<6;j++){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo((j-2)*s*.25,-s*.4,(j-2)*s*.16,-s*.7);c.stroke()}}c.restore()}
function drawSigils(){const list=mode==='school'?schoolSigils:mode==='beach'?beachSigils:mode==='reef'?reefSigils:[];for(let q of list){if(q.taken)continue;let x=q.x-cam,y=q.y+Math.sin(t*3+q.x)*6;if(x<-70||x>W+70)continue;glow(x,y,65,'#fd58e8',.34);c.save();c.translate(x,y);c.rotate(t*.8);c.strokeStyle='#83eaff';c.lineWidth=3;c.shadowColor='#55dcff';c.shadowBlur=13;c.beginPath();c.moveTo(0,-19);c.lineTo(17,0);c.lineTo(0,20);c.lineTo(-17,0);c.closePath();c.stroke();c.restore()}}
function drawPortal(){if(mode==='boss'||mode==='rescue'||mode==='leviathan')return;let px=mode==='school'?1950:mode==='beach'?2680:mode==='grove'?1940:mode==='temple'?2510:2990,unlocked=mode==='school'?schoolSigils.every(s=>s.taken):mode==='beach'?beachSigils.every(s=>s.taken):mode==='grove'?groveOrder===3:mode==='temple'?templePhase===3:reefSigils.every(s=>s.taken),x=px-cam,y=(mode==='school'||mode==='beach'||mode==='grove'||mode==='rescue')?388:322;if(x<-160||x>W+160)return;glow(x,y,132,unlocked?'#43eaff':'#ab58e7',.3);c.save();c.translate(x,y);c.lineWidth=9;c.strokeStyle=unlocked?'#43eaff':'#b65ee2';c.shadowColor=unlocked?'#49dcff':'#cf53eb';c.shadowBlur=24;c.beginPath();c.ellipse(0,0,64,113,0,0,twopi);c.stroke();for(let j=0;j<3;j++){c.beginPath();c.ellipse(0,0,54-j*12,98-j*20,0,0,twopi);c.strokeStyle=unlocked?`rgba(104,243,255,${.16+j*.08})`:`rgba(229,86,235,${.1+j*.08})`;c.stroke()}c.fillStyle='white';c.font='bold 15px system-ui';c.textAlign='center';c.fillText(unlocked?'PORTAL ABERTO':'PORTAL SELADO',0,-125);c.restore()}
function drawJelly(e,queen=false){
 let x=e.x-cam,y=e.y+Math.sin(t*2.3+e.phase)*8;if(x< -250||x>W+250)return;
 c.save();c.translate(x,y);const sc=queen?2.25:1;c.scale(sc,sc);
 glow(0,-12,queen?150:105,queen?'#f52cdb':'#4cb8ff',queen?.33:.26);
 const hit=e.hit>0;
 // Individual translucent tendrils, offset in time, radiate below the bell.
 for(let j=0;j<11;j++){
   let xx=-65+j*13;let d=Math.sin(t*2.6+j*1.15)*16;
   c.beginPath();c.moveTo(xx,14);c.bezierCurveTo(xx+d*.55,45,xx-d*.6,61,xx+d*.75,87+((j*13)%29));
   c.strokeStyle=(j%3===0?'#84fdff':j%3===1?'#ff8ff4':'#8f7aff');
   c.lineWidth=j%3===0?2.4:3.9;c.lineCap='round';c.shadowColor=c.strokeStyle;c.shadowBlur=13;c.globalAlpha=.88;c.stroke();c.globalAlpha=1;
   c.beginPath();c.arc(xx+d*.75,86+((j*13)%29),2.4,0,twopi);c.fillStyle='#e8b3ff';c.fill();
 }
 c.shadowBlur=0;
 // The luminous mantle, with an organic scalloped rim and semi-transparent interior.
 c.beginPath();c.moveTo(-75,12);c.bezierCurveTo(-89,-18,-67,-78,-28,-82);c.bezierCurveTo(7,-102,59,-75,73,-32);c.quadraticCurveTo(82,-9,74,11);
 for(let j=7;j>=0;j--){let xx=-75+j*21.4;c.quadraticCurveTo(xx+10,20+Math.sin(t*3+j)*4,xx,12)}c.closePath();
 const shell=c.createRadialGradient(-19,-55,2,1,-16,101);
 shell.addColorStop(0,hit?'#ffffff':'#e7faff');shell.addColorStop(.19,hit?'#ffb1ff':'#88e9ff');shell.addColorStop(.39,'#c073f9');shell.addColorStop(.63,'#d329e3');shell.addColorStop(1,'#4b1b8c');
 c.globalAlpha=.92;c.fillStyle=shell;c.shadowColor='#ed73fc';c.shadowBlur=22;c.fill();c.strokeStyle='#a6ecff';c.lineWidth=3.2;c.stroke();c.shadowBlur=0;c.globalAlpha=1;
 // Veins and luminous spots inside the translucent bell.
 for(let j=-3;j<=3;j++){
   let xx=j*19;c.beginPath();c.moveTo(xx*.44,-63+Math.abs(j)*3);c.bezierCurveTo(xx-7,-42,xx+8,-13,xx,8);
   c.lineWidth=1.7;c.strokeStyle=j%2?'#afeaffc9':'#faacffc9';c.stroke();
 }
 for(let k=0;k<10;k++){
   const xx=Math.sin(k*12.73)*57, yy=-20-Math.abs(Math.cos(k*3.5))*45;
   c.fillStyle=k%2?'#b9f9ff':'#fff2ff';c.globalAlpha=.52+.45*Math.sin(t*3+k)**2;c.beginPath();c.arc(xx,yy,2+(k%3)*.8,0,twopi);c.fill();
 }c.globalAlpha=1;
 c.beginPath();c.ellipse(-28,-64,21,7,-.3,0,twopi);c.fillStyle='#ffffff62';c.fill();
 if(queen){c.strokeStyle='#f9a4ff';c.lineWidth=3;c.beginPath();c.moveTo(-55,-80);c.lineTo(-62,-114);c.lineTo(-19,-89);c.lineTo(0,-133);c.lineTo(22,-93);c.lineTo(54,-117);c.lineTo(52,-75);c.stroke()}
 c.restore();
}
function drawBook(e){let x=e.x-cam,y=e.y+Math.sin(t*2+e.phase)*9;if(x< -70||x>W+70)return;glow(x,y,55,'#fa62f4',.22);c.save();c.translate(x,y);c.rotate(Math.sin(t*2+e.phase)*.12);c.fillStyle=e.hit>0?'#ffffff':'#7339c6';c.strokeStyle='#f2b7ff';c.lineWidth=3;c.beginPath();c.moveTo(-35,-29);c.lineTo(-3,-20);c.lineTo(0,26);c.lineTo(-35,17);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(2,-20);c.lineTo(35,-29);c.lineTo(35,17);c.lineTo(0,26);c.closePath();c.fill();c.stroke();c.fillStyle='#ffc0ef';c.fillRect(-8,-1,16,7);c.restore()}
function drawEel(e){let x=e.x-cam,y=e.y;if(x<-140||x>W+140)return;c.save();c.translate(x,y);c.strokeStyle=e.hit?'white':'#53e1ce';c.lineWidth=29;c.lineCap='round';c.shadowColor='#3eecff';c.shadowBlur=14;c.beginPath();for(let j=0;j<=6;j++){let px=(j-3)*22,py=Math.sin(t*5-j*.7)*24;j===0?c.moveTo(px,py):c.lineTo(px,py)}c.stroke();c.fillStyle='#ff4acb';c.beginPath();c.arc(67,0,8,0,twopi);c.fill();c.restore()}
function drawCrab(e){let x=e.x-cam,y=e.y+Math.sin(t*7+e.phase)*2;if(x<-90||x>W+90)return;c.save();c.translate(x,y);glow(0,10,60,'#ff8972',.16);c.lineCap='round';c.strokeStyle='#e76178';c.lineWidth=8;for(let a=0;a<3;a++){let side=a%2?1:-1;c.beginPath();c.moveTo(side*20,-2+a*5);c.lineTo(side*(50+a*4),18+a*6);c.stroke()}for(let side of [-1,1]){c.save();c.translate(side*26,-12);c.rotate(side*(Math.sin(t*3+e.phase)*.16));c.strokeStyle='#f9938e';c.lineWidth=12;c.beginPath();c.moveTo(0,0);c.lineTo(side*29,-25);c.stroke();c.fillStyle=e.hit?'white':'#f36981';c.beginPath();c.moveTo(side*29,-25);c.lineTo(side*53,-32);c.lineTo(side*45,-9);c.lineTo(side*29,-16);c.closePath();c.fill();c.restore()}let shell=c.createLinearGradient(0,-25,0,23);shell.addColorStop(0,e.hit?'white':'#ffbd9f');shell.addColorStop(1,'#c32979');c.fillStyle=shell;c.beginPath();c.ellipse(0,0,38,27,0,0,twopi);c.fill();c.strokeStyle='#ffddd5';c.lineWidth=2;c.stroke();for(let eye of [-13,13]){c.strokeStyle='#f2c3c2';c.lineWidth=4;c.beginPath();c.moveTo(eye,-19);c.lineTo(eye,-35);c.stroke();c.fillStyle='#171337';c.beginPath();c.arc(eye,-36,5,0,twopi);c.fill()}c.restore()}
function drawClockwork(e){let x=e.x-cam,y=e.y+Math.sin(t*4+e.phase)*4;if(x<-80||x>W+80)return;
 c.save();c.translate(x,y);c.rotate(Math.sin(e.phase)*.08);glow(0,0,75,'#6beaff',.31);
 c.strokeStyle='#8fdcff';c.lineWidth=6;for(let j=0;j<8;j++){let a=j*twopi/8;c.beginPath();c.moveTo(Math.cos(a)*27,Math.sin(a)*27);c.lineTo(Math.cos(a)*39,Math.sin(a)*39);c.stroke()}
 c.beginPath();c.arc(0,0,32,0,twopi);let g=c.createRadialGradient(-12,-16,1,0,0,39);g.addColorStop(0,e.hit?'#fff':'#dcfaff');g.addColorStop(.36,'#5dc7ee');g.addColorStop(1,'#333576');c.fillStyle=g;c.fill();c.strokeStyle='#bd8aff';c.lineWidth=6;c.stroke();
 c.save();c.rotate(t*1.6);c.strokeStyle='#ebdbff';c.lineWidth=3;c.beginPath();for(let j=0;j<12;j++){let a=j*twopi/12;c.moveTo(Math.cos(a)*23,Math.sin(a)*23);c.lineTo(Math.cos(a)*26,Math.sin(a)*26)}c.stroke();c.restore();
 c.fillStyle='#ff9fe4';c.beginPath();c.ellipse(0,1,12,7,0,0,twopi);c.fill();c.restore()}
function drawBloom(e){let x=e.x-cam,y=e.y;if(x<-80||x>W+80)return;c.save();c.translate(x,y);c.rotate(Math.sin(t*2+e.phase)*.08);glow(0,0,65,'#e9a4ff',.35);for(let k=0;k<8;k++){c.rotate(twopi/8);c.fillStyle=e.hit?'#fff':'#9549b6';c.beginPath();c.ellipse(0,-27,11,23,0,0,twopi);c.fill()}c.fillStyle='#ffdc86';c.beginPath();c.arc(0,0,13,0,twopi);c.fill();c.fillStyle='#321b56';c.fillRect(-7,-3,4,5);c.fillRect(3,-3,4,5);c.restore()}
function drawLanterns(){if(mode!=='grove')return;const icons=['☾','☼','★'];for(let i=0;i<groveLanterns.length;i++){const l=groveLanterns[i];let x=l.x-cam;if(x<-130||x>W+130)continue;let active=l.lit;glow(x,l.y,active?125:85,active?'#8cfff5':'#ff88dc',active?.4:.18);c.save();c.translate(x,l.y);c.strokeStyle=active?'#80f7ef':'#d099f0';c.lineWidth=6;c.shadowColor=active?'#7fffee':'#b05bff';c.shadowBlur=20;c.beginPath();c.moveTo(-40,28);c.lineTo(-40,-42);c.quadraticCurveTo(0,-92,40,-42);c.lineTo(40,28);c.closePath();c.stroke();c.fillStyle=active?'#a5ffff':'#ffb5e9';c.font='bold 48px system-ui';c.textAlign='center';c.fillText(icons[i],0,1);c.font='bold 15px system-ui';c.fillText(active?'ACESA':'USAR',0,65);c.restore()}}
function drawAbyssGuardian(){if(mode!=='rescue'||!boss||boss.dead)return;let x=boss.x-cam,y=boss.y;glow(x,y,155,'#fe2e7e',.34);c.save();c.translate(x,y);c.rotate(Math.sin(t*1.5)*.08);c.shadowColor='#fb2ab6';c.shadowBlur=24;c.strokeStyle='#e24cdb';c.lineWidth=4;for(let side of [-1,1]){c.fillStyle='#332657';c.beginPath();c.moveTo(side*37,-46);c.quadraticCurveTo(side*165,-180,side*170,-25);c.lineTo(side*92,42);c.closePath();c.fill();c.stroke()}c.fillStyle='#211531';c.beginPath();c.moveTo(-62,-83);c.lineTo(0,-135);c.lineTo(62,-83);c.lineTo(52,78);c.lineTo(0,104);c.lineTo(-52,78);c.closePath();c.fill();c.stroke();c.fillStyle='#eae1fa';c.fillRect(-26,-50,17,8);c.fillRect(9,-50,17,8);c.fillStyle='#ff76b5';c.beginPath();c.arc(0,0,18,0,twopi);c.fill();c.strokeStyle='#a9edff';c.beginPath();c.moveTo(0,100);c.lineTo(0,180);c.stroke();c.restore()}
function drawRescuePrison(){if(mode!=='rescue')return;let x=1510-cam;if(x<-140||x>W+140)return;glow(x,310,175,'#78dfff',.25);c.save();c.translate(x,320);c.strokeStyle='#85edff';c.shadowColor='#8efaff';c.shadowBlur=23;c.lineWidth=9;c.beginPath();c.ellipse(0,0,70,160,0,0,twopi);c.stroke();let u=images['lauana-sprite-upper-'+save.skin+'.webp'],ta=images['lauana-sprite-tail-'+save.skin+'.webp'];if(u?.naturalWidth&&ta?.naturalWidth){c.globalAlpha=.82;c.drawImage(ta,-63,0,125,144);c.drawImage(u,-64,-110,128,146)}c.restore()}
function drawJonathasPlayer(x,y,scale=1){
 c.save();c.translate(x,y+Math.sin(t*2.5)*1.8);c.scale(p.face*scale,scale);
 const walk=Math.sin(t*9)*Math.min(1,Math.abs(p.vx)/280),breath=Math.sin(t*2.8)*2;
 const poly=(points,fill,stroke='#52dafa',lw=2)=>{c.beginPath();points.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}};
 const limb=(x1,y1,x2,y2,w,light,dark)=>{let g=c.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,light);g.addColorStop(1,dark);c.strokeStyle=g;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.strokeStyle='#081b3d';c.lineWidth=2;c.stroke()};
 // Trailing cape with separate, wind-animated silhouette
 c.save();c.fillStyle='#08112ddd';c.strokeStyle='#53edff';c.lineWidth=2;c.shadowColor='#60cbff';c.shadowBlur=12;
 c.beginPath();c.moveTo(-31,-84);c.bezierCurveTo(-90+walk*12,-35,-75+Math.sin(t*3)*13,50,-123+Math.sin(t*4)*18,91);c.bezierCurveTo(-53,75,-42,18,-32,-55);c.closePath();c.fill();c.stroke();c.restore();
 glow(0,-65,112,'#33bbff',.24);
 // Boots / legs with separate motion
 for(let side of [-1,1]){c.save();c.translate(side*19,30);c.rotate(side*walk*.13);poly([[-16,0],[13,0],[18,57],[14,85],[-18,86],[-21,57]],'#141d39','#3778c1',2);poly([[-21,72],[17,72],[19,97],[-24,101]],'#152a46','#79eaff',2);poly([[-24,99],[24,99],[24,109],[-27,110]],'#090c1e','#4e77bd',2);c.strokeStyle='#7ceaf9';c.lineWidth=3;c.beginPath();c.moveTo(-13,38);c.lineTo(5,42);c.stroke();c.restore()}
 // Muscular torso stylized as armored costume rather than flat polygon
 let tg=c.createLinearGradient(-52,-118,45,20);tg.addColorStop(0,'#3e92bd');tg.addColorStop(.4,'#162c54');tg.addColorStop(1,'#10152d');
 poly([[-41,-98],[-18,-120],[22,-120],[48,-96],[39,-6],[25,36],[-27,36],[-43,-6]],tg,'#80e6fa',3);
 poly([[-37,-88],[-15,-104],[12,-103],[36,-84],[23,-48],[0,-61],[-24,-49]],'#172747','#276ec7',2);
 // Shining chest plate V geometry
 poly([[-30,-78],[-17,-82],[0,-45],[17,-82],[31,-77],[12,-33],[0,-23],[-12,-33]],'#e7f2ff','#44cfff',2);
 poly([[-24,-2],[24,-2],[21,35],[-19,35]],'#1e3461','#67b8ef',2);
 poly([[-20,17],[20,17],[14,25],[-13,25]],'#15213f','#47e7ff',2);
 for(let k=-2;k<=2;k++){c.fillStyle='#7df0ff';c.fillRect(k*11-2,-8,4,4)}
 // Two articulated muscular arms with teal illuminated edges
 for(let side of [-1,1]){c.save();c.translate(side*41,-91);c.rotate(side*(.1+walk*.1));
 limb(0,0,side*10,39,27,'#866457','#d0aa8b');limb(side*10,37,side*4,74,24,'#d6aa92','#93695c');
 // Wrist cuff
 c.fillStyle='#152b54';c.strokeStyle='#85eaff';c.lineWidth=2;c.beginPath();c.roundRect(side*4-14,62,28,18,4);c.fill();c.stroke();
 // Tattoo marks as carved diagonal strokes on arm
 if(side>0){c.strokeStyle='#272031';c.lineWidth=2;for(let j=0;j<5;j++){c.beginPath();c.moveTo(side*10-9,12+j*9);c.quadraticCurveTo(side*10+5,8+j*9,side*10+12,13+j*9);c.stroke()}}
 c.restore()}
 // Neck / face, black short haircut, stubble, glasses
 poly([[-14,-123],[13,-123],[15,-112],[-14,-112]],'#9f7867',null);
 c.save();c.translate(0,-144+breath);let face=c.createLinearGradient(-27,-18,24,28);face.addColorStop(0,'#dfb49c');face.addColorStop(.55,'#ae806d');face.addColorStop(1,'#73574f');
 c.fillStyle=face;c.beginPath();c.moveTo(-24,-17);c.quadraticCurveTo(-29,8,-17,30);c.quadraticCurveTo(0,45,18,27);c.quadraticCurveTo(28,7,23,-21);c.quadraticCurveTo(0,-40,-24,-17);c.fill();
 // Hair fade silhouette
 c.fillStyle='#121523';c.beginPath();c.moveTo(-27,-11);c.lineTo(-25,-29);c.quadraticCurveTo(-13,-49,12,-42);c.quadraticCurveTo(36,-35,25,-13);c.quadraticCurveTo(8,-28,-2,-19);c.lineTo(-19,-17);c.closePath();c.fill();
 // sunglasses with specular highlight
 c.fillStyle='#091625';c.strokeStyle='#98d6e8';c.lineWidth=2;for(let side of [-1,1]){c.beginPath();c.roundRect(side*13-12,-8,26,14,4);c.fill();c.stroke();c.strokeStyle='#c2faff';c.beginPath();c.moveTo(side*13-8,-5);c.lineTo(side*13-1,-4);c.stroke()}
 c.fillStyle='#2d2024';c.beginPath();c.ellipse(0,25,10,4,0,0,Math.PI);c.fill();c.strokeStyle='#291a22';c.lineWidth=3;c.beginPath();c.arc(0,21,13,.25,Math.PI-.25);c.stroke();
 c.fillStyle='#aff8ff';c.beginPath();c.arc(-28,4,3,0,twopi);c.fill();c.restore();
 // Magic weapon is independent from body and reacts to movement
 c.save();c.translate(54,-2);c.rotate(.08+walk*.06);c.strokeStyle='#7beeff';c.shadowColor='#53e7ff';c.shadowBlur=22;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(0,45);c.lineTo(36,-133);c.stroke();c.lineWidth=3;c.beginPath();c.moveTo(36,-133);c.lineTo(18,-109);c.moveTo(36,-133);c.lineTo(52,-109);c.stroke();c.restore();
 if(p.assist>0||p.shield>0){c.strokeStyle='#b9fbff';c.globalAlpha=.35+.25*Math.sin(t*11)**2;c.lineWidth=4;c.beginPath();c.ellipse(0,-44,93,165,.1,0,twopi);c.stroke();c.globalAlpha=1}
 c.restore();
}
function drawEnemies(){for(let e of enemies)if(e.health>0){if(e.kind==='book')drawBook(e);if(e.kind==='clockwork')drawClockwork(e);if(e.kind==='crab')drawCrab(e);if(e.kind==='jelly')drawJelly(e);if(e.kind==='eel')drawEel(e);if(e.kind==='bloom')drawBloom(e)}}
function drawPlayer(x,y,hero='lauana',scale=1){
 const upper=images['lauana-sprite-upper-'+save.skin+'.webp'],tail=images['lauana-sprite-tail-'+save.skin+'.webp'];if(!upper?.complete||!tail?.complete||!upper.naturalWidth)return;
 const water=mode==='reef'||mode==='boss'||mode==='temple'||mode==='leviathan'||mode==='arena'||mode==='prism';let amp=water?Math.min(1.5,.38+Math.hypot(p.vx,p.vy)/300):.25;
 c.save();c.translate(x,y);c.scale(p.face*scale,scale);if(water)c.rotate(1.32+clamp(p.vy/1100,-.24,.24));if(save.hero>0)c.filter=`hue-rotate(${(save.hero*36)%360}deg) saturate(1.18)`;
 let bob=Math.sin(t*(water?4.3:7)+.3)*amp*3;c.translate(0,bob);
 if(p.inv>0&&Math.floor(t*16)%2===0)c.globalAlpha=.62;
 if(p.dash>0){for(let i=3;i>=1;i--){c.globalAlpha=.1;i%2===0&&(c.globalAlpha=.19);c.drawImage(upper,-102-i*18,-122,214,234)}c.globalAlpha=1}
 glow(0,10,90,tint[save.skin],.16);
 // The fin swings separately from the upper body; on land it hangs down, underwater it waves.
 c.save();c.translate(-3,37);c.rotate(water?Math.sin(t*7.4)*.18*amp:Math.sin(t*3.2)*.065);
 c.drawImage(tail,-100,-159,211,233);c.restore();
 c.save();c.translate(0,-7);c.rotate(water?Math.sin(t*3.6)*.055:Math.sin(t*2.2)*.024);
 c.drawImage(upper,-101,-126,213,235);c.restore();
 if(water){const speed=Math.hypot(p.vx,p.vy);for(let j=0;j<2;j++){let bx=-90-j*31-Math.sin(t*7+j)*9,by=30+Math.cos(t*6+j*2)*21;
 c.beginPath();c.ellipse(bx,by,3+j*1.5,6+j*2,0,0,twopi);c.strokeStyle='#c7f9ff';c.lineWidth=1.5;c.globalAlpha=.23+speed/900;c.stroke()}}
 c.restore();c.globalAlpha=1;c.filter='none';
}
function drawGuardian(){if(p.assist<=0)return;let x=p.x-cam+55,y=p.y-60+Math.sin(t*4)*12;glow(x,y,130,'#38d5ff',.5);c.save();c.translate(x,y);c.lineCap='round';c.shadowColor='#36b9ff';c.shadowBlur=16;c.strokeStyle='#2df6ff';c.lineWidth=16;c.beginPath();c.moveTo(-27,-18);c.lineTo(-49,25);c.moveTo(31,-20);c.lineTo(61,25);c.stroke();c.fillStyle='#203b8b';c.beginPath();c.moveTo(-36,-50);c.lineTo(37,-50);c.lineTo(26,35);c.lineTo(-28,35);c.closePath();c.fill();c.lineWidth=4;c.strokeStyle='#9aefff';c.stroke();c.save();c.beginPath();c.ellipse(0,-73,28,31,0,0,twopi);c.clip();const im=images['portrait-jonathas.webp'];if(im.complete&&im.naturalWidth)c.drawImage(im,50,9,145,145,-32,-108,64,65);else{c.fillStyle='#bca2a1';c.fill()}c.restore();c.strokeStyle='#a2eaff';c.lineWidth=7;c.beginPath();c.moveTo(67,35);c.lineTo(105,-115);c.stroke();c.restore()}
function drawMagic(){for(let s of shots){let x=s.x-cam,y=s.y;const col=s.color||'#48f2ff';
 glow(x,y,30+s.r*2,col,.72);c.save();c.strokeStyle=col;c.shadowColor=col;c.shadowBlur=13;
 c.lineWidth=s.r>10?8:5;c.globalAlpha=.65;c.beginPath();c.moveTo(x-s.vx*.055,y-s.vy*.055);c.lineTo(x,y);c.stroke();
 c.fillStyle='#fff';c.globalAlpha=1;c.beginPath();c.arc(x,y,Math.min(13,s.r||8),0,twopi);c.fill();c.restore()}
for(let s of enemyShots){let x=s.x-cam,y=s.y;glow(x,y,29,s.color,.75);c.fillStyle=s.color;c.beginPath();c.arc(x,y,s.r,0,twopi);c.fill()}for(let q of particles){let x=q.x-cam;c.globalAlpha=Math.min(1,q.life);c.fillStyle=q.color;c.beginPath();c.arc(x,q.y,q.r,0,twopi);c.fill()}c.globalAlpha=1}

function drawCombatFeedback(){
 for(const e of enemies){if(e.health<=0||e.health>=e.maxHealth)continue;const x=e.x-cam,y=e.y-75;if(x<0||x>W)continue;
  c.fillStyle='#090c28bb';c.fillRect(x-28,y,56,7);c.fillStyle='#54f3f1';c.fillRect(x-27,y+1,54*clamp(e.health/e.maxHealth,0,1),5);
 }
 if(p.attackCD>.08){c.save();c.globalAlpha=clamp(p.attackCD*2.1,0,.35);c.strokeStyle=tint[save.skin];c.lineWidth=8;
  c.beginPath();c.arc(p.x-cam+30*p.face,p.y,100,-.9,.9);c.stroke();c.restore()}
 if(p.dash>0){for(let j=0;j<5;j++){let x=p.x-cam-j*p.face*32;c.save();c.globalAlpha=.09+.07*j;c.strokeStyle='#baffff';c.lineWidth=12-j*1.5;c.beginPath();c.moveTo(x,p.y-70);c.lineTo(x-p.face*35,p.y+18);c.stroke();c.restore()}}
}

function drawMissionArrows(){let target=null;if(mode==='prism'){target=prisms.find(q=>!q.lit)||{x:2460,y:320}}if(mode==='temple'){target=templeSeals.find(s=>!s.lit)||{x:2510,y:330}}if(mode==='grove'){target=groveLanterns.find(s=>!s.lit)||{x:1940,y:380}}if(mode==='school'){target=schoolSigils.find(s=>!s.taken)||{x:1950,y:380}}if(mode==='beach'){target=beachSigils.find(s=>!s.taken)||{x:2680,y:380}}if(mode==='reef'){target=reefSigils.find(s=>!s.taken)||{x:2990,y:340}}if(!target)return;let x=target.x-cam;if(x<30||x>W-30){let arrowX=x<30?65:W-65;c.fillStyle='#72f4ff';c.font='bold 28px system-ui';c.fillText(x<30?'◀':'▶',arrowX,330+Math.sin(t*5)*7)}}
function drawTempleSeals(){if(mode!=='temple')return;
 for(const q of templeSeals){const x=q.x-cam;if(x< -140||x>W+140)continue;const col=q.lit?'#6af9ee':'#e98cff';glow(x,q.y,130,col,q.lit?.39:.22);c.save();c.translate(x,q.y);c.shadowColor=col;c.shadowBlur=25;c.strokeStyle=col;c.lineWidth=5;c.beginPath();c.arc(0,0,45,0,twopi);c.stroke();c.lineWidth=2;c.rotate(t*.26);for(let k=0;k<6;k++){const a=k*Math.PI/3;c.beginPath();c.moveTo(Math.cos(a)*53,Math.sin(a)*53);c.lineTo(Math.cos(a)*68,Math.sin(a)*68);c.stroke()}c.rotate(-t*.26);c.fillStyle=col;c.textAlign='center';c.font='bold 27px Georgia';c.fillText(q.lit?'✦':'⌁',0,10);c.font='bold 14px system-ui';c.fillText(q.lit?'ATIVO':'ATAQUE',0,83);c.restore()}
}

function drawPrisms(){if(mode!=='prism')return;
 for(let i=0;i<prisms.length;i++){
  const q=prisms[i],x=q.x-cam;if(x<-140||x>W+140)continue;const open=prismOpen(q),col=q.lit?'#70ffe5':open?'#63eaff':'#ec70f5';
  c.save();c.translate(x,q.y);c.rotate(t*(q.lit?.18:.35));glow(0,0,open?125:92,col,open?.36:.19);
  c.strokeStyle=col;c.lineWidth=open?6:10;c.shadowBlur=18;c.shadowColor=col;c.beginPath();
  for(let a=0;a<6;a++){let angle=a*twopi/6;a===0?c.moveTo(Math.cos(angle)*51,Math.sin(angle)*64):c.lineTo(Math.cos(angle)*51,Math.sin(angle)*64)}c.closePath();c.stroke();
  c.fillStyle=q.lit?'#98ffe5':open?'#d5fcff':'#6e3289';c.beginPath();c.moveTo(0,-38);c.lineTo(27,0);c.lineTo(0,39);c.lineTo(-27,0);c.closePath();c.fill();c.restore();
  c.font='900 15px system-ui';c.textAlign='center';c.fillStyle='#e6fbff';c.fillText(q.lit?'ATIVADO':open?'ATAQUE AGORA':'ESCUDO',x,q.y+98);
 }
 // Individually timed laser barriers, pre-signaled before pulse.
 for(let i=0;i<3;i++){
  const q=prisms[i];if(q.lit)continue;const x=q.x+185-cam;if(x<0||x>W)continue;const cycle=(t+q.phase)%4.8,active=cycle>3.1&&cycle<3.6;
  c.save();c.globalAlpha=active?.65:.16;c.fillStyle=active?'#fc5fe0':'#8fa5ff';c.fillRect(x-7,118,14,390);
  c.strokeStyle=active?'#ffd1f4':'#779fff';c.lineWidth=active?6:2;c.setLineDash(active?[]:[9,13]);c.beginPath();c.moveTo(x,110);c.lineTo(x,513);c.stroke();c.restore();
 }
}

function drawLeviathan(){if(mode!=='leviathan'||!boss||boss.dead)return;let x=boss.x-cam,y=boss.y;if(x<-360||x>W+250)return;const col=boss.open>0?'#b4fffd':'#bf6aff';c.save();c.lineCap='round';c.lineJoin='round';c.shadowBlur=25;c.shadowColor=col;for(let j=9;j>=0;j--){let xx=x-j*35,yy=y+Math.sin(t*2.5-j*.47)*42;let r=35*(1-j/15);glow(xx,yy,r*2,col,.16);c.fillStyle=j%2?'#19266b':'#253281';c.strokeStyle=j%2?'#3ed8f8':'#9c67ff';c.lineWidth=4;c.beginPath();c.ellipse(xx,yy,r,r*.72,Math.sin(t*2+j)*.2,0,twopi);c.fill();c.stroke();if(j%2===0){c.strokeStyle='#d0c9ff';c.lineWidth=3;c.beginPath();c.moveTo(xx,yy-r*.72);c.lineTo(xx-12,yy-r*1.2);c.stroke()}}glow(x+40,y,135,col,.3);c.fillStyle='#143370';c.strokeStyle='#82e9ff';c.lineWidth=5;c.beginPath();c.moveTo(x-20,y-45);c.quadraticCurveTo(x+80,y-70,x+102,y-3);c.quadraticCurveTo(x+53,y+78,x-20,y+44);c.closePath();c.fill();c.stroke();c.fillStyle='#ff70df';c.beginPath();c.ellipse(x+53,y-13,12,8,0,0,twopi);c.fill();c.strokeStyle='#cdefff';c.beginPath();c.moveTo(x+70,y+22);c.lineTo(x+104,y+29);c.stroke();for(let k=0;k<3;k++){let xx=x-10+k*32;c.fillStyle='#d9f8ff';c.beginPath();c.moveTo(xx,y-42);c.lineTo(xx+16,y-87);c.lineTo(xx+24,y-35);c.fill()}c.restore();if(boss.charge>.7){c.save();c.globalAlpha=.45+.28*Math.sin(t*18)**2;c.strokeStyle='#ff71e8';c.lineWidth=18;c.setLineDash([23,14]);c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();c.restore()}}
function drawShellSentinel(){
 if(!boss||boss.dead)return;let x=boss.x-cam,y=boss.y;
 c.save();c.translate(x,y);let pul=Math.sin(t*2.4)*6;
 glow(0,0,190,boss.open>0?'#9dffff':'#ffb074',.45);
 // Animated animated coral armor rings and shell silhouettes.
 for(let k=0;k<8;k++){c.save();c.rotate(k*twopi/8+t*.16);c.fillStyle=k%2?'#a857aa':'#4d5eae';c.strokeStyle='#ffdbac';c.lineWidth=3;
 c.beginPath();c.moveTo(36,-13);c.quadraticCurveTo(86,-49,106,0);c.quadraticCurveTo(88,43,36,13);c.closePath();c.fill();c.stroke();c.restore()}
 c.fillStyle='#342753';c.strokeStyle='#ffdcac';c.lineWidth=7;c.beginPath();c.ellipse(0,0,70+pul*.35,78+pul*.3,0,0,twopi);c.fill();c.stroke();
 for(let k=0;k<5;k++){let a=k*twopi/5+t*.1;c.fillStyle='#74e5ff';c.beginPath();c.arc(Math.cos(a)*43,Math.sin(a)*46,8,0,twopi);c.fill()}
 c.strokeStyle=boss.open>0?'#a3fff2':'#ffc77f';c.lineWidth=10;c.shadowBlur=20;c.shadowColor=c.strokeStyle;
 c.beginPath();c.arc(0,0,35,0,twopi);c.stroke();c.fillStyle='#fff9e8';c.beginPath();c.arc(0,0,14,0,twopi);c.fill();
 c.restore();
}
function draw(){c.save();c.clearRect(0,0,W,H);if(shake)c.translate(rand(-shake,shake),rand(-shake,shake));paintBg();drawPortal();drawSigils();drawLanterns();drawTempleSeals();drawPrisms();drawEnemies();drawRescuePrison();drawAbyssGuardian();drawLeviathan();if(mode==='arena'){
 if(boss&&!boss.dead){drawShellSentinel();}
 if(arenaWarning>0){c.save();c.strokeStyle='#ffc77b';c.lineWidth=12;c.globalAlpha=.35+.4*Math.sin(t*18)**2;
 c.setLineDash([18,12]);c.beginPath();c.moveTo(0,445);c.lineTo(W,445);c.stroke();c.restore()}
 if(arenaCountdown>0){c.save();c.font='900 34px system-ui';c.fillStyle='#fff3e5';c.textAlign='center';c.shadowColor='#ffb059';c.shadowBlur=18;
 c.fillText('PRÓXIMA ONDA EM '+Math.ceil(arenaCountdown),W/2,170);c.restore()}
 }if(mode==='boss'){drawJelly({x:boss.x,y:boss.y,phase:0,hit:boss.flash},true);if(boss.open>0){glow(boss.x-cam,boss.y-10,95,'#e2eaff',.6);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(boss.x-cam,boss.y-10,25,0,twopi);c.stroke()}}if((mode==='boss'||mode==='rescue')&&boss?.warning>0&&!boss.dead){const radius=155+Math.sin(t*14)*12;c.save();c.strokeStyle='#ff8be9';c.globalAlpha=.38+.32*Math.sin(t*13)**2;c.lineWidth=9;c.setLineDash([17,14]);c.beginPath();c.arc(boss.x-cam,boss.y+20,radius,0,twopi);c.stroke();c.setLineDash([]);c.restore()}if(p.comboTimer>.1&&p.combo>=3){c.save();c.font='900 18px system-ui';c.textAlign='center';c.shadowColor='#ff3ddd';c.shadowBlur=15;c.fillStyle='#fff5ff';c.fillText('✦ COMBO DE MARÉ',p.x-cam,p.y-155+Math.sin(t*6)*3);c.restore()}if(mode!=='rescue')drawGuardian();if(mode==='rescue')drawJonathasPlayer(p.x-cam,p.y-17,1.12);else drawPlayer(p.x-cam,p.y-((mode==='school'||mode==='beach'||mode==='grove')?17:0),'lauana',((mode==='school'||mode==='beach'||mode==='grove')?1.21:1.26));drawMagic();drawCombatFeedback();drawMissionArrows();let grad=c.createLinearGradient(0,H-115,0,H);grad.addColorStop(0,'#0c0c3b00');grad.addColorStop(1,'#02091fa1');c.fillStyle=grad;c.fillRect(0,H-115,W,115);c.restore()}
function resizeGame(){let ratio=window.innerWidth/window.innerHeight;if(ratio>1.85&&window.innerHeight<650){W=Math.round(H*ratio)}else{W=1152}canvas.width=W;canvas.height=H}window.addEventListener('resize',resizeGame);resizeGame();
let last=0;function loop(ts){const dt=Math.min(.034,Math.max(0,(ts-last)/1000||0));last=ts;if(run&&!paused)tick(dt);if(current==='gameScreen')draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
// helper for keyboard focus and mobile state
syncControls();renderHome();if(new URLSearchParams(location.search).has('qa')){window.__lauanaQA={startMission,loadSchool,loadBeach,loadReef,loadBoss,loadGrove,loadTemple,loadPrism,loadLeviathan,loadRescue,loadArena,activateLantern,draw,fire,summon,dodge,getState:()=>({mode,x:p.x,y:p.y,health:p.health,bossHp:boss?.hp,pearls:save.pearls,assist:p.assist,combo:p.combo,shield:p.shield,hero:save.hero,templeSeals:templePhase,prismCount,prismOpen:prisms.map(prismOpen),arenaWave,arenaScore,arenaCountdown,arenaClear}),setPlayer:(x,y)=>{p.x=x;p.y=y},setTime:(v)=>{t=v},setHero:(h)=>{save.hero=h},templeState:()=>templeSeals.map(x=>({x:x.x,y:x.y,lit:x.lit})),setBossOpen:(v)=>{if(boss)boss.open=v},setBossHp:(v)=>{if(boss)boss.hp=v}}};
})();
