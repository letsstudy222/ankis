"""Production sprite loading, rarity form limits, complete-art coverage and save preservation."""
import os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8007')
for name in ['fox','sprout','rabbit','cat','turtle']:
 with Image.open(Path(__file__).resolve().parents[1]/'assets/pets/normal'/f'{name}-1.png') as image:
  assert image.mode=='RGBA'
  assert image.width>=1024 and image.height>=1024
  assert image.getchannel('A').getextrema()[0]==0
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1280,'height':1000});errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(e.stack))
 page.on('response',lambda r:failed.append((r.url,r.status)) if '/assets/pets/' in r.url and r.status not in (200,304) else None)
 page.goto(BASE+'/vocabulary.html')
 page.evaluate("""() => {let s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=7777;s.guardian.nursery.tickets=31;s.guardian.nursery.ticketMisses=7;s.guardian.nursery.pity=12;s.guardian.nursery.pulls=12;for(const pet of GuardianModel.pets){GuardianNursery.receive(s.guardian,pet.id);s.guardian.nursery.pets[pet.id].hatched=true;s.guardian.nursery.pets[pet.id].xp=GuardianModel.threshold(35);}s.guardian.nursery.eggs=[];s.guardian.nursery.incubator=null;s.records.recall={learned:true,stage:1,attempts:1,due:Date.now()+86400000};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload()
 snapshot=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert page.evaluate('GuardianArt.progress().forms')==125
 assert page.evaluate('GuardianArt.progress().totalForms')==125
 assert page.locator('#g-home-art [data-pet-art="painted"]').get_attribute('data-species')=='fox'
 page.locator('#g-open').click()
 assert '60/60 loài · 125/125 hình thái' in page.locator('.g-art-progress').inner_text()
 page.get_by_role('button',name='Normal',exact=True).click()
 assert page.locator('.g-small-card').count()==15
 assert page.locator('.g-small-card [data-pet-art="painted"]').count()==15
 for name in ['fox','sprout','rabbit','cat','turtle']:
  assert page.locator(f'[data-species="{name}"]').count()>=1
  assert page.locator(f'[data-species="{name}"]').first.get_attribute('data-form')=='1'
 # Decode actual production PNGs, not just successful SVG wrapper creation.
 page.evaluate("""async () => {await Promise.all(Object.values(GuardianArt.assets).map(async forms=>{const img=new Image();img.src=forms[1];await img.decode();if(img.naturalWidth<1024)throw Error('sprite resolution');}));}""")
 page.screenshot(path='/tmp/art-normal-collection.png',animations='disabled')
 # XP stays intact while each rarity maps high-level creatures to its own final form.
 for id,forms in [('fox',1),('axolotl',2),('butterfly',2),('dragon',3),('astra',3)]:
  assert page.evaluate('(id)=>GuardianModel.stage(JSON.parse(localStorage.getItem("letsstudy-vocabulary-v1")).guardian,id).index',id)==forms
 page.locator('.g-small-card').filter(has_text='Mèo Trăng Non').get_by_role('button').click()
 assert page.locator('#g-home-art [data-pet-art="painted"]').get_attribute('data-species')=='cat'
 page.locator('#g-close').click();page.locator('#game').click()
 assert page.locator('#arena-companion [data-pet-art="painted"]').get_attribute('data-species')=='cat'
 page.screenshot(path='/tmp/art-normal-game.png',animations='disabled')
 page.keyboard.press('Escape');page.keyboard.press('Enter');page.reload()
 actual=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 for key in ['coins','owned','equipment','xp']:assert actual['guardian'][key]==snapshot['guardian'][key],key
 for key in ['tickets','pity','pulls','ticketMisses','pets']:assert actual['guardian']['nursery'][key]==snapshot['guardian']['nursery'][key],key
 assert actual['records']==snapshot['records']
 # The existing URL is now a truthful production gallery; pending species stay identified.
 page.goto(BASE+'/pet-art-preview.html')
 assert page.locator('.card img').count()==15
 page.evaluate("async () => {await Promise.all([...document.querySelectorAll('.card img')].map(i=>i.decode()));}")
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('.card').first.scroll_into_view_if_needed();page.screenshot(path='/tmp/art-normal-gallery-mobile.png',animations='disabled')
 page.goto(BASE+'/vocabulary.html');page.locator('#g-open').click();page.get_by_role('button',name='Rainbow',exact=True).click()
 assert page.locator('.g-small-card [data-pet-art="painted"]').count()==10
 assert 'Hình minh họa cũ' not in page.locator('.g-art-progress').inner_text()
 assert 'Toàn bộ linh thú đã có ảnh mẫu A' in page.locator('.g-art-progress').inner_text()
 assert not errors,errors
 assert not failed,failed
 b.close()
print('PASS: five real-alpha high-resolution sprites, correct SVG image loading in home/collection/arena, 125-form coverage, rarity caps, mobile gallery, complete collection labels, and all currency/XP/ticket/learning data preserved.')
