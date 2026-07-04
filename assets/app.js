/* ImperIA CX — interacciones. Enjambre Orquestado.
   Sin dependencias. Respeta prefers-reduced-motion. */
(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll reveals ---- */
  function reveals(){
    var els = document.querySelectorAll(".reveal");
    if(!("IntersectionObserver" in window) || reduce){ els.forEach(function(e){e.classList.add("in");}); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target);} });
    },{threshold:.14, rootMargin:"0px 0px -8% 0px"});
    els.forEach(function(e){ io.observe(e); });
  }

  /* ---- FAQ accordion (+ accesible) ---- */
  function faq(){
    document.querySelectorAll(".faq__q").forEach(function(btn){
      var a = btn.nextElementSibling, item = btn.closest(".faq__item");
      btn.setAttribute("aria-expanded","false");
      btn.addEventListener("click", function(){
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true":"false");
        a.style.maxHeight = open ? (a.scrollHeight + "px") : "0";
      });
    });
  }

  /* ---- Mobile drawer v2 (grupos acordeón + backdrop + esc) ---- */
  function drawer(){
    var t = document.querySelector(".nav__toggle"), d = document.querySelector(".drawer"),
        bd = document.querySelector(".drawer-backdrop");
    if(!t || !d) return;
    var c = d.querySelector(".close");
    function open(){ d.classList.add("open"); if(bd){bd.hidden=false;} document.body.style.overflow="hidden"; t.setAttribute("aria-expanded","true"); }
    function close(){ d.classList.remove("open"); if(bd){bd.hidden=true;} document.body.style.overflow=""; t.setAttribute("aria-expanded","false"); }
    t.addEventListener("click", open);
    if(c) c.addEventListener("click", close);
    if(bd) bd.addEventListener("click", close);
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") close(); });
    d.querySelectorAll(".drawer__label").forEach(function(btn){
      btn.addEventListener("click", function(){
        var g = btn.closest(".drawer__group"), was = g.classList.contains("open");
        d.querySelectorAll(".drawer__group").forEach(function(x){ x.classList.remove("open"); x.querySelector(".drawer__label").setAttribute("aria-expanded","false"); });
        if(!was){ g.classList.add("open"); btn.setAttribute("aria-expanded","true"); }
      });
    });
    d.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", close); });
  }

  /* ---- VSL click-to-play (NUNCA autoplay) ---- */
  function vsl(){
    document.querySelectorAll(".vsl").forEach(function(box){
      box.addEventListener("click", function(){
        var src = box.getAttribute("data-src");
        if(!src){ box.querySelector(".vsl__label").textContent = "Video próximamente"; return; }
        var f = document.createElement("iframe");
        f.src = src + (src.indexOf("?")>-1?"&":"?") + "autoplay=1";
        f.allow = "autoplay; fullscreen; picture-in-picture";
        f.setAttribute("frameborder","0");
        f.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:3;border:0";
        box.appendChild(f);
        box.style.cursor = "default";
      }, {once:true});
    });
  }

  /* ---- Calculadora de fuga ----
     Modelo transparente (supuesto estratégico, ajustable):
     leads/mes × ticket × % que se pierde por seguimiento tardío/nulo.
     Default tasa de fuga = 0.27 (rango defendible 20–35% sin operación 24/7). [VALIDAR] por vertical. */
  function calc(){
    var root = document.querySelector("[data-calc]");
    if(!root) return;
    var fmt = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
    var inputs = root.querySelectorAll("input[type=range]");
    function compute(){
      var leads = +root.querySelector("[name=leads]").value;
      var ticket = +root.querySelector("[name=ticket]").value;
      var fuga = (+root.querySelector("[name=fuga]").value)/100;
      root.querySelector("[data-val=leads]").textContent = leads;
      root.querySelector("[data-val=ticket]").textContent = fmt.format(ticket);
      root.querySelector("[data-val=fuga]").textContent = Math.round(fuga*100)+"%";
      var perdidaMes = leads * fuga * ticket * 0.15; /* 0.15 = tasa de cierre supuesta sobre lo recuperable. [VALIDAR] */
      var out = root.querySelector("[data-out]");
      out.textContent = fmt.format(Math.round(perdidaMes));
      /* v6.2: inyecta la cifra en el CTA (anclaje + loss aversion) */
      var cta = document.querySelector("[data-calc-cta]");
      if(cta){ cta.textContent = "Recupera tus " + fmt.format(Math.round(perdidaMes)) + "/mes"; }
    }
    var touched = false;
    inputs.forEach(function(i){ i.addEventListener("input", function(){
      compute();
      if(!touched){ touched = true; track("calculator_completed");
        var cap = document.querySelector(".calc__capture"); if(cap) cap.classList.add("show"); }
    }); });
    compute();
  }

  /* ---- Swarm ambiental (hero) — el enjambre se insinúa ---- */
  function swarm(){
    var host = document.querySelector("[data-swarm]");
    if(!host || reduce) return;
    var c = document.createElement("canvas"), ctx = c.getContext("2d"), w,h, dpr = Math.min(window.devicePixelRatio||1,2);
    host.appendChild(c);
    var N = 26, pts = [];
    var sig = (getComputedStyle(document.documentElement).getPropertyValue("--violeta-claro")||"#1FB673").trim();
    function size(){ w = host.offsetWidth; h = host.offsetHeight; c.width=w*dpr; c.height=h*dpr; c.style.width=w+"px"; c.style.height=h+"px"; ctx.setTransform(dpr,0,0,dpr,0,0); }
    function init(){ pts = []; for(var i=0;i<N;i++){ pts.push({x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.16, vy:(Math.random()-.5)*.16, r:2+Math.random()*2.4}); } }
    function frame(){
      ctx.clearRect(0,0,w,h);
      for(var i=0;i<pts.length;i++){
        var p=pts[i]; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>w)p.vx*=-1; if(p.y<0||p.y>h)p.vy*=-1;
        for(var j=i+1;j<pts.length;j++){
          var q=pts[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy);
          if(d<120){ ctx.globalAlpha=0.30*(1-d/120); ctx.strokeStyle=sig; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); ctx.globalAlpha=1; }
        }
        ctx.globalAlpha=0.85; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fillStyle=sig; ctx.fill(); ctx.globalAlpha=1;
      }
      requestAnimationFrame(frame);
    }
    size(); init(); frame();
    window.addEventListener("resize", function(){ size(); init(); });
  }

  /* ---- Swarm estático en bloque AGENTIX ---- */
  function agentixSwarm(){
    var host = document.querySelector(".swarm");
    if(!host) return;
    var cn = host.querySelector(".center-node"); if(cn) return; /* ya marcado */
    for(var i=0;i<12;i++){
      var a = (i/12)*6.283, R = 110 + (i%3)*18;
      var n = document.createElement("span"); n.className="nodo";
      n.style.left = (150 + Math.cos(a)*R - 4) + "px";
      n.style.top  = (150 + Math.sin(a)*R - 4) + "px";
      host.appendChild(n);
    }
    var center = document.createElement("span"); center.className="nodo center-node"; host.appendChild(center);
  }

  /* ---- GA4 event helper (dataLayer-ready) ---- */
  function track(name, params){
    try{
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({event:name}, params||{}));
      if(typeof window.gtag === "function"){ window.gtag("event", name, params||{}); }
    }catch(e){}
  }

  /* ---- Test A/B/C above-the-fold (?v=a|b|c · 33/33/33) ---- */
  function abTest(){
    var groups = document.querySelectorAll("[data-ab]");
    if(!groups.length) return;
    var p = new URLSearchParams(location.search).get("v");
    var pick = (p==="a"||p==="b"||p==="c") ? p : ["a","b","c"][Math.floor(Math.random()*3)];
    groups.forEach(function(g){
      var vs = g.querySelectorAll("[data-ab-variant]");
      vs.forEach(function(v){ v.classList.toggle("ab-active", v.getAttribute("data-ab-variant")===pick); });
      if(!g.querySelector(".ab-active") && vs[0]) vs[0].classList.add("ab-active");
    });
    var flag = document.createElement("div"); flag.className="ab-flag"; flag.textContent="VARIANTE "+pick.toUpperCase();
    document.body.appendChild(flag);
    track("ab_variant_view", {variant:pick});
  }

  /* ---- ENGINE · Scorecard interactivo (scoring + captura al final) ---- */
  function engine(){
    var root = document.querySelector("[data-engine]");
    if(!root) return;
    var steps = root.querySelectorAll(".engine__step");
    var bar = root.querySelector(".engine__bar i");
    var result = root.querySelector(".engine__result");
    var total = steps.length, i = 0, score = 0;
    function show(n){ steps.forEach(function(s,k){ s.classList.toggle("active", k===n); }); if(bar) bar.style.width=(n/total*100)+"%"; }
    function finish(){
      steps.forEach(function(s){ s.classList.remove("active"); });
      if(bar) bar.style.width="100%";
      var pct = Math.round(score/(total*3)*100);
      var sc = result.querySelector("[data-engine-score]"); if(sc) sc.firstChild.textContent = pct;
      var vd = result.querySelector("[data-engine-verdict]");
      if(vd){ vd.textContent = pct>=70 ? "Buena base. Pero todavía hay ventas escapándose en los huecos —y son las más fáciles de recuperar."
            : pct>=40 ? "Estás perdiendo ventas por respuestas que llegan tarde y seguimiento que no ocurre. La buena noticia: tiene cierre."
            : "Tu operación es un Frankenstein: cada semana se te escapa venta que ya pagaste con publicidad. Urge coserla."; }
      result.classList.add("show");
      track("assessment_completed", {score:pct});
    }
    root.querySelectorAll(".engine__opt").forEach(function(opt){
      opt.addEventListener("click", function(){ score += (+opt.getAttribute("data-w")||0); i++; if(i>=total) finish(); else show(i); });
    });
    root.querySelectorAll(".engine__back").forEach(function(b){ b.addEventListener("click", function(){ if(i>0){ i--; show(i); } }); });
    show(0);
  }


  /* ---- PERFORMANCE SCORE v2 · ¿Dónde pierdes ventas? ----
     Dos modos (exprés/profundo) · arquetipos · gate ANTES del resultado ·
     score ponderado (vel 25 · seg 20 · conv 30 · cob 10 · ret 15) ·
     pérdida/proyección con modelo transparente · D1 + CX. */
  function score(){
    var root = document.querySelector("[data-score]");
    if(!root) return;
    var cfgEl = root.querySelector("[data-score-config]");
    if(!cfgEl) return;
    var cfg = JSON.parse(cfgEl.textContent);
    var fmt = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
    var st = {mode:null, flow:[], i:0, ans:{}, res:null};
    var stages = {};
    root.querySelectorAll(".score__stage").forEach(function(el){ stages[el.getAttribute("data-stage")] = el; });
    var bar = root.querySelector(".score__bar i");
    function stage(name){ Object.keys(stages).forEach(function(k){ stages[k].hidden = (k!==name); }); root.scrollIntoView({behavior:"smooth", block:"start"}); }
    function giro(){ var g = cfg.giros.filter(function(x){return x.id===st.ans.giro;})[0]; return g || cfg.giros[cfg.giros.length-1]; }

    /* -- preguntas -- */
    var qk = root.querySelector("[data-q-kicker]"), qt = root.querySelector("[data-q-text]"),
        qs = root.querySelector("[data-q-sub]"), qi = root.querySelector("[data-q-inputs]"),
        qb = root.querySelector("[data-q-back]"), qn = root.querySelector("[data-q-next]");
    function fmtVal(v, kind){
      if(kind==="mxn") return fmt.format(v);
      if(kind==="de10") return v + " de 10";
      return (+v).toLocaleString("es-MX");
    }
    function renderQ(){
      var id = st.flow[st.i], q = cfg.preguntas[id];
      if(bar) bar.style.width = (st.i/st.flow.length*100)+"%";
      qk.textContent = "PREGUNTA "+(st.i+1)+" DE "+st.flow.length+" · "+q.k;
      qt.textContent = q.q; qs.textContent = q.sub||""; qs.hidden = !q.sub;
      qi.innerHTML = ""; qn.hidden = true;
      function pick(val, label){ st.ans[id] = val; if(label) st.ans[id+"_label"] = label; st.i++; (st.i>=st.flow.length) ? stage("gate") : renderQ(); }
      if(q.type==="opts_giro"){
        cfg.giros.forEach(function(g){
          var b = document.createElement("button"); b.type="button"; b.className="score__opt";
          b.textContent = g.label; b.addEventListener("click", function(){ pick(g.id, g.label); });
          qi.appendChild(b);
        });
      } else if(q.type==="opts_arq"){
        var arqs = giro().arquetipos || cfg.arquetipos_default;
        arqs.forEach(function(a, k){
          var b = document.createElement("button"); b.type="button"; b.className="score__opt";
          b.textContent = a; b.addEventListener("click", function(){ st.ans.arquetipo_idx = k; pick(a, a); });
          qi.appendChild(b);
        });
      } else if(q.type==="opts"){
        q.opts.forEach(function(o, k){
          var b = document.createElement("button"); b.type="button"; b.className="score__opt";
          b.textContent = o; b.addEventListener("click", function(){ pick(k+1, o); });
          qi.appendChild(b);
        });
      } else {
        var min=q.min, max=q.max, step=q.step, val=q.val, kind=q.fmt;
        if(q.type==="range_ticket"){ var tk = giro().ticket; min=tk[0]; max=tk[1]; step=tk[2]; val=(st.ans.ticket||tk[3]); kind="mxn"; }
        if(st.ans[id]!=null) val = st.ans[id];
        var box = document.createElement("div"); box.className="score__slider";
        var out = document.createElement("div"); out.className="score__sliderval tnum"; out.textContent = fmtVal(val, kind);
        var inp = document.createElement("input"); inp.type="range"; inp.min=min; inp.max=max; inp.step=step; inp.value=val;
        inp.addEventListener("input", function(){ out.textContent = fmtVal(+inp.value, kind); });
        box.appendChild(out); box.appendChild(inp);
        var ends = document.createElement("div"); ends.className="score__ends";
        ends.innerHTML = "<span>"+fmtVal(min,kind)+"</span><span>"+fmtVal(max,kind)+"</span>";
        box.appendChild(ends); qi.appendChild(box);
        qn.hidden = false;
        qn.onclick = function(){ pick(+inp.value); };
      }
    }
    qb.addEventListener("click", function(){
      if(st.i<=0){ stage("intro"); if(bar) bar.style.width="0%"; return; }
      st.i--; renderQ(); stage("q");
    });
    root.querySelectorAll("[data-mode]").forEach(function(b){
      b.addEventListener("click", function(){
        st.mode = b.getAttribute("data-mode"); st.flow = cfg.flujo[st.mode==="deep"?"deep":"express"]; st.i = 0;
        track("score_start", {mode:st.mode});
        stage("q"); renderQ();
      });
    });

    /* -- cálculo (modelo transparente · supuestos ajustables) -- */
    function compute(){
      var a = st.ans, deep = st.mode==="deep";
      var vel=(a.velocidad!=null?a.velocidad:3)*10, seg=(a.seguimiento!=null?a.seguimiento:3)*10,
          conv=(a.conversion!=null?a.conversion:2)*10,
          cob=((a.cobranza||3)-1)*25, ret=((a.retencion||3)-1)*25;
      var sc = deep ? Math.round(.25*vel+.20*seg+.30*conv+.10*cob+.15*ret)
                    : Math.round((.25*vel+.20*seg+.30*conv)/0.75);
      sc = Math.max(2, Math.min(98, sc));
      var banda = cfg.bandas.filter(function(b){ return sc<=b.max; })[0] || cfg.bandas[cfg.bandas.length-1];
      var contactos=a.contactos||120, ticket=a.ticket||giro().ticket[3];
      var ca=(a.conversion!=null?a.conversion:2)/10;
      var recup=Math.min(.05,(10-(a.velocidad||0))*.003+(10-(a.seguimiento||0))*.002);
      var pot=Math.min(1, ca+recup);
      var perdida=Math.round((pot-ca)*contactos*ticket);
      var equipo=a.equipo||3, req=Math.ceil(contactos/cfg.capacidad_por_persona);
      var brecha=Math.max(0, req-equipo);
      var big=(a.arquetipo_idx===2)||equipo>=6||contactos>=300;
      var tier, cta, href, asistido;
      if(sc<=60){ tier = big?"DOMINIO ⭐":"IMPULSO"; }
      else if(sc<=80){ tier = big?"DOMINIO ⭐":"IMPULSO → DOMINIO"; }
      else { tier = big?"DOMINIO → IMPERIO":"DOMINIO ⭐"; }
      asistido = tier.indexOf("DOMINIO")>-1 || tier.indexOf("IMPERIO")>-1;
      return {score:sc, banda:banda, perdida:perdida, proyeccion:perdida, contactos:contactos,
              ticket:ticket, equipo:equipo, req:req, brecha:brecha, tier:tier, asistido:asistido, deep:deep};
    }

    /* -- gate → resultado -- */
    var gate = root.querySelector("[data-score-gate]");
    gate.addEventListener("submit", function(e){
      e.preventDefault();
      var f = {}; gate.querySelectorAll("input").forEach(function(i){ f[i.name] = i.type==="checkbox" ? i.checked : i.value.trim(); });
      if(!f.consent) return;
      st.res = compute();
      var r = st.res, g = giro();
      var page = ((document.body.getAttribute("data-page")||document.title||"").split(/[·|—]/)[0]).trim();
      var payload = {
        evento:"performance_score", formulario:"score", modo:st.mode,
        nombre:f.nombre, whatsapp:f.whatsapp, email:f.email,
        contacto_ok: f.contacto_ok?1:0, senal_ok:1,
        arquetipo: st.ans.arquetipo_label||"", giro: st.ans.giro||"otro",
        score:r.score, banda:r.banda.nombre, tier_sugerido:r.tier,
        perdida_mes:r.perdida, proyeccion_mes:r.proyeccion, brecha:r.brecha,
        respuestas: st.ans, pagina: page, url: location.href,
        referente: document.referrer||"", query: location.search||"",
        idioma: document.documentElement.lang||"", ts:new Date().toISOString()
      };
      try{ fetch("/api/intake", {method:"POST", headers:{"Content-Type":"application/json"}, keepalive:true, body:JSON.stringify(payload)}); }catch(err){}
      var CX = document.body.getAttribute("data-cx")||"";
      if(CX){ try{ fetch(CX, {method:"POST", mode:"no-cors", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)}); }catch(err){} }
      track("assessment_completed", {mode:st.mode, score:r.score, tier:r.tier});
      reveal(f);
    });

    function reveal(f){
      var r = st.res, g = giro();
      if(bar) bar.style.width = "100%";
      stage("result");
      /* anillo + conteo */
      var ring = root.querySelector("[data-ring]"), C = 2*Math.PI*52;
      if(ring){ ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
        requestAnimationFrame(function(){ ring.style.strokeDashoffset = C*(1-r.score/100); }); }
      var num = root.querySelector("[data-r-score]"), t0 = null;
      function count(ts){ if(!t0) t0=ts; var k = Math.min(1,(ts-t0)/900); num.textContent = Math.round(r.score*k); if(k<1) requestAnimationFrame(count); }
      reduce ? (num.textContent = r.score) : requestAnimationFrame(count);
      root.querySelector("[data-r-banda]").textContent = r.banda.nombre;
      var extra = r.deep ? " Con tu equipo de "+r.equipo+", tu demanda exige capacidad de ~"+r.req+"." : "";
      root.querySelector("[data-r-verdict]").textContent = r.banda.copy + extra;
      root.querySelector("[data-r-perdida]").textContent = "~"+fmt.format(r.perdida);
      root.querySelector("[data-r-proyeccion]").textContent = "+"+fmt.format(r.proyeccion);
      var d = r.score-g.bench;
      root.querySelector("[data-r-bench]").textContent = r.score+" vs "+g.bench;
      var bb = root.querySelector("[data-r-brecha-box]");
      if(r.deep && r.brecha>0){ bb.hidden=false; root.querySelector("[data-r-brecha]").textContent = r.brecha; }
      root.querySelector("[data-r-giro]").textContent = g.linea;
      root.querySelector("[data-r-tier]").textContent = r.tier;
      root.querySelector("[data-r-plancopy]").textContent = r.asistido
        ? "Tu caso amerita sesión: agenda 20 minutos y te mostramos el plan exacto, con tus números, para cerrar esa fuga con "+r.tier+"."
        : "Actívalo y empieza a recuperar esto desde este mes. "+r.tier+" enciende la respuesta 24/7 y el seguimiento que hoy se te escapa.";
      var cta = root.querySelector("[data-r-cta]");
      if(r.asistido){ cta.textContent = "Agendar mi sesión de activación"; cta.setAttribute("href", cta.getAttribute("href").replace("precios","contacto")); }
      var wa = root.querySelector("[data-r-wa]"), num2 = (document.body.getAttribute("data-wa")||"").replace(/\D/g,"");
      var msg = (cfg.wa_tpl||"").replace("{score}", r.score).replace("{banda}", r.banda.nombre)
                  .replace("{perdida}", fmt.format(r.perdida)).replace("{tier}", r.tier);
      if(num2){ wa.setAttribute("href", "https://wa.me/"+num2+"?text="+encodeURIComponent(msg)); wa.setAttribute("target","_blank"); wa.setAttribute("rel","noopener"); }
      else { wa.addEventListener("click", function(e){ e.preventDefault(); }); wa.style.display="none"; }
      track("score_revealed", {score:r.score, banda:r.banda.nombre});
    }
  }

  /* ---- Detecta la sección actual (la del CTA, o la que está en el viewport) ---- */
  function nearestSection(el){
    var s = (el && el.closest) ? el.closest("section") : null;
    if(!s){
      var mid = window.innerHeight/2, secs = document.querySelectorAll("main section");
      for(var i=0;i<secs.length;i++){ var r=secs[i].getBoundingClientRect(); if(r.top<=mid && r.bottom>=mid){ s=secs[i]; break; } }
    }
    if(!s) return "";
    var h = s.querySelector(".eyebrow, h1, h2, h3");
    return h ? h.textContent.trim().replace(/\s+/g," ").slice(0,80) : "";
  }

  /* ---- WhatsApp click-to-chat · adjunta página + sección al mensaje ---- */
  function waCtx(){
    var num = (document.body.getAttribute("data-wa")||"").replace(/\D/g,"");
    var page = ((document.body.getAttribute("data-page")||document.title||"").split(/[·|—]/)[0]).trim();
    document.addEventListener("click", function(e){
      var a = e.target.closest("[data-wa-cta]"); if(!a) return;
      e.preventDefault();
      var sec = nearestSection(a);
      var msg = 'Hola, vengo de "'+page+'"'+(sec?(' (sección: '+sec+')'):'')+' y quiero ver cómo ImperIA CX opera esto en mi negocio.';
      track("wa_click", {page:page, section:sec});
      if(num){ window.open("https://wa.me/"+num+"?text="+encodeURIComponent(msg), "_blank", "noopener"); }
    });
  }

  /* ---- RADAR / formularios → CX (un POST con todo el contexto) + éxito sin recargar ---- */
  function radar(){
    var CX   = document.body.getAttribute("data-cx") || "";
    var page = ((document.body.getAttribute("data-page")||document.title||"").split(/[·|—]/)[0]).trim();
    document.querySelectorAll("form[data-capture]").forEach(function(f){
      f.addEventListener("submit", function(e){
        e.preventDefault();
        var consent = f.querySelector("input[type=checkbox]");
        if(consent && !consent.checked){ consent.focus(); return; }
        var data = {};
        f.querySelectorAll("input,select,textarea").forEach(function(inp){
          if(!inp.name) return;
          data[inp.name] = (inp.type==="checkbox") ? inp.checked : inp.value;
        });
        var cap = f.getAttribute("data-capture") || "lead_submit";
        var payload = Object.assign({}, data, {
          evento: cap,
          formulario: f.getAttribute("data-form") || "radar",
          pagina: page,
          seccion: nearestSection(f),
          url: location.href,
          referente: document.referrer || "",
          query: location.search || "",
          ts: new Date().toISOString()
        });
        track(cap, {form:payload.formulario, page:page, section:payload.seccion});
        if(CX){ try{ fetch(CX, {method:"POST", mode:"no-cors", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)}); }catch(err){} }
        try{ fetch("/api/intake", {method:"POST", headers:{"Content-Type":"application/json"}, keepalive:true,
          body:JSON.stringify(Object.assign({}, payload, {senal_ok: cap==="radar_subscribe"?1:0, respuestas:data, idioma:document.documentElement.lang||""}))}); }catch(err){}
        var ok = f.getAttribute("data-ok") || "Listo. Te llega por aquí en breve. 🎯";
        f.innerHTML = '<p style="color:var(--violeta-luz);font-family:var(--f-mono);font-size:.9rem;text-align:center;padding:10px 0">'+ok+'</p>';
      });
    });
  }

  /* ---- Exit-intent: rescata el resultado antes de irse ---- */
  function exitIntent(){
    var host = document.querySelector("[data-exit]");
    if(!host) return;
    var fired = false;
    document.addEventListener("mouseout", function(e){
      if(fired || e.relatedTarget || e.clientY > 8) return;
      fired = true; host.style.display = "block"; track("exit_intent_shown");
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    abTest(); reveals(); faq(); drawer(); vsl(); calc(); engine(); score(); radar(); waCtx(); swarm(); agentixSwarm(); exitIntent();
  });
})();
