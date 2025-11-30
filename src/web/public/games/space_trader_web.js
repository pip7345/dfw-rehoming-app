// Space Trader Web Version
// Objective: Earn 1,000,000 credits to buy your dream planet.

const PLANET_COST = 1_000_000;
const STARTING_CREDITS = 5000;
const STARTING_FUEL = 100;
const MAX_CARGO = 1000;
const PUB_DRINK_COST = 50;
const TRAVEL_FUEL_COST = 20;
const FUEL_PRICE = 30;
const SAVE_KEY = 'space_trader_save_v1';

const PLANETS = {
  'Earth Station': { description: 'The homeworld. Safe and boring.', risk: 0.05 },
  'Mars Depot': { description: 'Red planet mining hub.', risk: 0.10 },
  'Jupiter Orbital': { description: 'Gas giant research station.', risk: 0.15 },
  'Asteroid Belt Market': { description: 'Rough and tumble trading post.', risk: 0.25 },
  'Neptune Outpost': { description: 'Remote frontier station. High risk, high reward.', risk: 0.30 },
  'Saturn Ring Exchange': { description: 'Luxury trading center.', risk: 0.08 }
};

const MINERALS = {
  'Tritanium Ore': { base_price: 100, volatility: 0.4 },
  'Nebula Crystals': { base_price: 250, volatility: 0.6 },
  'Quantum Dust': { base_price: 500, volatility: 0.8 },
  'Space Potatoes': { base_price: 50, volatility: 0.3 },
  'Alien Artifacts': { base_price: 800, volatility: 1.0 },
  'Frozen Helium': { base_price: 150, volatility: 0.5 },
  'Asteroid Chunks': { base_price: 75, volatility: 0.35 },
  'Mysterious Goo': { base_price: 400, volatility: 0.7 }
};

const RANDOM_EVENTS = [
  { type: 'pirate', chance: 0.15, message: 'Space pirates demand tribute!' },
  { type: 'bonus', chance: 0.10, message: 'You found abandoned cargo!' },
  { type: 'breakdown', chance: 0.08, message: 'Your ship needs repairs!' },
  { type: 'storm', chance: 0.05, message: 'Solar storm damages cargo!' }
];

function randRange(base, volatility){
  return Math.max(10, Math.floor(base * (1 + (Math.random()*2 - 1) * volatility)));
}

