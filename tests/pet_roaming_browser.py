"""Background companion stays animated during study without blocking inputs or changing rewards."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1100,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html');assert page.locator('#pet-walker').is_hidden()
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.pets.fox.hatched=true;s.guardian.nursery.eggs=[];s.guardian.nursery.incubator=null;GuardianEquipment.ensure(s.guardian);s.records.recall={learned:true,stage:1,attempts:1,due:Date.now()+86400000};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload();before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");pet=page.locator('#pet-walker')
 assert page.locator('#pet-yard').count()==0;assert pet.is_visible();assert page.locator('#pet-background').evaluate('(e)=>getComputedStyle(e).position')=='fixed';assert page.locator('#pet-background').evaluate('(e)=>getComputedStyle(e).pointerEvents')=='none'
 page.locator('#game').click();initial=pet.evaluate('(e)=>getComputedStyle(e).transform');page.wait_for_function('old=>getComputedStyle(document.querySelector("#pet-walker")).transform!==old',arg=initial);assert pet.locator('svg').evaluate('(e)=>getComputedStyle(e).animationName')=='pet-gait'
 page.locator('#answer').click();assert page.locator('#answer').evaluate('(e)=>document.activeElement===e')
 page.locator('#pet-dock summary').click();page.locator('#pet-walk-toggle').click();paused=pet.evaluate('(e)=>getComputedStyle(e).transform');page.wait_for_timeout(400);assert pet.evaluate('(e)=>getComputedStyle(e).transform')==paused
 page.locator('#pet-pat').click();assert 'vuốt ve' in page.locator('#pet-yard-message').inner_text();page.locator('#pet-call').click()
 pet.focus();pet.press('ArrowRight');pet.press('Enter');assert 'vuốt ve' in page.locator('#pet-yard-message').inner_text()
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert pet.evaluate('e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.top>=0&&b.right<=innerWidth&&b.bottom<=innerHeight}')
 page.emulate_media(reduced_motion='reduce');page.locator('#pet-walk-toggle').click();fixed=pet.evaluate('(e)=>getComputedStyle(e).transform');page.wait_for_timeout(400);assert pet.evaluate('(e)=>getComputedStyle(e).transform')==fixed
 page.reload();after=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");assert before['guardian']==after['guardian'];assert before['records']==after['records'];assert not errors,errors;b.close()
print('PASS: full-screen background, continued walking/gait during study, no input blocking, dock/keyboard interactions, pause/reduced motion/mobile bounds and no reward/save mutation.')
