"""Legend art loads in gallery, collection and actual typing transitions at both thresholds."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
SPECIES=['dragon','phoenix','serpent','lion','griffin']
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1280,'height':1000});errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(e.stack))
 page.on('response',lambda r:failed.append((r.url,r.status)) if '/assets/pets/' in r.url and r.status not in (200,304) else None)
 page.goto(BASE+'/pet-art-preview.html#legend-batch')
 assert page.locator('#legend-batch .evolution-card').count()==5
 assert page.locator('#legend-batch img').count()==15
 page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('#legend-batch img')].map(async i=>{i.loading='eager';await i.decode();if(i.naturalWidth<1024)throw Error('low resolution')}))}")
 assert '95 / 95' in page.locator('.progress').inner_text()
 page.locator('#dragon').scroll_into_view_if_needed();page.screenshot(path='/tmp/legend-desktop.png',animations='disabled')
 page.goto(BASE+'/vocabulary.html')
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=8888;s.guardian.nursery.tickets=37;s.guardian.nursery.ticketMisses=6;s.guardian.nursery.pity=11;s.guardian.nursery.pulls=11;for(const p of GuardianModel.pets.filter(p=>p.rarity==='legend')){GuardianNursery.receive(s.guardian,p.id);s.guardian.nursery.pets[p.id].hatched=true;s.guardian.nursery.pets[p.id].xp=GuardianModel.threshold(7);s.guardian.nursery.eggs=s.guardian.nursery.eggs.filter(id=>id!==p.id);}s.guardian.pet='dragon';s.records.recall={learned:true,stage:0,due:Date.now()+86400000,attempts:0};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""")
 page.reload();before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 page.locator('#g-open').click();page.get_by_role('button',name='Legend',exact=True).click()
 for species in SPECIES:
  card=page.locator('.g-small-card').filter(has=page.locator(f'[data-species="{species}"]'))
  assert card.locator('[data-form="1"]').count()==1
  assert card.get_by_role('link',name='Xem 3 hình thái ↗',exact=True).get_attribute('href').endswith('#'+species)
 page.locator('#g-close').click();page.reload();after=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert before['guardian']==after['guardian'];assert before['records']==after['records']
 for threshold,previous,form in [(8,1,2),(16,2,3)]:
  page.evaluate("""level=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.pets.dragon.xp=GuardianModel.threshold(level)-8;delete s.guardian.day.words.recall;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""",threshold)
  page.reload();page.locator('#game').click();assert page.locator(f'#arena-companion [data-form="{previous}"]').is_visible()
  page.locator('#answer').press_sequentially('recall');assert page.locator(f'#arena-companion [data-form="{form}"]').is_visible()
  assert f'dragon-{form}-v2.png' in page.locator('#arena-companion image').get_attribute('href');assert page.locator('#next').is_hidden()
  page.reload();assert page.locator(f'#g-home-art [data-form="{form}"]').is_visible()
 for level,form in [(8,2),(16,3)]:
  page.evaluate("""level=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));for(const p of GuardianModel.pets.filter(p=>p.rarity==='legend'))s.guardian.nursery.pets[p.id].xp=GuardianModel.threshold(level);localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""",level)
  page.reload();page.locator('#g-open').click();page.get_by_role('button',name='Legend',exact=True).click();assert page.locator(f'.g-small-card [data-form="{form}"]').count()==10
  for species in SPECIES:
   sprite=page.locator(f'.g-small-card [data-species="{species}"] image')
   assert sprite.get_attribute('href').endswith(f'{species}-{form}-v2.png')
  page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('.g-small-card image')].map(async e=>{const i=new Image();i.src=e.getAttribute('href');await i.decode()}))}")
  page.locator('#g-close').click()
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/pet-art-preview.html#legend-batch')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 for species in SPECIES:
  assert page.locator(f'#{species} figure').count()==3
  assert page.locator(f'#{species} .evolution-triple').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
 page.locator('#lion').scroll_into_view_if_needed();page.screenshot(path='/tmp/legend-mobile.png',animations='disabled')
 assert not errors,errors;assert not failed,failed
 browser.close()
print('PASS: all fifteen Legend images decode; three-form gallery desktop/mobile; both real typing evolution thresholds persist; all five species change with XP; saved data preserved.')
