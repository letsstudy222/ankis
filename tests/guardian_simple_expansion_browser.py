"""Common-only expansion: buy ten eggs, hatch and evolve using actual typing, preserve saves."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
IDS=['shiba','duck','hamster','frog','sparrow','squirrel','ferret','crab','puffin','gecko']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1280,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/pet-art-preview.html#simple-species');assert page.locator('#simple-species img').count()==15
 page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('#simple-species img')].map(async i=>{i.loading='eager';await i.decode();if(i.naturalWidth<1024)throw Error('resolution')}))}")
 assert page.locator('main img').count()==125
 page.goto(BASE+'/vocabulary.html');page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=22000;s.guardian.nursery.tickets=31;for(const w of VOCABULARY.slice(0,40))s.records[w.word]={stage:0,attempts:0,due:0,learned:true};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload()
 old=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 page.locator('#g-open').click()
 for tier in ['Normal','Rare']:page.get_by_role('button',name=tier,exact=True).click();assert page.locator('.g-small-card').count()==15
 for tier in ['Epic','Legend','Rainbow']:page.get_by_role('button',name=tier,exact=True).click();assert page.locator('.g-small-card').count()==10
 page.locator('[data-tab="eggs"]').click()
 for id in IDS:page.locator(f'[data-buyegg="{id}"]').click();assert page.locator(f'[data-egg="{id}"]').is_visible()
 bought=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");assert bought['guardian']['coins']==5500;assert bought['guardian']['nursery']['tickets']==31;assert bought['records']==old['records'];assert bought['guardian']['nursery']['pets']['fox']==old['guardian']['nursery']['pets']['fox']
 for id,words,tier in [('shiba',30,'Normal'),('squirrel',60,'Rare')]:
  page.get_by_role('button',name='Cất trứng / đổi trứng',exact=True).click() if id=='shiba' else None
  page.locator(f'[data-egg="{id}"]').click();page.keyboard.press('Escape');page.locator('#game').click()
  for _ in range(words):
   word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word");page.locator('#answer').press_sequentially(word,delay=1);assert page.locator('#next').is_hidden()
  page.reload();page.locator('#g-open').click();page.get_by_role('button',name=tier,exact=True).click();page.locator('.g-small-card').filter(has=page.locator(f'[data-species="{id}"]')).get_by_role('button').click();page.locator('#g-close').click();assert page.locator(f'#g-home-art [data-species="{id}"][data-form="1"]').is_visible()
  if id=='shiba':page.locator('#g-open').click();page.locator('[data-tab="eggs"]').click()
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.pets.squirrel.xp=GuardianModel.threshold(8)-8;s.guardian.day.words={};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""")
 page.reload();page.locator('#game').click();word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word");page.locator('#answer').press_sequentially(word,delay=1);assert page.locator('#arena-companion [data-species="squirrel"][data-form="2"]').is_visible();page.reload();assert page.locator('#g-home-art [data-form="2"]').is_visible()
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/pet-art-preview.html#simple-species');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');page.screenshot(path='/tmp/simple-expansion-mobile.png',animations='disabled')
 assert not errors,errors;b.close()
print('PASS: fifteen new simple sprites, 15/15/10/10/10 filters, ten coin purchases, actual Normal/Rare hatching, level-eight evolution, reload, mobile and saved records/wallet/tickets preserved.')
