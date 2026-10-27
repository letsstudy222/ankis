"""Real flight UI: adaptive recall, supported relearning, spaced retries and three shields."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1100,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html');assert 'năm từ mới' in page.locator('#route-title').inner_text()
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));for(const w of VOCABULARY.slice(0,8))s.records[w.word]={learned:true,stage:0,attempts:0,due:0};s.guardian.nursery.ticketMisses=19;s.guardian.gear.hintCharge=1;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""")
 page.reload();assert 'chờ bạn nhớ lại' in page.locator('#route-title').inner_text()
 page.locator('#game').click()
 def word():return page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
 missed=word();before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian")
 page.keyboard.press('Alt+2');assert page.locator('#flight-coach').is_visible();assert missed in page.locator('#coach-word').inner_text();assert page.locator('#flight-time').inner_text()=='HỌC LẠI'
 frozen=page.locator('#enemy').evaluate('e=>e.style.transform');page.wait_for_timeout(250);assert page.locator('#enemy').evaluate('e=>e.style.transform')==frozen
 assert page.locator('#g-ship-hint').is_disabled();page.locator('#answer').focus();page.keyboard.press('Alt+1');assert page.locator('#answer').input_value()==''
 page.locator('#answer').fill(missed)
 after=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert after['guardian']['cleanClears']==before['cleanClears'];assert after['guardian']['coins']==before['coins'];assert after['guardian']['nursery']['tickets']==before['nursery']['tickets'];assert after['guardian']['nursery']['ticketMisses']==19;assert after['guardian']['gear']['hintCharge']==1
 assert after['records'][missed]['stage']==0 and after['records'][missed]['attempts']==1
 assert 0 < after['records'][missed]['due']-page.evaluate('Date.now()') <= 600000
 following=[]
 for _ in range(3):
  current=word();following.append(current);assert current!=missed;page.locator('#answer').fill(current)
 assert len(set(following))==3 and word()==missed
 page.keyboard.press('Escape');assert page.locator('#weak-review').is_visible();assert missed in page.locator('#weak-words').inner_text()
 page.locator('#review-weak').click();assert page.locator('#arena').is_hidden();assert page.locator('#meaning').inner_text()==page.evaluate('w=>VOCABULARY.find(v=>v.word===w).meaning',missed)
 page.locator('#answer').fill(missed);page.keyboard.press('Enter');assert page.locator('#next').is_visible()
 # Exercise actual animation frames and timeout transitions under a virtual browser clock.
 page.goto(BASE+'/vocabulary.html');page.clock.install();page.locator('#speed').select_option('fast');page.locator('#game').click()
 for remaining in [2,1,0]:
  current=word();seconds=int(page.locator('#flight-time').inner_text().rstrip('s'))
  page.clock.run_for((seconds+1)*1000)
  if remaining:
   assert page.locator('#flight-shields').get_attribute('aria-label')==f'{remaining} lá chắn còn lại'
   assert page.locator('#flight-coach').is_visible();assert page.locator('#result').is_hidden()
   state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");attempts=state['records'][current]['attempts'];page.locator('#answer').fill(current)
   assert page.evaluate('w=>JSON.parse(localStorage.getItem("letsstudy-vocabulary-v1")).records[w].attempts',current)==attempts
  else:
   assert page.locator('#result').is_visible();assert page.locator('#weak-review').is_visible();assert 'Về trạm' in page.locator('#result-title').inner_text()
 # Mobile readability, long phrases, reduced motion and no obsolete floating companion.
 page.clock.resume();page.goto(BASE+'/vocabulary.html');page.set_viewport_size({'width':390,'height':844});page.locator('#game').click()
 assert page.locator('#answer').bounding_box()['y']+page.locator('#answer').bounding_box()['height']<=844
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.keyboard.press('Alt+2');assert page.locator('#flight-coach').is_visible();assert page.locator('#answer').bounding_box()['y']+page.locator('#answer').bounding_box()['height']<=844;page.screenshot(path='/tmp/orbit-coach-mobile.png',full_page=True)
 page.emulate_media(reduced_motion='reduce');assert page.locator('#arena .stars').evaluate('e=>getComputedStyle(e).animationName')=='none'
 assert page.locator('#pet-background, #pet-dock').count()==0
 assert not errors,errors;b.close()
print('PASS: study routing, assisted recall without clean rewards/charge consumption, one saved failure, spaced retry, untimed weak-word review, three real timeouts, mobile and reduced motion.')
