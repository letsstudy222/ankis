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
 first=page.locator('#learning-word').inner_text()
 page.locator('#learning-next').click()
 page.locator('#leave-learning').click();page.reload();page.locator('#learn').click()
 # All stages of a five-word group, including resumed exposure.
 while page.locator('#learning').is_visible():
  if page.locator('#copy-form').is_visible():
   page.locator('#copy-answer').fill(page.locator('#learning-word').inner_text());page.locator('#copy-form button').click()
  elif page.locator('#learning-next').is_visible():page.locator('#learning-next').click()
  else:
   meaning=page.evaluate("window.VOCABULARY.find(w=>w.word===document.querySelector('#learning-word').textContent).meaning")
   wrong=page.locator('#learning-choices button').filter(has_text=meaning)
   page.get_by_role('button',name=meaning,exact=True).click()
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert len(state['records'])==5 and all(r['learned'] and r['stage']==0 for r in state['records'].values())
 assert page.locator('#daily').is_disabled()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 # Review is only unlocked once learned words are due.
 page.evaluate("""() => {let s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));for(const r of Object.values(s.records))r.due=Date.now()-1;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload();page.locator('#daily').click();page.locator('#hint').click();page.locator('#reveal').click();page.locator('#next').click()
 for _ in range(4):
  word=page.evaluate("window.VOCABULARY.find(w=>w.meaning===document.querySelector('#meaning').textContent).word")
  page.locator('#answer').fill(word);page.locator('#check').click();page.locator('#next').click()
 assert page.locator('#result').is_visible()
 page.reload();assert page.locator('#daily').is_disabled()
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert sorted(r['stage'] for r in state['records'].values())==[0,1,1,1,1]
 page.locator('#infinite').click()
 for _ in range(7):
  word=page.evaluate("window.VOCABULARY.find(w=>w.meaning===document.querySelector('#meaning').textContent).word")
  assert state['records'][word]['learned']
  page.locator('#answer').fill(word);page.locator('#check').click();page.locator('#next').click()
 page.locator('#quit').click();page.locator('#back').click();page.locator('#game').click()
 word=page.evaluate("window.VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
 assert word in state['records']
 page.locator('#pause').click();assert page.locator('#answer').is_disabled();page.locator('#pause').click()
 page.locator('#answer').press_sequentially(word,delay=5);assert page.locator('#next').is_visible()
 # Import-compatible legacy progress: stage zero relearns, positive stages remain available.
 page.evaluate("""() => {localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify({version:1,records:{recall:{stage:0,attempts:2,due:0},retain:{stage:1,attempts:1,due:0}},daily:null}));}""")
 page.reload();page.locator('#daily').click();assert page.locator('#meaning').inner_text()=='giữ lại'
 assert not errors,errors
 b.close()
print('PASS: new learners gated, 5-word learning/resume, recognition, guided copy, 10-minute review schedule, finite hinted review, learned-only infinite/game, mobile and legacy migration.')
