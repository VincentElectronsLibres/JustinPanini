/* ===========================================================
   Mon Album Panini - Coupe du Monde FIFA 2026
   =========================================================== */

// ⚠️ Change ce mot de passe avant de mettre ton site en ligne !
const APP_PASSWORD = "Belgique";

const LS_AUTH = "panini2026_auth";
const LS_FAN = "panini2026_fan";
const LS_COLLECTION = "panini2026_collection";
const LS_HISTORY = "panini2026_history";
const LS_RECENT = "panini2026_recent";

const TOTAL_STICKERS = STICKERS.length;

// ---------- État ----------
let collection = {};   // { code: count }
let history = [];      // pile pour annuler
let recent = [];       // dernières recherches

// Index rapide code -> sticker
const STICKER_BY_CODE = {};
STICKERS.forEach(s => STICKER_BY_CODE[s.code.toUpperCase()] = s);

const TEAM_BY_CODE = {};
TEAMS.forEach(t => TEAM_BY_CODE[t.code] = t);

// ---------- Utilitaires stockage ----------
function loadCollection(){
  try{
    const raw = localStorage.getItem(LS_COLLECTION);
    collection = raw ? JSON.parse(raw) : {};
  }catch(e){ collection = {}; }
}
function saveCollection(){
  localStorage.setItem(LS_COLLECTION, JSON.stringify(collection));
}
function loadHistory(){
  try{
    const raw = localStorage.getItem(LS_HISTORY);
    history = raw ? JSON.parse(raw) : [];
  }catch(e){ history = []; }
}
function saveHistory(){
  localStorage.setItem(LS_HISTORY, JSON.stringify(history.slice(-30)));
}
function loadRecent(){
  try{
    const raw = localStorage.getItem(LS_RECENT);
    recent = raw ? JSON.parse(raw) : [];
  }catch(e){ recent = []; }
}
function saveRecent(){
  localStorage.setItem(LS_RECENT, JSON.stringify(recent.slice(0,12)));
}

function getCount(code){
  return collection[code.toUpperCase()] || 0;
}

function setCount(code, newCount, recordHistory=true){
  code = code.toUpperCase();
  const prev = collection[code] || 0;
  newCount = Math.max(0, newCount);
  if(prev === newCount) return;
  if(recordHistory){
    history.push({code, prev, next:newCount});
    saveHistory();
  }
  if(newCount === 0){
    delete collection[code];
  } else {
    collection[code] = newCount;
  }
  saveCollection();
  refreshAllViews();
}

function undoLast(){
  if(history.length === 0) return;
  const action = history.pop();
  saveHistory();
  if(action.prev === 0){
    delete collection[action.code];
  } else {
    collection[action.code] = action.prev;
  }
  saveCollection();
  refreshAllViews();
}

// ---------- Connexion ----------
function checkAuth(){
  return sessionStorage.getItem(LS_AUTH) === "ok" || localStorage.getItem(LS_AUTH) === "ok";
}
function checkFan(){
  return localStorage.getItem(LS_FAN) === "ok";
}

document.getElementById('login-form').addEventListener('submit', function(e){
  e.preventDefault();
  const val = document.getElementById('login-password').value;
  if(val === APP_PASSWORD){
    localStorage.setItem(LS_AUTH, "ok");
    if(checkFan()){
      showApp();
    } else {
      document.getElementById('login-screen').hidden = true;
      document.getElementById('fan-screen').hidden = false;
    }
  } else {
    document.getElementById('login-error').hidden = false;
    document.getElementById('login-password').value = "";
  }
});

document.getElementById('fan-yes').addEventListener('click', function(){
  localStorage.setItem(LS_FAN, "ok");
  document.getElementById('fan-screen').hidden = true;
  showApp();
});

document.getElementById('fan-no').addEventListener('click', function(){
  document.getElementById('fan-message').hidden = false;
});

document.getElementById('logout-btn').addEventListener('click', function(){
  localStorage.removeItem(LS_AUTH);
  localStorage.removeItem(LS_FAN);
  sessionStorage.removeItem(LS_AUTH);
  document.getElementById('app').hidden = true;
  document.getElementById('fan-screen').hidden = true;
  document.getElementById('fan-message').hidden = true;
  document.getElementById('login-screen').hidden = false;
});

function showApp(){
  document.getElementById('login-screen').hidden = true;
  document.getElementById('fan-screen').hidden = true;
  document.getElementById('app').hidden = false;
  initApp();
}

