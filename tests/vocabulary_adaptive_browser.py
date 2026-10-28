"""Arcade memory uses active time and error episodes, survives reload and ignores coaching copies."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8000')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html')
 page.evaluate('''()=>{let s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));for(const w of VOCABULARY.slice(0,8))s.records[w.word]={learned:true,stage:0,attempts:0,due:0};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}''')
 page.reload();page.locator('#game').click()
 def word():return page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
 first=word()
 page.wait_for_timeout(500)
 page.locator('#pause').click();page.wait_for_timeout(1800);page.locator('#pause').click()
 for _ in range(3):
  page.locator('#answer').fill('!');page.locator('#answer').fill('')
 page.locator('#answer').fill(first)
 memory=page.evaluate('(w)=>JSON.parse(localStorage.getItem("letsstudy-vocabulary-v1")).records[w].arcade',first)
 assert memory['samples']==1 and memory['difficulty']>=.35
 assert memory['meanMs']<1800, memory # Paused interval must not count as hesitation.
 following=[]
 for _ in range(3):
  w=word();following.append(w);assert w!=first;page.locator('#answer').fill(w)
 assert len(set(following))==3 and word()==first
 page.keyboard.press('Shift+Tab')
 failed=page.evaluate('(w)=>JSON.parse(localStorage.getItem("letsstudy-vocabulary-v1")).records[w].arcade',first)
 assert failed['samples']==2 and failed['difficulty']>memory['difficulty']
 page.locator('#answer').fill(first)
 assert page.evaluate('(w)=>JSON.parse(localStorage.getItem("letsstudy-vocabulary-v1")).records[w].arcade',first)==failed
 page.reload()
 assert page.evaluate('(w)=>JSON.parse(localStorage.getItem("letsstudy-vocabulary-v1")).records[w].arcade',first)==failed
 assert not errors,errors
 b.close()
print('PASS: corrected errors trigger spaced repetition without reward penalties, active timing excludes pause, coaching recorded once, memory survives reload.')
