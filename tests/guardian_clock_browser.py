"""Keyboard-friendly relearning, readable arena clock and actual upgraded flight time."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1100,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html')
 page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.records.recall={learned:true,stage:0,attempts:0,due:0};s.guardian.coins=50000;s.guardian.gear.hintCharge=1;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload();page.clock.install();page.locator('#game').click()
 clock=page.locator('.flight-clock');digits=page.locator('#flight-time')
 assert digits.get_attribute('data-seconds')=='40';assert digits.inner_text()=='00:40';assert digits.locator('svg').is_visible()
 assert clock.evaluate('e=>e.parentElement.id')=='arena'
 assert clock.evaluate('e=>{const c=e.getBoundingClientRect(),a=e.parentElement.getBoundingClientRect();return c.right<=a.right&&c.right>a.right-20&&c.top>=a.top&&c.top<a.top+20}')
 assert clock.bounding_box()['y']+clock.bounding_box()['height'] <= page.locator('#enemy').bounding_box()['y']
 page.clock.run_for(3000);assert int(digits.get_attribute('data-seconds'))<=38
 page.locator('#pause').click();paused=digits.get_attribute('data-seconds');page.clock.run_for(3000);assert digits.get_attribute('data-seconds')==paused;assert clock.get_attribute('data-mode')=='paused'
 page.locator('#pause').click();page.locator('#answer').focus();page.keyboard.press('Tab');assert page.locator('#answer').input_value()=='r'
 page.keyboard.press('Shift+Tab');assert page.locator('#flight-coach').is_visible();assert clock.get_attribute('data-mode')=='coaching';frozen=digits.get_attribute('data-seconds');page.clock.run_for(3000);assert digits.get_attribute('data-seconds')==frozen
 page.locator('#answer').fill('recall');assert page.locator('#answer').input_value()=='';assert page.locator('#flight-coach').is_hidden()
 page.keyboard.press('Escape');page.locator('#back').click();page.locator('#g-open').click();page.locator('[data-tab="shop"]').click();page.get_by_role('button',name='Bầu trời',exact=True).click()
 for id,bonus in [('sky-midnight',5),('sky-ocean',10),('sky-aurora',15),('sky-solar',20)]:
  button=page.locator(f'[data-item="{id}"]')
  if button.is_enabled():button.click()
  assert page.evaluate('Guardian.timeBonus()')==bonus
 page.locator('#g-close').click();page.locator('#game').click();assert int(digits.get_attribute('data-seconds'))==55
 # The warning state is readable without flashing; native navigation remains on buttons.
 page.clock.run_for(46000);assert int(digits.get_attribute('data-seconds'))<=10;assert 'clock-warning' in clock.get_attribute('class')
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path='/tmp/digital-clock-mobile.png',full_page=True)
 assert page.locator('#answer').bounding_box()['y']+page.locator('#answer').bounding_box()['height']<=844
 assert clock.bounding_box()['y']+clock.bounding_box()['height']<=page.locator('#enemy').bounding_box()['y']
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('#game-study').focus();page.keyboard.press('Shift+Tab');assert page.locator('#flight-coach').is_hidden()
 assert not errors,errors;b.close()
print('PASS: initial 00:40, seven-segment upper-right clock with target clearance, countdown/pause/coaching, Tab hint and Shift+Tab relearning, real sky purchases +5/10/15/20, warning and mobile layout.')