// ---------- Onglets ----------
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab === 'trade') renderTrade();
    if(btn.dataset.tab === 'settings') renderSettings();
    if(btn.dataset.tab === 'album') renderAlbum();
  });
});

// ---------- Recherche ----------
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', ()=>{
  const code = searchInput.value.trim().toUpperCase();
  renderSearchResult(code);
});
searchInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    const code = searchInput.value.trim().toUpperCase();
    const sticker = STICKER_BY_CODE[code];
    if(sticker) addToRecent(code);
  }
});

function addToRecent(code){
  recent = recent.filter(c=>c!==code);
  recent.unshift(code);
  saveRecent();
  renderRecent();
}

function renderSearchResult(code){
  const box = document.getElementById('search-result');
  if(!code){ box.innerHTML = ""; return; }
  const sticker = STICKER_BY_CODE[code];
  if(!sticker){
    box.innerHTML = `<div class="result-notfound">Aucune carte avec la référence "<b>${escapeHtml(code)}</b>". Vérifie l'orthographe (ex: MEX5, FWC3, ARG17, 00).</div>`;
    return;
  }
  const count = getCount(code);
  const statusClass = count === 0 ? 's-missing' : (count === 1 ? 's-owned' : 's-double');
  const cardClass = count === 0 ? '' : (count === 1 ? 'owned' : 'double');
  const statusLabel = count === 0 ? "❌ Tu ne l'as pas — il te manque !" :
                       count === 1 ? "✅ Tu l'as déjà collée !" :
                       `🔁 Tu en as ${count} — tu peux en échanger !`;
  const teamLabel = sticker.special ? "Carte spéciale" : sticker.team;
  box.innerHTML = `
    <div class="result-card ${cardClass}">
      <span class="result-code">${sticker.code}</span>
      ${sticker.foil ? '<span class="result-foil">✨ BRILLANTE</span>' : ''}
      <div class="result-name">${escapeHtml(sticker.name)}</div>
      <div class="result-team">${escapeHtml(teamLabel)}</div>
      <div class="result-status ${statusClass}">${statusLabel}</div>
      <div class="result-actions">
        <button class="btn-have" data-action="have" data-code="${sticker.code}">✅ Je l'ai</button>
        <button class="btn-double" data-action="double" data-code="${sticker.code}">🔁 J'en ai un double</button>
        <button class="btn-remove" data-action="remove" data-code="${sticker.code}">❌ Retirer</button>
      </div>
    </div>
  `;
  box.querySelectorAll('button[data-action]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const c = b.dataset.code;
      const action = b.dataset.action;
      addToRecent(c);
      if(action === 'have') setCount(c, 1);
      else if(action === 'double') setCount(c, getCount(c) + 1 >= 2 ? getCount(c)+1 : 2);
      else if(action === 'remove') setCount(c, 0);
      renderSearchResult(c);
      showUndoBar();
    });
  });
}

function renderRecent(){
  const box = document.getElementById('recent-list');
  if(recent.length === 0){ box.innerHTML = '<span style="color:#92a399;font-size:13px;">Aucune recherche récente</span>'; return; }
  box.innerHTML = recent.map(code=>{
    const s = STICKER_BY_CODE[code];
    if(!s) return '';
    const count = getCount(code);
    const cls = count===0 ? 'missing' : (count===1 ? 'owned' : 'double');
    return `<button class="recent-chip ${cls}" data-code="${code}">${code}</button>`;
  }).join('');
  box.querySelectorAll('.recent-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      searchInput.value = chip.dataset.code;
      renderSearchResult(chip.dataset.code);
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });
}

// ---------- Annuler ----------
function showUndoBar(){
  const bar = document.getElementById('undo-bar');
  if(history.length === 0){ bar.hidden = true; return; }
  const last = history[history.length-1];
  document.getElementById('undo-text').textContent = `Modifié : ${last.code}`;
  bar.hidden = false;
}
document.getElementById('undo-btn').addEventListener('click', ()=>{
  undoLast();
  showUndoBar();
  renderSearchResult(searchInput.value.trim().toUpperCase());
});

// Mémorise quelles sections (équipes) sont actuellement dépliées,
// pour qu'elles ne se referment pas toutes seules après un clic.
let openSections = new Set();