class GameState {
  constructor(){
    this.credits = STARTING_CREDITS;
    this.fuel = STARTING_FUEL;
    this.currentPlanet = 'Earth Station';
    this.cargo = {}; // mineral -> qty
    this.marketPrices = {}; // mineral -> price
    this.day = 1;
    this.ship = { cargoCapacity: MAX_CARGO, fuelCapacity: 100, scanner: false };
    this.totalProfit = 0;
    this.tradesCompleted = 0;
    this.selectedMineral = null;
    this.generateMarket();
  }
  generateMarket(){
    this.marketPrices = {};
    for(const [name, data] of Object.entries(MINERALS)){
      this.marketPrices[name] = randRange(data.base_price, data.volatility);
    }
  }
  cargoUsed(){ return Object.values(this.cargo).reduce((a,b)=>a+b,0); }
  cargoSpace(){ return this.ship.cargoCapacity - this.cargoUsed(); }
  buy(mineral, qty){
    if(!this.marketPrices[mineral]) return [false, 'Mineral not sold here.'];
    const price = this.marketPrices[mineral];
    const cost = price * qty;
    if(cost > this.credits) return [false, 'Not enough credits.'];
    if(qty > this.cargoSpace()) return [false, 'Not enough cargo space.'];
    this.credits -= cost;
    this.cargo[mineral] = (this.cargo[mineral]||0) + qty;
    this.tradesCompleted++;
    return [true, `Bought ${qty} ${mineral} for ${cost} credits.`];
  }
  sell(mineral, qty){
    if(!this.cargo[mineral] || this.cargo[mineral] < qty) return [false, 'Not enough to sell.'];
    if(!this.marketPrices[mineral]) return [false, 'No market for that here.'];
    const revenue = this.marketPrices[mineral] * qty;
    this.credits += revenue;
    this.cargo[mineral] -= qty;
    if(this.cargo[mineral] === 0) delete this.cargo[mineral];
    this.totalProfit += revenue;
    this.tradesCompleted++;
    return [true, `Sold ${qty} ${mineral} for ${revenue} credits.`];
  }
  travel(planet){
    if(planet === this.currentPlanet) return [false, 'Already there.'];
    if(this.fuel < TRAVEL_FUEL_COST) return [false, 'Not enough fuel.'];
    this.fuel -= TRAVEL_FUEL_COST;
    this.currentPlanet = planet;
    this.day++;
    this.generateMarket();
    const eventMsg = this.randomEvent();
    return [true, `Traveled to ${planet}. ${eventMsg}`];
  }
  randomEvent(){
    for(const ev of RANDOM_EVENTS){
      if(Math.random() < ev.chance){
        switch(ev.type){
          case 'pirate':{
            const tribute = Math.floor(this.credits * 0.15);
            this.credits -= tribute;
            return `⚠️ ${ev.message} Lost ${tribute} credits.`;
          }
          case 'bonus':{
            const bonus = Math.floor(200 + Math.random()*300);
            this.credits += bonus;
            return `✨ ${ev.message} Gained ${bonus} credits.`;
          }
          case 'breakdown':{
            const repair = Math.floor(100 + Math.random()*200);
            this.credits -= repair;
            return `🔧 ${ev.message} Repairs cost ${repair} credits.`;
          }
          case 'storm':{
            const keys = Object.keys(this.cargo);
            if(keys.length){
              const mineral = keys[Math.floor(Math.random()*keys.length)];
              const loss = Math.min(this.cargo[mineral], Math.ceil(Math.random()*5));
              this.cargo[mineral] -= loss;
              if(this.cargo[mineral] === 0) delete this.cargo[mineral];
              return `⚡ ${ev.message} Lost ${loss} ${mineral}.`;
            }
          }
        }
        return ev.message;
      }
    }
    return '';
  }
  pubRumor(){
    if(this.credits < PUB_DRINK_COST) return [false, 'Not enough credits for a drink.'];
    this.credits -= PUB_DRINK_COST;
    const otherPlanets = Object.keys(PLANETS).filter(p=>p!==this.currentPlanet);
    const planet = otherPlanets[Math.floor(Math.random()*otherPlanets.length)];
    const mineral = Object.keys(MINERALS)[Math.floor(Math.random()*Object.keys(MINERALS).length)];
    const base = MINERALS[mineral].base_price;
    const vol = MINERALS[mineral].volatility;
    const estimated = randRange(base, vol);
    const currentPrice = this.marketPrices[mineral] || base;
    let text;
    if(estimated > currentPrice * 1.3) text = `Rumor: ${planet} pays BIG for ${mineral}! (~${estimated})`;
    else if(estimated < currentPrice * 0.7) text = `Rumor: ${mineral} is dirt cheap at ${planet}. (~${estimated})`;
    else text = `Rumor: ${mineral} prices at ${planet} are average. (~${estimated})`;
    return [true, `🍺 ${text}`];
  }
  buyFuel(amount){
    const cost = amount * FUEL_PRICE;
    if(cost > this.credits) return [false, 'Not enough credits.'];
    if(this.fuel + amount > this.ship.fuelCapacity) return [false, `Fuel cap ${this.ship.fuelCapacity}.`];
    this.credits -= cost;
    this.fuel += amount;
    return [true, `Bought ${amount} fuel for ${cost} credits.`];
  }
  buyPlanet(){
    if(this.credits >= PLANET_COST) return [true, '🎉 You bought your dream planet!'];
    return [false, `Need ${PLANET_COST - this.credits} more credits.`];
  }
  serialize(){
    return JSON.stringify({
      credits:this.credits,fuel:this.fuel,currentPlanet:this.currentPlanet,cargo:this.cargo,
      marketPrices:this.marketPrices,day:this.day,ship:this.ship,totalProfit:this.totalProfit,
      tradesCompleted:this.tradesCompleted
    });
  }
  deserialize(str){
    try{
      const d = JSON.parse(str);
      Object.assign(this, d);
    }catch(e){ console.warn('Load failed', e); }
  }
}

// --- UI Logic ---
const el = id => document.getElementById(id);
const game = new GameState();

