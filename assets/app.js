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

  /* ---- Mobile drawer ---- */
  function drawer(){
    var t = document.querySelector(".nav__toggle"), d = document.querySelector(".drawer");
    if(!t || !d) return;
    var c = d.querySelector(".close");
    function open(){ d.classList.add("open"); document.body.style.overflow="hidden"; }
    function close(){ d.classList.remove("open"); document.body.style.overflow=""; }
    t.addEventListener("click", open);
    if(c) c.addEventListener("click", close);
    d.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", close); });
  }

  /* ---- VSL click-to-play (NUNCA autoplay) ---- */
  function vsl(){
    document.querySelectorAll(".vsl").forEach(function(box){
      box.addEventListener("click", function(){
        var src = box.getAttribute("data-src");
        if(!src){ box.querySelector(".vsl__label").textContent = "VIDEO PENDIENTE · [VALIDAR]"; return; }
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
    function size(){ w = host.offsetWidth; h = host.offsetHeight; c.width=w*dpr; c.height=h*dpr; c.style.width=w+"px"; c.style.height=h+"px"; ctx.setTransform(dpr,0,0,dpr,0,0); }
    function init(){ pts = []; for(var i=0;i<N;i++){ pts.push({x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.16, vy:(Math.random()-.5)*.16, r:2+Math.random()*2.4}); } }
    function frame(){
      ctx.clearRect(0,0,w,h);
      for(var i=0;i<pts.length;i++){
        var p=pts[i]; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>w)p.vx*=-1; if(p.y<0||p.y>h)p.vy*=-1;
        for(var j=i+1;j<pts.length;j++){
          var q=pts[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy);
          if(d<120){ ctx.strokeStyle="rgba(111,205,178,"+(0.10*(1-d/120))+")"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); }
        }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fillStyle="rgba(168,230,210,.55)"; ctx.fill();
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
    try{ window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({event:name}, params||{})); }catch(e){}
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
      if(vd){ vd.textContent = pct>=70 ? "Tu operación ya tiene base, pero hay fuga recuperable. Te mostramos dónde."
            : pct>=40 ? "Tu operación pierde ventas en las costuras. La buena noticia: tiene cierre."
            : "Tienes un Frankenstein digital severo. Cada semana se escapa venta que ya pagaste."; }
      result.classList.add("show");
      track("assessment_completed", {score:pct});
    }
    root.querySelectorAll(".engine__opt").forEach(function(opt){
      opt.addEventListener("click", function(){ score += (+opt.getAttribute("data-w")||0); i++; if(i>=total) finish(); else show(i); });
    });
    root.querySelectorAll(".engine__back").forEach(function(b){ b.addEventListener("click", function(){ if(i>0){ i--; show(i); } }); });
    show(0);
  }

  /* ---- RADAR / formularios de captura (consentimiento + éxito sin recargar) ---- */
  function radar(){
    document.querySelectorAll("form[data-capture]").forEach(function(f){
      f.addEventListener("submit", function(e){
        e.preventDefault();
        var consent = f.querySelector("input[type=checkbox]");
        if(consent && !consent.checked){ consent.focus(); return; }
        track(f.getAttribute("data-capture")||"lead_submit", {form:f.getAttribute("data-form")||"radar"});
        var ok = f.getAttribute("data-ok") || "Listo. Te llega por aquí en breve. 🎯";
        f.innerHTML = '<p style="color:var(--jade-luz);font-family:var(--f-mono);font-size:.9rem;text-align:center;padding:10px 0">'+ok+'</p>';
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
    abTest(); reveals(); faq(); drawer(); vsl(); calc(); engine(); radar(); swarm(); agentixSwarm(); exitIntent();
  });
})();
