"""Both Rare forms load in-game and on the old URL, without requiring ownership to compare."""
import os,json
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
RARE=['axolotl','owl','jelly','deer','manta']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1280,'height':1000});errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(e.stack));page.on('response',lambda r:failed.append((r.url,r.status)) if '/assets/pets/' in r.url and r.status not in (200,304) else None)
 page.goto(BASE+'/pet-art-preview.html')
 assert page.locator('.evolution-card').count()==45
 assert page.locator('.evolution-pair img').count()==110
 page.evaluate("async () => {await Promise.all([...document.querySelectorAll('.evolution-pair img')].map(async i=>{i.loading='eager';await i.decode();if(i.naturalWidth<1024)throw Error('low resolution');}));}")
 assert '125 / 125' in page.locator('.progress').inner_text()
 page.locator('#axolotl').scroll_into_view_if_needed();page.screenshot(path='/tmp/rare-comparison-desktop.png',animations='disabled')
 page.goto(BASE+'/vocabulary.html')
 page.evaluate("""() => {const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=8888;s.guardian.nursery.tickets=37;s.guardian.nursery.ticketMisses=6;s.guardian.nursery.pity=11;s.guardian.nursery.pulls=11;for(const p of GuardianModel.pets.filter(p=>p.rarity==='rare')){GuardianNursery.receive(s.guardian,p.id);s.guardian.nursery.pets[p.id].hatched=true;s.guardian.nursery.pets[p.id].xp=GuardianModel.threshold(7);s.guardian.nursery.eggs=s.guardian.nursery.eggs.filter(id=>id!==p.id);}s.guardian.pet='axolotl';s.records.recall={learned:true,stage:0,due:Date.now()+86400000,attempts:0};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload();before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 page.locator('#g-open').click();page.get_by_role('button',name='Rare',exact=True).click()
 assert page.locator('.g-small-card [data-pet-art="painted"]').count()==15
 for species in RARE:
  card=page.locator('.g-small-card').filter(has=page.locator(f'[data-species="{species}"]'))
  assert card.locator('[data-form="1"]').count()==1
  assert card.get_by_role('link',name='Xem 2 hình thái ↗',exact=True).get_attribute('href').endswith('#'+species)
 page.screenshot(path='/tmp/rare-collection-desktop.png',animations='disabled')
 page.locator('#g-close').click();page.reload();after=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert before['guardian']==after['guardian'];assert before['records']==after['records']
 # At just eight XP short of the threshold, one clean real answer evolves the active sprite.
 page.evaluate("""() => {const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.pets.axolotl.xp=GuardianModel.threshold(8)-8;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload();page.locator('#game').click();assert page.locator('#arena-companion [data-form="1"]').is_visible()
 page.locator('#answer').press_sequentially('recall');assert page.locator('#arena-companion [data-form="2"]').is_visible()
 assert 'axolotl-2.png' in page.locator('#arena-companion image').get_attribute('href')
 assert page.locator('#next').is_hidden()
 page.screenshot(path='/tmp/rare-evolved-arena.png',animations='disabled')
 page.reload();assert page.locator('#g-home-art [data-form="2"]').is_visible()
 # All evolved forms switch on reload using existing per-species XP, no new state fields.
 page.evaluate("""() => {const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));for(const id of ['axolotl','owl','jelly','deer','manta'])s.guardian.nursery.pets[id].xp=GuardianModel.threshold(8);localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload();page.locator('#g-open').click();page.get_by_role('button',name='Rare',exact=True).click();assert page.locator('.g-small-card [data-form="2"]').count()==5
 page.locator('#g-close').click();page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/pet-art-preview.html#rare-batch')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert page.locator('.evolution-pair').first.evaluate('(e)=>e.scrollWidth<=e.clientWidth')
 page.locator('#deer').scroll_into_view_if_needed();page.screenshot(path='/tmp/rare-comparison-mobile.png',animations='disabled')
 assert not failed,failed;assert not errors,errors
 b.close()
print('PASS: both forms of all five Rare species, old-URL comparison without ownership, level-8 real typing evolution and reload, saved coins/tickets/XP retained, mobile pairs and no failed sprite requests.')
