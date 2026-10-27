"""Companion patrols only inside the Guardian battlefield."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1100,'height':1000}); errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html')
 assert page.locator('#pet-background, #pet-dock, #pet-walker').count()==0
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.pets.fox.hatched=true;s.guardian.nursery.eggs=[];s.guardian.nursery.incubator=null;s.records.recall={learned:true,stage:1,attempts:1,due:Date.now()+86400000};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""")
 page.reload(); before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian")
 pet=page.locator('#arena-companion'); assert pet.is_hidden()
 page.locator('#game').click(); assert pet.is_visible()
 initial=pet.evaluate('e=>getComputedStyle(e).transform')
 page.wait_for_function('old=>getComputedStyle(document.querySelector("#arena-companion")).transform!==old',arg=initial)
 assert pet.evaluate('e=>getComputedStyle(e).pointerEvents')=='none'
 page.locator('#answer').fill('recall');page.wait_for_timeout(100)
 assert pet.evaluate('e=>e.classList.contains("pet-cheer")')
 page.locator('#pause').click();assert pet.evaluate('e=>getComputedStyle(e).animationPlayState')=='paused'
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert pet.locator('svg').evaluate('e=>{const a=document.querySelector("#arena").getBoundingClientRect(),b=e.getBoundingClientRect();return b.left>=a.left&&b.right<=a.right&&b.bottom<=a.bottom}')
 page.emulate_media(reduced_motion='reduce');assert pet.evaluate('e=>getComputedStyle(e).animationName')=='none'
 page.keyboard.press('Escape');assert pet.is_hidden()
 assert page.locator('#pet-dock, #pet-background').count()==0
 assert not errors,errors
 b.close()
print('PASS: no corner pet or dock; arena-only horizontal patrol, clean-answer cheer, pause, mobile bounds and reduced motion.')
