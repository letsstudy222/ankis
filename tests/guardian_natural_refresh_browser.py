"""All Normal are natural; rarity color treatment matches game, gallery and large portraits."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
REVISED=['fox','sprout','rabbit','cat','turtle','penguin','hedgehog','raccoon','otter','seahorse']
TONE={'normal':1,'rare':.68,'epic':.8,'legend':.88,'rainbow':.92}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1280,'height':1000});errors=[];fail=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:fail.append((r.url,r.status)) if ('/assets/pets/' in r.url or 'pet-art-tone' in r.url) and r.status not in (200,304) else None)
 page.goto(BASE+'/vocabulary.html')
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=7288;s.guardian.nursery.tickets=41;s.guardian.nursery.pity=21;s.guardian.nursery.pulls=21;s.guardian.nursery.ticketMisses=13;for(const pet of GuardianModel.pets){GuardianNursery.receive(s.guardian,pet.id);s.guardian.nursery.pets[pet.id].hatched=true;s.guardian.nursery.pets[pet.id].xp=GuardianModel.threshold(35);}s.guardian.nursery.eggs=[];s.guardian.nursery.incubator=null;s.guardian.pet='sprout';s.records.recall={learned:true,stage:3,due:Date.now()+86400000,attempts:5};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""")
 page.reload();before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert page.locator('#g-home-name').inner_text()=='Sóc Nâu'
 assert '/natural-v2/sprout-1.png' in page.locator('#g-home-art image').get_attribute('href')
 assert page.locator('#g-home-art [data-form="1"]').is_visible()
 page.locator('#g-open').click()
 for tier,rarity in [('Normal','normal'),('Rare','rare'),('Epic','epic'),('Legend','legend'),('Rainbow','rainbow')]:
  page.get_by_role('button',name=tier,exact=True).click();sprites=page.locator(f'.g-small-card [data-art-rarity="{rarity}"]');assert sprites.count()==(15 if rarity in ['normal','rare'] else 10)
  assert sprites.first.evaluate('(e)=>getComputedStyle(e).filter')==f'saturate({TONE[rarity]})'
 page.get_by_role('button',name='Normal',exact=True).click()
 for id in REVISED:assert f'/natural-v2/{id}-1.png' in page.locator(f'.g-small-card [data-species="{id}"] image').get_attribute('href')
 page.locator('#g-close').click();page.locator('#game').click();assert '/natural-v2/sprout-1.png' in page.locator('#arena-companion image').get_attribute('href')
 page.reload();after=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");assert before['guardian']==after['guardian'];assert before['records']==after['records']
 page.goto(BASE+'/pet-art-preview.html');assert page.locator('main img[data-art-rarity]').count()==125
 for rarity in TONE:
  assert page.locator(f'img[data-art-rarity="{rarity}"]').first.evaluate('(e)=>getComputedStyle(e).filter')==f'saturate({TONE[rarity]})'
 for id in REVISED:
  img=page.locator(f'img[src$="natural-v2/{id}-1.png"]');assert img.count()==1;img.evaluate("async i=>{i.loading='eager';await i.decode();if(i.naturalWidth<1024)throw Error('resolution')}")
 for id,rarity,form in [('sprout','normal',1),('axolotl','rare',2),('wolf','epic',2),('dragon','legend',3),('astra','rainbow',3)]:
  page.goto(BASE+f'/pet-portrait.html?pet={id}&form={form}');img=page.locator('#portrait');img.evaluate('async i=>await i.decode()');assert img.get_attribute('data-art-rarity')==rarity;assert img.evaluate('(e)=>getComputedStyle(e).filter')==f'saturate({TONE[rarity]})'
  if rarity=='rare':page.keyboard.press('ArrowLeft');page.wait_for_url('**form=1');assert page.locator('#forms [aria-current]').inner_text()=='Bậc 1'
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.goto(BASE+'/pet-portrait.html?pet=invalid');assert page.locator('#portrait').is_hidden();assert 'Không tìm thấy' in page.locator('#caption').inner_text()
 after=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");assert before['guardian']==after['guardian'];assert before['records']==after['records'];assert not errors,errors;assert not fail,fail
 b.close()
print('PASS: ten natural replacements, all fifteen Normal, stable selected sprout/XP/wallet/tickets/pity/learning data, coherent tones in game/gallery/large view, keyboard forms, mobile and invalid ID handling.')
