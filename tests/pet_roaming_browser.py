"""Roaming is bounded, accessible, reduced-motion aware and cannot mutate learning rewards."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1100,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html');assert page.locator('#pet-walker').is_hidden();assert page.locator('#pet-call').is_disabled()
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.pets.fox.hatched=true;s.guardian.nursery.pets.fox.xp=100;s.guardian.nursery.eggs=[];s.guardian.nursery.incubator=null;s.guardian.coins=1234;s.guardian.nursery.tickets=23;s.records.recall={learned:true,stage:1,attempts:1,due:Date.now()+86400000};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload();before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 pet=page.locator('#pet-walker');assert pet.is_visible();assert pet.locator('[data-species="fox"]').count()==1;page.locator('#pet-yard').scroll_into_view_if_needed()
 page.evaluate('Math.random=()=>0');initial=pet.evaluate('(e)=>getComputedStyle(e).transform')
 page.wait_for_function('(old)=>getComputedStyle(document.querySelector("#pet-walker")).transform!==old',arg=initial,timeout=6500)
 page.locator('#pet-walk-toggle').click();assert page.locator('#pet-walk-toggle').get_attribute('aria-pressed')=='false';paused=pet.evaluate('(e)=>getComputedStyle(e).transform');page.wait_for_timeout(3700);assert pet.evaluate('(e)=>getComputedStyle(e).transform')==paused
 pet.focus();pet.press('Enter');assert 'vuốt ve' in page.locator('#pet-yard-message').inner_text();pet.press('ArrowRight');pet.press('ArrowDown')
 page.locator('#pet-call').click();assert 'chạy lại' in page.locator('#pet-yard-message').inner_text()
 page.locator('#pet-yard-floor').click(position={'x':20,'y':20});assert 'hướng bạn chỉ' in page.locator('#pet-yard-message').inner_text();page.wait_for_timeout(3000)
 def bounded():
  return pet.evaluate('e=>{const p=e.getBoundingClientRect(),f=e.parentElement.getBoundingClientRect();return p.left>=f.left-1&&p.top>=f.top-1&&p.right<=f.right+1&&p.bottom<=f.bottom+1}')
 assert bounded()
 page.set_viewport_size({'width':390,'height':844});page.locator('#pet-yard').scroll_into_view_if_needed();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert bounded()
 page.emulate_media(reduced_motion='reduce');page.locator('#pet-walk-toggle').click();fixed=pet.evaluate('(e)=>getComputedStyle(e).transform');page.wait_for_timeout(3700);assert pet.evaluate('(e)=>getComputedStyle(e).transform')==fixed;assert pet.evaluate('(e)=>getComputedStyle(e).transitionDuration')=='0s'
 page.locator('#game').click();assert page.locator('#pet-yard').is_hidden();page.reload()
 after=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");assert before['guardian']==after['guardian'];assert before['records']==after['records'];assert not errors,errors
 b.close()
print('PASS: egg gate, selected companion sprite, real automatic movement, pause, keyboard petting/arrows, recall, bounded floor clicks/mobile, reduced motion, hidden during study and unchanged saved data/rewards.')