function fmt(num){ return num.toLocaleString('en-US'); }
function log(msg){
  const wrap = document.createElement('div');
  wrap.className = 'entry';
  wrap.textContent = `[Day ${game.day}] ${msg}`;
  el('log-messages').appendChild(wrap);
  el('log-messages').scrollTop = el('log-messages').scrollHeight;
}

function updateStats(){
  const progressPct = ((game.credits / PLANET_COST) * 100).toFixed(1);
  el('stats').innerHTML = `📍 <strong>${game.currentPlanet}</strong> | 💰 Credits: ${fmt(game.credits)} | ⛽ Fuel: ${game.fuel} | 📅 Day: ${game.day}<br>
  📦 Cargo: ${game.cargoUsed()}/${game.ship.cargoCapacity} | 🎯 Planet Progress: ${progressPct}% | 💼 Trades: ${game.tradesCompleted}
  <div class="progress-bar"><span style="width:${Math.min(100, progressPct)}%"></span></div>`;
}

function renderMarket(){
  el('market-planet').innerHTML = `<em>${PLANETS[game.currentPlanet].description}</em>`;
  const ul = el('market-list');
  ul.innerHTML='';
  const entries = Object.entries(game.marketPrices).sort((a,b)=>a[0].localeCompare(b[0]));
  for(const [mineral, price] of entries){
    const li = document.createElement('li');
    li.dataset.mineral = mineral;
    li.innerHTML = `<span>${mineral}</span><span>${price} cr</span>`;
    if(mineral === game.selectedMineral) li.classList.add('selected');
    li.addEventListener('click', ()=>selectFromMarket(mineral));
    ul.appendChild(li);
  }
}

function renderCargo(){
  const ul = el('cargo-list');
  ul.innerHTML='';
  const minerals = Object.entries(game.cargo).sort((a,b)=>a[0].localeCompare(b[0]));
  if(!minerals.length){
    const empty = document.createElement('li');
    empty.textContent = 'Empty cargo hold.';
    ul.appendChild(empty);
    return;
  }
  for(const [mineral, qty] of minerals){
    const valueHere = (game.marketPrices[mineral]||0) * qty;
    const li = document.createElement('li');
    li.dataset.mineral = mineral;
    li.innerHTML = `<span>${mineral} x${qty}</span><span>${valueHere} cr</span>`;
    li.addEventListener('click', ()=>selectFromCargo(mineral));
    ul.appendChild(li);
  }
}

function updateSelectionUI(){
  el('selected-mineral').textContent = game.selectedMineral || '(none)';
  updateCostLabel();
  const active = !!game.selectedMineral;
  el('buy-btn').disabled = !active;
  el('sell-btn').disabled = !active;
}

function updateCostLabel(){
  if(!game.selectedMineral){
    el('total-cost').textContent = 'Select a mineral';
    return;
  }
  const qty = parseInt(el('quantity-input').value,10) || 0;
  const price = game.marketPrices[game.selectedMineral];
  if(!price){ el('total-cost').textContent = 'Not in market'; return; }
  el('total-cost').textContent = `${fmt(price * qty)} credits`;
}

function selectFromMarket(mineral){
  game.selectedMineral = mineral;
  const price = game.marketPrices[mineral];
  const maxAfford = Math.floor(game.credits / price);
  const maxSpace = game.cargoSpace();
  const maxBuy = Math.min(maxAfford, maxSpace);
  el('quantity-input').value = maxBuy > 0 ? maxBuy : 1;
  renderMarket();
  updateSelectionUI();
  log(`Selected ${mineral} - Max buy: ${maxBuy}`);
}
function selectFromCargo(mineral){
  game.selectedMineral = mineral;
  el('quantity-input').value = game.cargo[mineral];
  renderCargo();
  updateSelectionUI();
  log(`Selected ${mineral} - You have: ${game.cargo[mineral]}`);
}

// Actions
el('quantity-input').addEventListener('input', updateCostLabel);

el('buy-btn').addEventListener('click', ()=>{
  const qty = parseInt(el('quantity-input').value,10) || 0;
  if(qty <= 0) return alert('Quantity must be positive');
  const [ok,msg] = game.buy(game.selectedMineral, qty);
  log((ok?'✅ ':'❌ ')+msg);
  if(ok){ renderCargo(); updateStats(); updateSelectionUI(); autoSave(); }
});