// ---------- Album ----------
function renderAlbum(){
  // Section spéciale
  const specials = STICKERS.filter(s=>s.special);
  const specialBox = document.getElementById('special-section');
  specialBox.innerHTML = teamSectionHTML('special', '⭐ Cartes spéciales 🇧🇪', specials);
  bindTeamSection(specialBox);

  const filterVal = document.getElementById('team-filter').value.trim().toLowerCase();
  const list = document.getElementById('teams-list');
  list.innerHTML = "";
  TEAMS.filter(t => t.name.toLowerCase().includes(filterVal) || t.code.toLowerCase().includes(filterVal))
    .forEach(team=>{
      const stickers = STICKERS.filter(s=>!s.special && s.teamCode === team.code);
      const div = document.createElement('div');
      div.innerHTML = teamSectionHTML(team.code, flagEmoji(team.iso) + ' ' + team.name, stickers);
      list.appendChild(div.firstElementChild);
    });
  document.querySelectorAll('.team-section').forEach(sec=>bindTeamSection(sec));
}

function teamSectionHTML(id, title, stickers){
  const owned = stickers.filter(s=>getCount(s.code)>0).length;
  const isOpen = openSections.has(id);
  return `
  <div class="team-section ${isOpen ? 'open' : ''}" id="section-${id}">
    <div class="team-header">
      <h3>${title}</h3>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="team-progress-mini">${owned}/${stickers.length}</span>
        <span class="chevron">▶</span>
      </div>
    </div>
    <div class="team-body">
      <div class="sticker-grid">
        ${stickers.map(stickerTileHTML).join('')}
      </div>
    </div>
  </div>`;
}

function stickerTileHTML(s){
  const count = getCount(s.code);
  const cls = count===0 ? '' : (count===1 ? 's-owned' : 's-double');
  return `<div class="sticker-tile ${cls}" data-code="${s.code}">
      ${count>1 ? `<button class="dup-badge" data-action="dec" data-code="${s.code}" title="Retirer un double">x${count}</button>` : ''}
      <span class="t-code">${s.code}</span>
      <span class="t-name">${escapeHtml(shortName(s))}</span>
      ${count>=1 ? `<button class="dup-add" data-action="inc" data-code="${s.code}" title="J'en ai un double">+</button>` : ''}
    </div>`;
}

function shortName(s){
  if(s.special) return s.name.split(' - ')[0].split(' ').slice(0,2).join(' ');
  if(s.name.startsWith('Team')) return s.name;
  return s.name;
}

function bindTeamSection(root){
  const section = root.classList && root.classList.contains('team-section') ? root : root.querySelector('.team-section');
  if(!section) return;
  const header = section.querySelector('.team-header');
  header.addEventListener('click', ()=>{
    section.classList.toggle('open');
    const id = section.id.replace('section-', '');
    if(section.classList.contains('open')) openSections.add(id);
    else openSections.delete(id);
  });

  section.querySelectorAll('button.dup-add, button.dup-badge').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const code = btn.dataset.code;
      const cur = getCount(code);
      if(btn.dataset.action === 'inc'){
        setCount(code, cur + 1 < 2 ? 2 : cur + 1);
      } else if(btn.dataset.action === 'dec'){
        setCount(code, Math.max(1, cur - 1));
      }
    });
  });

  section.querySelectorAll('.sticker-tile').forEach(tile=>{
    tile.addEventListener('click', (e)=>{
      if(e.target.closest('button')) return; // géré par les boutons +/x ci-dessus
      const code = tile.dataset.code;
      const cur = getCount(code);
      setCount(code, cur === 0 ? 1 : 0); // bascule simple : j'ai / j'ai pas
    });
  });
}

document.getElementById('team-filter').addEventListener('input', renderAlbum);

// ---------- Échanges ----------
function renderTrade(){
  const doubles = STICKERS.filter(s=>getCount(s.code) > 1);
  const missing = STICKERS.filter(s=>getCount(s.code) === 0);

  document.getElementById('doubles-count').textContent = doubles.length;
  document.getElementById('missing-count').textContent = missing.length;

  const dList = document.getElementById('doubles-list');
  dList.innerHTML = doubles.length ? doubles.map(s=>
    `<div class="trade-row"><span>${s.code} — ${escapeHtml(s.name)}</span><span>x${getCount(s.code)}</span></div>`
  ).join('') : '<div class="trade-empty">Pas encore de doubles 🙂</div>';

  const mList = document.getElementById('missing-list');
  mList.innerHTML = missing.length ? missing.map(s=>
    `<div class="trade-row"><span>${s.code} — ${escapeHtml(s.name)}</span></div>`
  ).join('') : '<div class="trade-empty">Bravo, il ne manque plus rien ! 🏆</div>';
}

