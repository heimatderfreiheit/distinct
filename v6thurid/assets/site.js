(function(){
  var root=document.documentElement;
  // ---------- open values (tbd)
  var STRIPE={XS:'',S:'',M:'',L:'',XL:'',XXL:''}; // Stripe Payment Links pro Größe
  var EN_COMMON={nav_shop:'Drop 001',nav_about:'About',nav_help:'FAQ',privacy:'Privacy',withdraw:'Withdrawal',agb:'Terms',more:'Read the story and order',buy:'Order',size:'Size',back:'Back to the start',aria_nav:'Pages',aria_lang:'Language',aria_buy:'Order',aria_legal:'Legal',aria_md:'More drops',hint_size:'Please choose a size.'};
  var EN=Object.assign({},EN_COMMON,window.EN_PAGE||{});
  var DE={}, DEA={}; DE.title=document.title;
  document.querySelectorAll('[data-i18n]').forEach(function(el){ var k=el.getAttribute('data-i18n'); if(!(k in DE)) DE[k]=el.innerHTML; });
  document.querySelectorAll('[data-i18n-aria]').forEach(function(el){ var k=el.getAttribute('data-i18n-aria'); if(!(k in DEA)) DEA[k]=el.getAttribute('aria-label'); });
  function rd(k){ try{ return localStorage.getItem('distinct-'+k); }catch(e){ return null; } }
  function wr(k,v){ try{ localStorage.setItem('distinct-'+k,v); }catch(e){} }
  var S={lang:rd('lang')||'de'};
  function applyLang(){
    var en=S.lang==='en', T=en?EN:DE;
    document.querySelectorAll('[data-i18n]').forEach(function(el){ var k=el.getAttribute('data-i18n'); if(T[k]!=null) el.innerHTML=T[k]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(function(el){ var k=el.getAttribute('data-i18n-aria'); var v=en?EN[k]:DEA[k]; if(v!=null) el.setAttribute('aria-label',v); });
    if(T.title) document.title=T.title;
    root.lang=en?'en':'de';
    document.querySelectorAll('.lang button').forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.l===S.lang)); });
    document.querySelectorAll('.cd[data-until]').forEach(function(el){   // days left until a drop, local midnight
      var p=el.getAttribute('data-until').split('-'), d=Math.ceil((new Date(+p[0],+p[1]-1,+p[2])-new Date())/864e5);
      el.textContent = d>1 ? (en?'· '+d+' days to go':'· noch '+d+' Tage') : d===1 ? (en?'· tomorrow':'· morgen') : '';
    });
  }
  document.querySelectorAll('.lang button').forEach(function(b){ b.addEventListener('click',function(){ S.lang=b.dataset.l; wr('lang',S.lang); applyLang(); }); });

  // ---------- buying: a size first, then the Stripe link for that size
  var sz=document.getElementById('sizes'), hint=document.getElementById('sizeHint'), buyCta=document.getElementById('buyCta');
  if(sz){ ['XS','S','M','L','XL','XXL'].forEach(function(s){ var id='size-'+s; var inp=document.createElement('input'); inp.type='radio'; inp.name='size'; inp.id=id; inp.value=s; inp.addEventListener('change',function(){ sz.classList.remove('err'); if(hint) hint.textContent=''; }); var l=document.createElement('label'); l.htmlFor=id; l.textContent=s; sz.appendChild(inp); sz.appendChild(l); }); }
  if(buyCta){ buyCta.addEventListener('click',function(e){
    e.preventDefault();
    var self=this, t=this.querySelector('.cta-t');
    if(self.__t){ clearTimeout(self.__t); t.textContent=self.__old; }
    self.__old=t.textContent;
    var chk=document.querySelector('input[name=size]:checked');
    if(!chk){ t.textContent=S.lang==='en'?'Choose a size':'Größe wählen'; if(sz) sz.classList.add('err'); if(hint) hint.textContent=S.lang==='en'?EN.hint_size:'Bitte eine Größe wählen.'; var f=document.querySelector('input[name=size]'); if(f){ try{ f.focus({focusVisible:true}); }catch(err){ f.focus(); } } }
    else if(STRIPE[chk.value]){ location.href=STRIPE[chk.value]; return; }
    else { t.textContent=(S.lang==='en'?'Payment link follows · size ':'Bezahllink folgt · Größe ')+chk.value; }
    self.__t=setTimeout(function(){ t.textContent=self.__old; self.__t=0; },1800);
  }); }
  var sticky=document.getElementById('sticky');
  if(sticky&&buyCta){ document.body.classList.add('has-sticky'); var stickyCheck=function(){ var r=buyCta.getBoundingClientRect(); sticky.classList.toggle('on', r.top>window.innerHeight || r.bottom<0); }; window.addEventListener('scroll',stickyCheck,{passive:true}); window.addEventListener('resize',stickyCheck); stickyCheck(); }

  // ---------- the wordmark stands on end and holds still by CSS (sticky); here only the d breaks over the first 160px of scroll
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wm=document.getElementById('wm');
  if(wm){
    var dEl=wm.querySelector('.d'), DIST=160, GMAX=0.055, cur=0, tgt=0, last=0, raf=0, isStatic=false;
    var edge=wm.closest('.edge'), spine=wm.parentNode;
    var lage=root.classList.contains('wm-hoch')?'hoch':'titel';
    if(lage==='titel'){ DIST=320; GMAX=0.085; }   // masthead: whole at the top, then a clearly visible slip over a longer stretch
    var soft=(location.search.match(/[?&]distinct=(hell|kontur|voll)/)||[])[1];
    try{ if(soft) sessionStorage.setItem('distinct-wm',soft); else soft=sessionStorage.getItem('distinct-wm'); }catch(err){}
    if(!soft) soft='kontur';
    if(soft!=='voll') root.classList.add('wm-'+soft);
    function mode(){ isStatic = reduce || window.innerWidth<=700; root.classList.toggle('static',isStatic); if(isStatic) dEl.style.removeProperty('--g'); }
    function tick(ts){
      raf=0;
      var pin=edge?edge.offsetHeight-spine.offsetHeight:0;
      wm.style.setProperty('--q', pin>0?Math.max(0,Math.min(1,window.scrollY/pin)).toFixed(3):'1');
      if(isStatic) return;
      var now=(typeof ts==='number'&&ts>0)?ts:performance.now(); if(!last) last=now; var dt=Math.min(100,Math.max(0,now-last)); last=now;
      tgt=Math.max(0,Math.min(1,window.scrollY/DIST)); cur+=(tgt-cur)*(1-Math.exp(-dt/150)); if(Math.abs(tgt-cur)<0.001) cur=tgt;
      dEl.style.setProperty('--g',(GMAX*cur*cur*(3-2*cur)).toFixed(4)+'em');
      if(cur!==tgt) raf=requestAnimationFrame(tick);
    }
    function kick(){ if(!raf){ last=0; raf=requestAnimationFrame(tick); } }
    function setup(){ mode(); kick(); }
    window.addEventListener('scroll',kick,{passive:true});
    window.addEventListener('resize',setup);
    setup();
  }

  // ---------- the "you" slot: one picture every five seconds; a <video> plays once through, then the next comes
  var you=document.querySelector('.you');
  if(you){
    var film=(location.search.match(/[?&]film=(warm|mono|aus)/)||[])[1];
    try{ if(film) sessionStorage.setItem('distinct-film',film); else film=sessionStorage.getItem('distinct-film'); }catch(err){}
    if(!film) film='warm';
    if(film!=='aus') root.classList.add('film-'+film);
  }
  var heroFoto=(location.search.match(/[?&]hero=(foto|video)/)||[])[1];
  try{ if(heroFoto) sessionStorage.setItem('distinct-hero',heroFoto); else heroFoto=sessionStorage.getItem('distinct-hero'); }catch(err){}
  if(you&&!reduce&&heroFoto!=='foto'){
    var items=[].slice.call(you.querySelectorAll('img,video')), at=0, youT=0;
    var showYou, playYou=function(el){
      clearTimeout(youT);
      if(el.tagName==='VIDEO'){
        try{ el.currentTime=0; var pr=el.play(); if(pr&&pr.catch) pr.catch(function(){}); }catch(err){}
        el.onended=function(){ showYou(at+1); };
        youT=setTimeout(function(){ showYou(at+1); },12000);
      } else youT=setTimeout(function(){ showYou(at+1); },5000);
    };
    showYou=function(n){ items[at].classList.remove('on'); at=n%items.length; items[at].classList.add('on'); playYou(items[at]); };
    if(items.length>1) playYou(items[0]); else if(items[0]&&items[0].tagName==='VIDEO'){ items[0].loop=true; playYou(items[0]); items[0].onended=null; clearTimeout(youT); }
  }
  applyLang();
})();
