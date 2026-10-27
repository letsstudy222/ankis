"""Equipment preview is free, all sixteen designs render, and purchases reach the live arena."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1200,'height':1000});errors=[];bad=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad.append(r.url) if r.status>=400 else None)
 page.goto(BASE+'/vocabulary.html');page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.records.recall={learned:true,stage:0,attempts:0,due:0};s.guardian.coins=200000;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload();page.locator('#g-open').click();page.locator('[data-tab="shop"]').click()
 before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian")
 for slot,label in [('ship','Tàu bắn'),('sky','Bầu trời'),('target','Vật thể bay'),('trail','Tia bắn')]:
  page.get_by_role('button',name=label,exact=True).click();assert page.locator('.g-shop-card').count()==4
  items=page.evaluate('slot=>GuardianModel.catalog.filter(i=>i.slot===slot).map(i=>({id:i.id,name:i.name}))',slot)
  for item in items:
   page.locator(f'[data-preview="{item["id"]}"]').click()
   assert page.locator('.g-gear-showcase [data-gear-preview]').get_attribute('data-gear-preview')==item['id'];assert page.locator('#g-gear-preview-title').inner_text()==item['name'];assert page.locator('#g-gear-preview-title').evaluate('e=>e===document.activeElement')
   if slot!='sky':assert page.locator('.g-gear-showcase [data-gear-art]').get_attribute('data-gear-art')==item['id']
   else:assert f'gear-{item["id"].split("-")[1]}.svg' in page.locator('.g-gear-showcase .gear-preview-scene').evaluate('e=>getComputedStyle(e).backgroundImage')
  assert page.evaluate('()=>{const ids=[...document.querySelectorAll("svg [id]")].map(e=>e.id);return ids.length===new Set(ids).size}')
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian")==before
 # Previewing an expensive item never changes equipped inventory; buying applies the real art.
 for slot,id in [('ship','ship-phoenix'),('sky','sky-solar'),('target','target-comet'),('trail','trail-sapphire')]:
  page.locator(f'[data-filter="{slot}"]').click();page.locator(f'[data-item="{id}"]').click();assert page.locator(f'[data-gear="{id}"]').get_attribute('class').endswith('is-equipped')
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.coins")==22000
 page.locator('#g-close').click();page.locator('#game').click()
 assert page.locator('#guardian-ship [data-gear-art]').get_attribute('data-gear-art')=='ship-phoenix';assert page.locator('#enemy-art [data-gear-art]').get_attribute('data-gear-art')=='target-comet'
 assert 'gear-solar.svg' in page.locator('#arena').evaluate('e=>getComputedStyle(e).backgroundImage');assert page.locator('#arena').get_attribute('data-trail')=='trail-sapphire';assert page.locator('#laser svg path').count()>=4
 assert page.evaluate('()=>{const s=document.querySelector("#guardian-ship").getBoundingClientRect(),b=document.querySelector("#laser").getBoundingClientRect();return Math.abs(s.x+s.width/2-b.x-b.width/2)<1}')
 meteor=page.locator('#arena .gear-meteor').first
 meteor.evaluate('e=>e.getAnimations()[0].currentTime=1400');assert meteor.evaluate('e=>parseFloat(getComputedStyle(e).opacity)')>0
 page.locator('#answer').press_sequentially('r');assert 'fire' in page.locator('#laser').get_attribute('class');page.locator('#answer').fill('recall');assert page.locator('#answer').input_value()==''
 page.locator('#pause').click();assert meteor.evaluate('e=>getComputedStyle(e).animationPlayState')=='paused';assert page.locator('#guardian-ship .gear-exhaust').evaluate('e=>getComputedStyle(e).animationPlayState')=='paused'
 page.screenshot(path='/tmp/hangar-live-arena.png',full_page=True)
 page.keyboard.press('Escape');page.locator('#back').click();page.set_viewport_size({'width':390,'height':844});page.locator('#g-open').click();page.locator('[data-tab="shop"]').click()
 assert page.locator('#guardian-dialog').evaluate('e=>e.scrollWidth<=e.clientWidth');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('[data-filter="target"]').click();page.locator('[data-preview="target-jelly"]').click();assert page.locator('#g-gear-preview-title').is_visible()
 page.emulate_media(reduced_motion='reduce');assert page.locator('.g-gear-showcase .gear-meteor').first.is_hidden();assert page.locator('.g-gear-showcase .gear-art').evaluate('e=>getComputedStyle(e).animationName')=='none'
 page.locator('[data-tab="eggs"]').click();assert page.locator('[data-egg="fox"]').count()==1
 page.reload();assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.equipment.target")=='target-comet'
 assert not errors,errors;assert not bad,bad;b.close()
print('PASS: all 16 free previews, unique SVG definitions, four sky scenes, ownership unchanged by previews, real prices/purchases/equipped art and beams, aligned ship/laser, meteors/pause, mobile/reduced motion and egg collection regression.')