function listToText(stickers, withCount){
  return stickers.map(s=> withCount ? `${s.code} - ${s.name} (x${getCount(s.code)})` : `${s.code} - ${s.name}`).join('\n');
}

document.getElementById('copy-doubles').addEventListener('click', ()=>{
  const doubles = STICKERS.filter(s=>getCount(s.code) > 1);
  copyText(listToText(doubles, true), 'copy-doubles');
});
document.getElementById('copy-missing').addEventListener('click', ()=>{
  const missing = STICKERS.filter(s=>getCount(s.code) === 0);
  copyText(listToText(missing, false), 'copy-missing');
});

function copyText(text, btnId){
  const btn = document.getElementById(btnId);
  const original = btn.textContent;
  navigator.clipboard.writeText(text || "(liste vide)").then(()=>{
    btn.textContent = "✅ Copié !";
    setTimeout(()=> btn.textContent = original, 1500);
  }).catch(()=>{
    alert(text || "(liste vide)");
  });
}

// ---------- Réglages / stats ----------
function renderSettings(){
  const ownedCodes = Object.keys(collection);
  const totalOwned = ownedCodes.filter(c=>collection[c]>0).length;
  const totalDoubles = ownedCodes.filter(c=>collection[c]>1).length;
  const totalMissing = TOTAL_STICKERS - totalOwned;
  const pct = Math.round((totalOwned/TOTAL_STICKERS)*100);

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-box"><div class="num">${totalOwned}</div><div class="lbl">Cartes collées</div></div>
    <div class="stat-box"><div class="num">${totalMissing}</div><div class="lbl">Cartes manquantes</div></div>
    <div class="stat-box"><div class="num">${totalDoubles}</div><div class="lbl">Doubles</div></div>
    <div class="stat-box"><div class="num">${pct}%</div><div class="lbl">Album complet</div></div>
  `;
}

document.getElementById('export-btn').addEventListener('click', ()=>{
  const data = {
    app: "panini-wc2026",
    exportedAt: new Date().toISOString(),
    collection
  };
  const blob = new Blob([JSON.stringify(data, null, 1)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `panini-wc2026-sauvegarde-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById('import-input').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (evt)=>{
    try{
      const data = JSON.parse(evt.target.result);
      if(data && data.collection){
        collection = data.collection;
        saveCollection();
        refreshAllViews();
        document.getElementById('import-status').textContent = "✅ Sauvegarde importée avec succès !";
      } else {
        document.getElementById('import-status').textContent = "❌ Fichier invalide.";
      }
    }catch(err){
      document.getElementById('import-status').textContent = "❌ Impossible de lire ce fichier.";
    }
  };
  reader.readAsText(file);
});

document.getElementById('reset-btn').addEventListener('click', ()=>{
  if(confirm("Es-tu sûr de vouloir tout effacer ? Cette action est irréversible !")){
    collection = {};
    history = [];
    saveCollection();
    saveHistory();
    refreshAllViews();
    alert("Collection réinitialisée.");
  }
});

// ---------- Drapeaux ----------
function flagEmoji(iso){
  if(!iso) return '⚽';
  const codePoints = iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

// ---------- Divers ----------
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function refreshAllViews(){
  updateGlobalProgress();
  renderSearchResult(searchInput.value.trim().toUpperCase());
  renderRecent();
  showUndoBar();
  if(document.getElementById('tab-album').classList.contains('active')) renderAlbum();
  if(document.getElementById('tab-trade').classList.contains('active')) renderTrade();
  if(document.getElementById('tab-settings').classList.contains('active')) renderSettings();
}

function updateGlobalProgress(){
  const owned = Object.keys(collection).filter(c=>collection[c]>0).length;
  const pct = Math.round((owned/TOTAL_STICKERS)*100);
  document.getElementById('global-progress-bar').style.width = pct + '%';
  document.getElementById('global-progress-text').textContent = `${owned} / ${TOTAL_STICKERS}`;
}

// ---------- Initialisation ----------
function initApp(){
  loadCollection();
  loadHistory();
  loadRecent();
  updateGlobalProgress();
  renderRecent();
  showUndoBar();
  renderAlbum();
}

// Démarrage
if(checkAuth() && checkFan()){
  showApp();
} else if(checkAuth() && !checkFan()){
  document.getElementById('login-screen').hidden = true;
  document.getElementById('fan-screen').hidden = false;
}
