import { DEMO_SPECIES, EDITOR_STORAGE_KEY, MOVES, TOTAMMPOL_VARIANTS, getMoveCatalog, getSpeciesCatalog } from '../battle/combat-engine.js';

const TYPES = ['normal', 'grass', 'ice', 'rock', 'flying', 'electric', 'ground', 'steel'];
const DEFAULT_MOVES = {
  mossmoose: ['tackle', 'leaf_peck', 'growl', 'growth'], branchler: ['tackle', 'leaf_peck', 'growl', 'bough_rush'],
  taigant: ['tackle', 'leaf_peck', 'growl', 'canopy_crash'], cubice: ['tackle', 'growl', 'frost_paw', 'snow_guard'],
  jadekid: ['tackle', 'rock_throw', 'growl', 'jade_guard'], nephram: ['tackle', 'rock_throw', 'stone_horn', 'jade_guard'],
  totammpol: ['tackle', 'growl', 'growth', 'wing_gust'],
};
const $ = (selector) => document.querySelector(selector);
const list = $('#entry-list'); const form = $('#editor-form'); const fields = $('#form-fields');
const title = $('#form-title'); const kicker = $('#form-kicker'); const saveState = $('#save-state');
const newButton = $('#new-entry'); const resetButton = $('#reset-entry'); const deleteButton = $('#delete-entry');
let tab = 'species'; let selectedId = Object.keys(DEMO_SPECIES)[0]; let creating = false;
let pendingArtwork = { front: null, rear: null, highFront: null, highRear: null };
let activeTotammpolVariant = 'eagle-bear-goat';

function readSaved() {
  try { return JSON.parse(localStorage.getItem(EDITOR_STORAGE_KEY) || '{"moves":{},"species":{}}'); }
  catch { return { moves: {}, species: {} }; }
}
function writeSaved(data) { localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(data)); }
const slug = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const optionList = (items, selected, blank = false) => `${blank ? '<option value="">None</option>' : ''}${items.map((item) => `<option value="${item}" ${item === selected ? 'selected' : ''}>${item.replaceAll('_', ' ')}</option>`).join('')}`;
const field = (label, id, value, type = 'text', attrs = '', wide = false) => `<label class="${wide ? 'wide' : ''}">${label}<input id="${id}" name="${id}" type="${type}" value="${value ?? ''}" ${attrs}></label>`;
const select = (label, id, options, value, blank = false) => `<label>${label}<select id="${id}" name="${id}">${optionList(options, value, blank)}</select></label>`;
const ASSET_REVISION = '20261005e';
const spritePath = (key, view) => {
  if (key === 'totammpol-eagle-bear-goat' && view === 'rear') return '../../assets/totammpol-eagle-bear-goat-sprite-rear-aligned-transparent.png?v=20261005j';
  return `../../assets/${key}-sprite-${view}-transparent.png${key.startsWith('totammpol-') ? `?v=${ASSET_REVISION}` : ''}`;
};
const highQualityPath = (key, view) => {
  if (key.startsWith('totammpol-')) return `../../assets/${key}-battle-art-${view}-transparent.png?v=20261006b`;
  if (['mossmoose', 'jadekid', 'nephram'].includes(key)) return `../../assets/${key}-battle-art-${view}-transparent.png`;
  if (key === 'cubice') return `../../assets/concepts/cubice-${view}-concept-v2.png`;
  if (key === 'icebearg' && view === 'front') return '../../assets/concepts/icebearg-front-concept-v2.png';
  if (key === 'glaciursus' && view === 'front') return '../../assets/concepts/glaciursus-front-concept-v3.png';
  if (key === 'taigant' && view === 'front') return '../../assets/taigant-front-transparent.png';
  return spritePath(key, view);
};
const artworkPanel = (item) => {
  const key = item.spriteKey || item.id || 'mossmoose';
  const card = (slot, label, fallback) => {
    const property = `artwork${slot[0].toUpperCase()}${slot.slice(1)}`; const custom = item[property];
    return `<div class="artwork-card"><span>${label}</span><div class="artwork-preview"><img id="${slot}-preview" src="${custom || fallback}" alt="${label} of ${item.name || 'new Rorymon'}"></div><label class="upload-button">Upload replacement<input id="${slot}-upload" type="file" accept="image/png,image/jpeg,image/webp"></label><button class="clear-artwork" type="button" data-clear-artwork="${slot}" ${custom ? '' : 'hidden'}>Use library artwork</button></div>`;
  };
  return `<section class="artwork-editor wide"><div class="artwork-heading"><strong>Battle artwork</strong><p>Compare both available styles and replace any individual picture.</p></div><h3>Pixel art</h3><div class="artwork-grid">${card('front','Front view',spritePath(key,'front'))}${card('rear','Rear view',spritePath(key,'rear'))}</div><h3>High quality</h3><div class="artwork-grid">${card('highFront','Front view',highQualityPath(key,'front'))}${card('highRear','Rear view',highQualityPath(key,'rear'))}</div><p class="hint">When high-quality artwork is not available yet, its preview uses the pixel version until you upload one. Transparent PNG or WebP images work best.</p></section>`;
};

