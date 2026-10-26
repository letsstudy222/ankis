"""Integration coverage for the persistent Trạm Sao economy and the real arcade UI."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8002')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1280,'height':1000}); errors=[]
 page.on('pageerror',lambda e:errors.append(e.stack))
 page.goto(BASE+'/vocabulary.html')
 assert page.locator('#g-home-name').inner_text()=='Hồ Ly Tinh Vân'
 page.locator('#g-open').click();assert page.locator('#guardian-dialog').is_visible()
 page.locator('[data-tab="shop"]').click();assert page.locator('[data-item="ship-kite"]').is_disabled()
 page.keyboard.press('Escape');assert not page.locator('#guardian-dialog').is_visible()
 # Seed only familiarization, not coins or game achievements.
 page.evaluate("""() => {const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));for(const w of VOCABULARY.slice(0,20))s.records[w.word]={learned:true,stage:0,attempts:0,due:0};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload();page.locator('#game').click()
 for i in range(15):
  if i==9:assert page.locator('#g-boss-label').is_visible()
  word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
  page.locator('#answer').press_sequentially(word,delay=1)
  assert page.locator('#next').is_hidden()
  assert page.locator('#answer').input_value()==''
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert state['guardian']['cleanClears']==15
 assert state['guardian']['xp']==180
 assert state['guardian']['coins']==120
 assert len(state['guardian']['activeDays'])==1
 assert state['guardian']['bestCombo']==15
 assert '15 đúng' in page.locator('#g-combo').inner_text()
 # A typo breaks the combo; fixing the answer still advances and awards base points.
 word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
 page.locator('#answer').fill('zzzz');assert page.locator('#g-combo').inner_text()=='×1'
 page.locator('#answer').fill(word)
 assert page.locator('#answer').input_value()==''
 page.locator('#quit').evaluate('(el)=>{el.click();el.click()}');assert page.locator('.g-run-summary').is_visible()
 page.keyboard.press('Enter');page.reload()
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert state['guardian']['totalClears']==16 and state['guardian']['cleanClears']==15
 # Simulate ten days of varied recall with the same production reward model.
 page.evaluate("""() => {const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));for(let day=1;day<=10;day++)for(const w of VOCABULARY.slice(0,40))GuardianModel.reward(s.guardian,{word:w.word,clean:true,due:false,score:700,combo:20,date:'2026-09-'+String(day).padStart(2,'0')});GuardianNursery.receive(s.guardian,'axolotl');GuardianNursery.incubate(s.guardian,'axolotl');for(let i=0;i<60;i++)GuardianModel.reward(s.guardian,{word:VOCABULARY[i%40].word,clean:true,due:false,score:700,combo:20,date:'2026-09-10',random:()=>.99});localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload();page.screenshot(path='/tmp/guardian-home-desktop.png',full_page=True)
 page.locator('#g-open').click();page.locator('#g-pet-name').fill('Mây Nhỏ');page.get_by_role('button',name='Lưu tên',exact=True).click()
 page.locator('.g-small-card').filter(has_text='Kỳ Nhông Ngân Hà').get_by_role('button').click()
 page.locator('[data-tab="shop"]').click();coins_before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.coins")
 page.locator('[data-item="ship-manta"]').click();coins_after=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.coins")
 assert coins_before-coins_after==750
 assert page.locator('[data-item="ship-manta"]').inner_text()=='Đang trang bị'
 page.locator('[data-item="ship-scout"]').click();page.locator('[data-item="ship-manta"]').click()
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.coins")==coins_after
 page.get_by_role('button',name='Bầu trời',exact=True).click();page.locator('[data-item="sky-aurora"]').click()
 page.get_by_role('button',name='Vật thể bay',exact=True).click();page.locator('[data-item="target-jelly"]').click()
 page.screenshot(path='/tmp/guardian-shop-desktop.png')
 page.locator('#g-close').click();assert page.locator('#g-home-name').inner_text()=='Mây Nhỏ'
 page.reload();assert page.locator('#g-home-name').inner_text()=='Mây Nhỏ'
 assert page.locator('#arena').get_attribute('data-sky')=='aurora'
 page.locator('#game').click();assert page.locator('#arena-companion svg').is_visible()
 assert page.locator('#guardian-ship').inner_html().count('path')>=3
 page.locator('#answer').fill('zzz');page.screenshot(path='/tmp/guardian-game-desktop.png')
 page.keyboard.press('Escape');page.keyboard.press('Enter')
 page.locator('#home > details summary').click()
 with page.expect_download() as d:page.locator('#export').click()
 d.value.save_as('/tmp/guardian-backup.json')
 backup=json.loads(Path('/tmp/guardian-backup.json').read_text())
 assert backup['guardian']['equipment']['ship']=='ship-manta'
 assert backup['guardian']['pet']=='axolotl'
 page.on('dialog',lambda dialog:dialog.accept())
 page.locator('#import').set_input_files('/tmp/guardian-backup.json')
 page.get_by_text('Đã khôi phục tiến độ.',exact=True).wait_for()
 assert page.locator('#g-home-name').inner_text()=='Mây Nhỏ'
 invalid=json.loads(json.dumps(backup));invalid['guardian']['equipment']['ship']='unowned-item'
 Path('/tmp/guardian-invalid.json').write_text(json.dumps(invalid))
 page.locator('#import').set_input_files('/tmp/guardian-invalid.json')
 page.get_by_text('Bản sao không hợp lệ. Tiến độ hiện tại được giữ nguyên.',exact=True).wait_for()
 assert page.locator('#g-home-name').inner_text()=='Mây Nhỏ'
 # Small-screen layout and native dialog keyboard focus.
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.locator('#g-open').click();page.locator('[data-tab="pet"]').click()
 assert page.locator('#guardian-dialog').evaluate('(el)=>el.scrollWidth<=el.clientWidth')
 page.screenshot(path='/tmp/guardian-pet-mobile.png')
 page.locator('[data-tab="journey"]').click()
 assert page.locator('.g-expeditions li').count()==6
 assert page.locator('#guardian-dialog').evaluate('(el)=>el.scrollWidth<=el.clientWidth')
 page.keyboard.press('Escape');assert not page.locator('#guardian-dialog').is_visible()
 page.locator('#game').click()
 assert page.locator('#answer').bounding_box()['y']+page.locator('#answer').bounding_box()['height']<=844
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.keyboard.press('Escape')
 assert not errors,errors
 b.close()
print('PASS: real scoring, due bonuses, missions, boss cue, automatic transitions, typo/combo, progression persistence, species unlock after simulated activity, purchase/equip, no duplicate charge, actual arena skins, JSON roundtrip, invalid backup rejection, mobile and keyboard dialog.')