el('sell-btn').addEventListener('click', ()=>{
  const qty = parseInt(el('quantity-input').value,10) || 0;
  if(qty <= 0) return alert('Quantity must be positive');
  const [ok,msg] = game.sell(game.selectedMineral, qty);
  log((ok?'✅ ':'❌ ')+msg);
  if(ok){ renderCargo(); updateStats(); updateSelectionUI(); autoSave(); }
});

// Travel modal logic
const travelModal = el('travel-modal');
el('travel-btn').addEventListener('click', ()=>{
  el('fuel-cost').textContent = TRAVEL_FUEL_COST;
  const wrap = el('travel-options');
  wrap.innerHTML = '';
  for(const [planet, data] of Object.entries(PLANETS)){
    if(planet === game.currentPlanet) continue;
    const card = document.createElement('div');
    card.className = 'travel-card';
    card.innerHTML = `<h3>${planet}</h3><p>${data.description}</p><p>Risk: ${(data.risk*100).toFixed(0)}%</p>`;
    card.addEventListener('click', ()=>{
      const [ok,msg] = game.travel(planet);
      log((ok?'🚀 ':'❌ ')+msg);
      travelModal.classList.add('hidden');
      if(ok){ updateStats(); renderMarket(); renderCargo(); updateSelectionUI(); autoSave(); }
    });
    wrap.appendChild(card);
  }
  travelModal.classList.remove('hidden');
});
el('close-travel').addEventListener('click', ()=> travelModal.classList.add('hidden'));

// Pub rumor
el('pub-btn').addEventListener('click', ()=>{
  const [ok,msg] = game.pubRumor();
  log((ok?'📣 ':'❌ ')+msg);
  if(ok){ updateStats(); autoSave(); }
});

// Fuel purchase prompt
const promptModal = el('prompt-modal');
el('fuel-btn').addEventListener('click', ()=>{
  el('prompt-title').textContent = 'Buy Fuel';
  el('prompt-text').textContent = `How much fuel? (30 cr per unit) Current: ${game.fuel}/${game.ship.fuelCapacity}`;
  el('prompt-input').value = 10;
  promptModal.classList.remove('hidden');
});
el('prompt-ok').addEventListener('click', ()=>{
  const amount = parseInt(el('prompt-input').value,10) || 0;
  if(amount <= 0){ alert('Invalid amount'); return; }
  const [ok,msg] = game.buyFuel(amount);
  log((ok?'⛽ ':'❌ ')+msg);
  promptModal.classList.add('hidden');
  if(ok){ updateStats(); autoSave(); }
});
el('prompt-cancel').addEventListener('click', ()=> promptModal.classList.add('hidden'));

// Buy planet
el('planet-btn').addEventListener('click', ()=>{
  const [ok,msg] = game.buyPlanet();
  log(msg);
  if(ok){
    alert(`${msg}\nYou won in ${game.day} days! Trades: ${game.tradesCompleted}`);
    autoSave();
  } else {
    alert(msg);
  }
  updateStats();
});

// Autosave & Restart
function autoSave(){
  localStorage.setItem(SAVE_KEY, game.serialize());
}
el('restart-btn').addEventListener('click', ()=>{
  if(!confirm('Restart game? This will clear saved progress.')) return;
  localStorage.removeItem(SAVE_KEY);
  const fresh = new GameState();
  Object.assign(game, fresh);
  game.selectedMineral = null;
  el('log-messages').innerHTML='';
  log('Game restarted. New game begins.');
  updateStats(); renderMarket(); renderCargo(); updateSelectionUI();
  autoSave();
});

// Init
function init(){
  const saved = localStorage.getItem(SAVE_KEY);
  if(saved){
    game.deserialize(saved);
    log('📂 Loaded previous game.');
  } else {
    log('Welcome to Space Trader! Earn 1,000,000 credits to buy your planet.');
    log('Trade minerals, travel between planets, visit the pub for rumors, beware events.');
  }
  updateStats(); renderMarket(); renderCargo(); updateSelectionUI();
  autoSave();
}
init();