function catalog() { return tab === 'species' ? getSpeciesCatalog() : getMoveCatalog(); }
function defaults() { return tab === 'species' ? DEMO_SPECIES : MOVES; }

function renderList() {
  const entries = Object.values(catalog()).sort((a, b) => a.name.localeCompare(b.name));
  list.replaceChildren(...entries.map((entry) => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.id = entry.id;
    button.className = entry.id === selectedId && !creating ? 'active' : '';
    button.innerHTML = `<strong>${entry.name}</strong><small>${tab === 'species' ? `${entry.type}${entry.secondaryType ? ` / ${entry.secondaryType}` : ''}` : `${entry.type} · ${entry.kind}`}</small>`;
    return button;
  }));
}

function renderSpecies(entry = null) {
  const item = entry ?? { id: '', name: '', type: 'normal', secondaryType: '', level: 5, maxHp: 40, attack: 20, defense: 20, speed: 20, catchRate: 0.3, spriteKey: 'mossmoose', moves: ['tackle', 'growl'] };
  const moveIds = Object.keys(getMoveCatalog()); const chosen = item.moves ?? DEFAULT_MOVES[item.id] ?? ['tackle', 'growl', 'growth', 'leaf_peck'];
  const artworkChoices = [...new Set(Object.values(DEMO_SPECIES).map((species) => species.spriteKey || species.id))];
  const isTotammpol = item.id === 'totammpol';
  const variantKeys = TOTAMMPOL_VARIANTS.map(({ key }) => key);
  if (!variantKeys.includes(activeTotammpolVariant)) activeTotammpolVariant = variantKeys[0];
  const variantArtwork = isTotammpol ? (item.variantArtwork?.[activeTotammpolVariant] || {}) : null;
  const artItem = isTotammpol ? {
    ...item, spriteKey: `totammpol-${activeTotammpolVariant}`,
    artworkFront: variantArtwork.front, artworkRear: variantArtwork.rear,
    artworkHighFront: variantArtwork.highFront, artworkHighRear: variantArtwork.highRear,
  } : item;
  pendingArtwork = { front: artItem.artworkFront || null, rear: artItem.artworkRear || null, highFront: artItem.artworkHighFront || null, highRear: artItem.artworkHighRear || null };
  const variantSelector = isTotammpol ? `<label class="wide">Totammpöl assembly<select id="totammpolVariant" name="totammpolVariant">${variantKeys.map((key) => `<option value="${key}" ${key === activeTotammpolVariant ? 'selected' : ''}>${key.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' · ')}</option>`).join('')}</select></label><p class="hint">Each assembly has its own four artwork slots. Save before switching after an upload.</p>` : '';
  fields.innerHTML = `${field('Internal ID','id',item.id,'text','required pattern="[a-z0-9_]+"',true)}${field('Name','name',item.name,'text','required')}${select('Primary type','type',TYPES,item.type)}${select('Secondary type','secondaryType',TYPES,item.secondaryType,true)}${field('Starting level','level',item.level,'number','min="1" max="100" required')}${field('Base HP','maxHp',item.maxHp,'number','min="1" max="999" required')}${field('Attack','attack',item.attack,'number','min="1" max="999" required')}${field('Defense','defense',item.defense,'number','min="1" max="999" required')}${field('Speed','speed',item.speed,'number','min="1" max="999" required')}${field('Catch rate (0–1)','catchRate',item.catchRate,'number','min="0.01" max="1" step="0.01" required')}${select('Artwork to reuse','spriteKey',artworkChoices,item.spriteKey || item.id)}${variantSelector}<p class="hint">Choose library artwork or upload original front and rear pictures below.</p>${artworkPanel(artItem)}<fieldset><legend>Starting moves</legend>${[0,1,2,3].map((index) => select(`Move ${index + 1}`,`move${index}`,moveIds,chosen[index] ?? '', index > 0)).join('')}<p class="hint">Only the first move is required. Leave later slots set to None for a smaller starting move set.</p></fieldset>`;
}

function imageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onerror = reject;
    reader.onload = () => {
      const image = new Image(); image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, 640 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderMove(entry = null) {
  const item = entry ?? { id: '', name: '', type: 'normal', kind: 'damage', power: 40, accuracy: 100, maxPp: 20, target: 'opponent', stat: 'attack', stages: -1 };
  const effect = item.effect ?? {};
  fields.innerHTML = `${field('Internal ID','id',item.id,'text','required pattern="[a-z0-9_]+"',true)}${field('Name','name',item.name,'text','required')}${select('Type','type',TYPES,item.type)}${select('Move kind','kind',['damage','status','weather'],item.kind)}${field('Power','power',item.power ?? 0,'number','min="0" max="300"')}${field('Accuracy','accuracy',item.accuracy,'number','min="1" max="100" required')}${field('PP','maxPp',item.maxPp,'number','min="1" max="99" required')}<fieldset><legend>Status move settings</legend>${select('Stat','stat',['attack','defense','speed'],item.stat || 'attack')}${field('Stages','stages',item.stages ?? 1,'number','min="-6" max="6"')}${select('Target','target',['self','opponent'],item.target || 'opponent')}</fieldset><fieldset><legend>Optional secondary effect</legend>${select('Effect','effectKind',['none','status','stage'],effect.kind || 'none')}${select('Condition','effectStatus',['burn','frozen','paralysis','poison','toxic','sleep'],effect.status || 'frozen')}${select('Effect stat','effectStat',['attack','defense','speed'],effect.stat || 'speed')}${field('Effect stages','effectStages',effect.stages ?? 1,'number','min="-6" max="6"')}${field('Chance (0–1)','effectChance',effect.chance ?? 0.1,'number','min="0" max="1" step="0.01"')}${select('Effect target','effectTarget',['self','opponent'],effect.target || 'opponent')}</fieldset>${select('Weather','weather',['sandstorm','hail','snow','strong_winds'],item.weather || 'snow')}`;
}

function renderForm() {
  const entry = creating ? null : catalog()[selectedId];
  kicker.textContent = tab === 'species' ? 'RORYMON' : 'MOVE'; title.textContent = creating ? `New ${tab === 'species' ? 'Rorymon' : 'move'}` : entry?.name ?? 'Choose an entry';
  newButton.textContent = `＋ New ${tab === 'species' ? 'Rorymon' : 'move'}`;
  resetButton.hidden = creating || !defaults()[selectedId]; deleteButton.hidden = !creating && Boolean(defaults()[selectedId]);
  if (tab === 'species') renderSpecies(entry); else renderMove(entry);
  $('#id').readOnly = !creating; saveState.textContent = '';
}
function render() { renderList(); renderForm(); }

function number(name, fallback = 0) { const value = Number(new FormData(form).get(name)); return Number.isFinite(value) ? value : fallback; }
form.addEventListener('submit', (event) => {
  event.preventDefault(); const data = new FormData(form); const id = slug(data.get('id'));
  if (!id) return;
  const saved = readSaved(); saved.moves ??= {}; saved.species ??= {};
  if (creating && catalog()[id]) { saveState.textContent = 'That ID is already in use.'; return; }
  if (tab === 'species') {
    const previous = catalog()[id] || {};
    const species = { id, name: String(data.get('name')).trim(), type: data.get('type'), secondaryType: data.get('secondaryType') || undefined, level: number('level',5), maxHp: number('maxHp',40), attack: number('attack',20), defense: number('defense',20), speed: number('speed',20), catchRate: number('catchRate',0.3), spriteKey: data.get('spriteKey'), moves: [0,1,2,3].map((i)=>data.get(`move${i}`)).filter(Boolean) };
    if (id === 'totammpol') {
      const variantKey = data.get('totammpolVariant') || activeTotammpolVariant;
      species.variantArtwork = { ...(previous.variantArtwork || {}), [variantKey]: { ...pendingArtwork } };
    } else Object.assign(species, { artworkFront: pendingArtwork.front || undefined, artworkRear: pendingArtwork.rear || undefined, artworkHighFront: pendingArtwork.highFront || undefined, artworkHighRear: pendingArtwork.highRear || undefined });
    saved.species[id] = species;
  } else {
    const kind = data.get('kind'); const move = { id, name: String(data.get('name')).trim(), type: data.get('type'), kind, accuracy: number('accuracy',100), maxPp: number('maxPp',20) };
    if (kind === 'damage') move.power = number('power',40);
    if (kind === 'status') Object.assign(move,{ stat:data.get('stat'), stages:number('stages',1), target:data.get('target') });
    if (kind === 'weather') move.weather = data.get('weather');
    if (data.get('effectKind') !== 'none') move.effect = { kind:data.get('effectKind'), chance:number('effectChance',0.1), target:data.get('effectTarget'), ...(data.get('effectKind') === 'status' ? { status:data.get('effectStatus') } : { stat:data.get('effectStat'), stages:number('effectStages',1) }) };
    saved.moves[id] = move;
  }
  writeSaved(saved); selectedId = id; creating = false; render(); saveState.textContent = 'Saved. New battles will use this version.';
});
list.addEventListener('click',(event)=>{const button=event.target.closest('[data-id]');if(!button)return;selectedId=button.dataset.id;creating=false;render();});
newButton.addEventListener('click',()=>{creating=true;render();});
resetButton.addEventListener('click',()=>{const saved=readSaved();delete saved[tab === 'species' ? 'species' : 'moves']?.[selectedId];writeSaved(saved);render();saveState.textContent='Restored to the factory version.';});
deleteButton.addEventListener('click',()=>{if(!creating){const saved=readSaved();delete saved[tab === 'species' ? 'species' : 'moves']?.[selectedId];writeSaved(saved);selectedId=Object.keys(catalog())[0];}creating=false;render();});
document.querySelector('.tabs').addEventListener('click',(event)=>{const button=event.target.closest('[data-tab]');if(!button)return;tab=button.dataset.tab;creating=false;document.querySelectorAll('.tabs button').forEach((item)=>item.classList.toggle('active',item===button));selectedId=Object.keys(catalog())[0];render();});
fields.addEventListener('change', async (event) => {
  if (event.target.id === 'totammpolVariant') {
    activeTotammpolVariant = event.target.value;
    const art = catalog().totammpol?.variantArtwork?.[activeTotammpolVariant] || {};
    pendingArtwork = { front: art.front || null, rear: art.rear || null, highFront: art.highFront || null, highRear: art.highRear || null };
    const key = `totammpol-${activeTotammpolVariant}`;
    for (const slot of ['front','rear','highFront','highRear']) {
      const direction = slot.toLowerCase().endsWith('rear') ? 'rear' : 'front';
      $(`#${slot}-preview`).src = pendingArtwork[slot] || (slot.startsWith('high') ? highQualityPath(key, direction) : spritePath(key, direction));
      $(`[data-clear-artwork="${slot}"]`).hidden = !pendingArtwork[slot];
    }
    saveState.textContent = `${activeTotammpolVariant.replaceAll('-', ' · ')} artwork`;
    return;
  }
  if (event.target.id === 'spriteKey') {
    for (const view of ['front','rear']) if (!pendingArtwork[view]) $(`#${view}-preview`).src = spritePath(event.target.value, view);
    for (const view of ['front','rear']) if (!pendingArtwork[`high${view[0].toUpperCase()}${view.slice(1)}`]) $(`#high${view[0].toUpperCase()}${view.slice(1)}-preview`).src = highQualityPath(event.target.value, view);
    return;
  }
  const match = event.target.id?.match(/^(front|rear|highFront|highRear)-upload$/); if (!match || !event.target.files?.[0]) return;
  const view = match[1];
  try {
    pendingArtwork[view] = await imageData(event.target.files[0]); $(`#${view}-preview`).src = pendingArtwork[view];
    $(`[data-clear-artwork="${view}"]`).hidden = false; saveState.textContent = 'Picture ready. Save changes to keep it.';
  } catch { saveState.textContent = 'That picture could not be read.'; }
});
fields.addEventListener('click', (event) => {
  const button = event.target.closest('[data-clear-artwork]'); if (!button) return;
  const view = button.dataset.clearArtwork; pendingArtwork[view] = null;
  const direction = view.toLowerCase().endsWith('rear') ? 'rear' : 'front';
  $(`#${view}-preview`).src = view.startsWith('high') ? highQualityPath($('#spriteKey').value, direction) : spritePath($('#spriteKey').value, direction); button.hidden = true;
});
render();
