"""Verify the ticket guarantee through real typing, reload and the visible HUD."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8003')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(e.stack))
 page.goto(BASE+'/vocabulary.html')
 page.evaluate("""() => {const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.records.recall={learned:true,stage:0,attempts:0,due:0};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 def force_dry_spell():
  page.evaluate("() => {const reward=GuardianModel.reward;GuardianModel.reward=(s,a)=>reward(s,{...a,random:()=>.99});}")
 page.reload();force_dry_spell();page.locator('#game').click()
 assert '20 từ đúng nữa' in page.locator('#g-ticket-rate').inner_text()
 assert '5%' in page.locator('#g-ticket-rate').inner_text()
 for _ in range(19):page.locator('#answer').press_sequentially('recall')
 assert '1 từ đúng nữa' in page.locator('#g-ticket-rate').inner_text()
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery.tickets")==10
 page.locator('#answer').fill('wrong');page.locator('#answer').fill('')
 assert '1 từ đúng nữa' in page.locator('#g-ticket-rate').inner_text()
 # Correcting a typo before time runs out still qualifies for the guaranteed ticket.
 page.locator('#answer').press('Enter');assert '1 từ đúng nữa' in page.locator('#g-ticket-rate').inner_text()
 page.locator('#answer').fill('recall');assert '20 đúng' in page.locator('#g-combo').inner_text()
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery.tickets")==11
 assert '20 từ đúng nữa' in page.locator('#g-ticket-rate').inner_text()
 for _ in range(7):page.locator('#answer').press_sequentially('recall')
 page.reload();force_dry_spell();page.locator('#game').click()
 assert '13 từ đúng nữa' in page.locator('#g-ticket-rate').inner_text()
 for _ in range(13):page.locator('#answer').press_sequentially('recall')
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery.tickets")==12
 # Viewing an answer or using a ship hint still cannot earn a word ticket.
 page.keyboard.press('Shift+Tab');page.locator('#answer').fill('recall')
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery.ticketMisses")==0
 page.locator('#answer').focus();page.keyboard.press('Tab');assert page.locator('#answer').input_value()=='r';page.locator('#answer').fill('recall')
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery.ticketMisses")==0
 # Accelerate only this test's next deadline; exercise the production timeout/coaching path.
 page.keyboard.press('Escape');page.locator('#back').click()
 page.evaluate("()=>{window.originalDuration=VocabularyPractice.duration;VocabularyPractice.duration=()=>200}")
 page.locator('#game').click();page.evaluate("()=>{VocabularyPractice.duration=window.originalDuration}")
 page.locator('#flight-coach').wait_for(state='visible')
 page.locator('#answer').fill('recall')
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery.ticketMisses")==0
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery.tickets")==12
 assert not errors,errors
 b.close()
print('PASS: real 20-word guaranteed ticket, capped repeated word, corrected-typo eligibility, no rewards from hints/timeouts, HUD countdown and reload continuation.')
