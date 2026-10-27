"""BASE_URL=http://127.0.0.1:8002 python3 tests/vocabulary_smoke.py"""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8002')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844}); errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html')
 assert page.locator('#daily').is_disabled() and page.locator('#game').is_disabled()
 page.locator('#learn').click()
 assert page.locator('#learning-word').is_visible()
 assert page.locator('#learning-word').bounding_box()['y'] < 844
 first=page.locator('#learning-word').inner_text()
 page.keyboard.press('Enter')
 page.locator('#leave-learning').click();page.reload();page.locator('#learn').click()
 # All stages of a five-word group, including resumed exposure.
 while page.locator('#learning').is_visible():
  if page.locator('#copy-form').is_visible():
   page.locator('#copy-answer').fill(page.locator('#learning-word').inner_text());page.keyboard.press('Enter')
  elif page.locator('#learning-next').is_visible():page.keyboard.press('Enter')
  else:
   meaning=page.evaluate("window.VOCABULARY.find(w=>w.word===document.querySelector('#learning-word').textContent).meaning")
   choice=page.locator('#learning-choices button').filter(has_text=meaning).first
   page.keyboard.press(choice.get_attribute('aria-keyshortcuts'))
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert len(state['records'])==5 and all(r['learned'] and r['stage']==0 for r in state['records'].values())
 assert page.locator('#daily').is_disabled()
 assert 'đủ một nhóm' in page.locator('#route-title').inner_text()
 assert all(r.get('introducedOn') for r in state['records'].values())
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 # Review is only unlocked once learned words are due.
 page.evaluate("""() => {let s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));for(const r of Object.values(s.records))r.due=Date.now()-1;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload();page.locator('#daily').click();page.locator('#answer').focus();page.keyboard.press('Tab');page.keyboard.press('Tab');assert page.locator('#hint').evaluate('(el)=>el===document.activeElement');page.keyboard.press('Enter');assert page.locator('#answer').input_value();page.keyboard.press('Alt+1');page.keyboard.press('Alt+2');page.keyboard.press('Enter')
 for _ in range(4):
  word=page.evaluate("window.VOCABULARY.find(w=>w.meaning===document.querySelector('#meaning').textContent).word")
  page.locator('#answer').fill(word);page.keyboard.press('Enter');page.keyboard.press('Enter')
 assert page.locator('#result').is_visible()
 page.reload();assert page.locator('#daily').is_disabled()
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert sorted(r['stage'] for r in state['records'].values())==[0,1,1,1,1]
 page.locator('#infinite').click()
 for _ in range(7):
  word=page.evaluate("window.VOCABULARY.find(w=>w.meaning===document.querySelector('#meaning').textContent).word")
  assert state['records'][word]['learned']
  page.locator('#answer').fill(word);page.keyboard.press('Enter');page.keyboard.press('Enter')
 page.locator('#quit').click();page.locator('#back').click();page.locator('#game').click()
 word=page.evaluate("window.VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
 assert word in state['records']
 page.keyboard.press('Alt+4');assert page.locator('#answer').is_disabled();page.keyboard.press('Alt+4')
 for completed in range(1,8):
  word=page.evaluate("window.VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
  page.locator('#answer').press_sequentially(word,delay=5)
  assert page.locator('#next').is_hidden()
  assert page.locator('#answer').input_value()==''
  assert page.locator('#answer').is_enabled()
  assert page.locator('#answer').evaluate('(el)=>el===document.activeElement')
  assert f'{completed} lượt' in page.locator('#progress').inner_text()
  next_word=page.evaluate("window.VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
  assert next_word!=word
 page.keyboard.press('Alt+4');assert page.locator('#answer').is_disabled();page.keyboard.press('Alt+4')
 # Import-compatible legacy progress: stage zero relearns, positive stages remain available.
 page.evaluate("""() => {localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify({version:1,records:{recall:{stage:0,attempts:2,due:0},retain:{stage:1,attempts:1,due:0}},daily:null}));}""")
 page.reload();page.locator('#daily').click();assert page.locator('#meaning').inner_text()=='giữ lại'
 assert not errors,errors
 b.close()
print('PASS: Tab/Enter button activation and Alt shortcuts, keyboard learning/choices/copy/review/hint/reveal/pause,  new learners gated, 5-word learning/resume, recognition, guided copy, 10-minute review schedule, finite hinted review, learned-only infinite/game, mobile and legacy migration.')
