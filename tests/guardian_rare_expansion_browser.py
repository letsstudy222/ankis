"""New coin eggs can actually hatch and equip without resetting old saves."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
IDS=['koi','bat','chameleon','seal','peacock']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1280,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/pet-art-preview.html#new-rare-species');assert page.locator('#new-rare-species img').count()==10
 page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('#new-rare-species img')].map(async i=>{i.loading='eager';await i.decode();if(i.naturalWidth<1024)throw Error('resolution')}))}")
 page.goto(BASE+'/vocabulary.html');page.evaluate("""()=>{let s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=22000;s.guardian.nursery.tickets=31;for(const w of VOCABULARY.slice(0,40))s.records[w.word]={stage:0,attempts:0,due:0,learned:true};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload()
 old=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 page.locator('#g-open').click();page.get_by_role('button',name='Rare',exact=True).click();assert page.locator('.g-small-card').count()==15
 page.locator('[data-tab="eggs"]').click()
 for id in IDS:page.locator(f'[data-buyegg="{id}"]').click();assert page.locator(f'[data-egg="{id}"]').is_visible()
 bought=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert bought['guardian']['coins']==3000;assert bought['guardian']['nursery']['tickets']==31;assert bought['records']==old['records'];assert bought['guardian']['nursery']['pets']['fox']==old['guardian']['nursery']['pets']['fox']
 page.get_by_role('button',name='Cất trứng / đổi trứng',exact=True).click();page.locator('[data-egg="koi"]').click();page.keyboard.press('Escape');page.locator('#game').click()
 for _ in range(60):
  word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word");page.locator('#answer').press_sequentially(word,delay=1);assert page.locator('#next').is_hidden()
 page.reload();page.locator('#g-open').click();page.get_by_role('button',name='Rare',exact=True).click();card=page.locator('.g-small-card').filter(has=page.locator('[data-species="koi"]'));card.get_by_role('button').click();page.locator('#g-close').click()
 assert page.locator('#g-home-art [data-species="koi"][data-pet-art="painted"]').is_visible()
 page.locator('#game').click();assert page.locator('#arena-companion [data-species="koi"]').is_visible()
 page.reload();assert page.locator('#g-home-art [data-species="koi"]').is_visible()
 # A real clean answer changes the newly hatched koi to its evolved sprite.
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.pets.koi.xp=GuardianModel.threshold(8)-8;for(const w of Object.keys(s.guardian.day.words))delete s.guardian.day.words[w];localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""")
 page.reload();page.locator('#game').click();assert page.locator('#arena-companion [data-form="1"]').is_visible()
 word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word");page.locator('#answer').press_sequentially(word,delay=1);assert page.locator('#arena-companion [data-form="2"]').is_visible()
 assert page.locator('#arena-companion image').get_attribute('href').endswith('koi-2.png');page.reload();assert page.locator('#g-home-art [data-form="2"]').is_visible()
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/pet-art-preview.html#new-rare-species');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');page.screenshot(path='/tmp/rare-expansion-mobile.png',animations='disabled')
 assert not errors,errors;b.close()
print('PASS: ten new gallery assets, ten-Rare filter, exact shop charges, old records/tickets/fox preserved, actual 60-word hatch and level-eight evolution and equip/reload/arena, mobile layout.')
