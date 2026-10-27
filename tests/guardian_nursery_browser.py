"""Real collection UI, money-only shop, hatch, gacha pity/history and backup compatibility."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8003')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1280,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(e.stack))
 page.goto(BASE+'/vocabulary.html')
 page.evaluate("""() => {const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=52000;for(const w of VOCABULARY.slice(0,40))s.records[w.word]={stage:0,attempts:0,due:0,learned:true};s.guardian.nursery.tickets=20;s.guardian.nursery.pity=49;s.guardian.nursery.pulls=49;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}""")
 page.reload();page.locator('#g-open').click();page.locator('[data-tab="shop"]').click()
 # Buy a formerly day/level-locked item on day zero, level one.
 page.locator('[data-item="ship-phoenix"]').click()
 assert page.locator('[data-item="ship-phoenix"]').inner_text()=='Đang trang bị'
 assert 'ngày đồng hành' not in page.locator('#g-dialog-body').inner_text()
 page.locator('[data-tab="eggs"]').click();page.locator('[data-buyegg="sprout"]').click()
 assert page.locator('[data-egg="sprout"]').is_visible()
 page.get_by_role('button',name='Cất trứng / đổi trứng',exact=True).click();page.locator('[data-egg="sprout"]').click()
 page.screenshot(animations='disabled',path='/tmp/nursery-incubator-desktop.png')
 page.keyboard.press('Escape');page.locator('#game').click()
 for i in range(30):
  word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
  page.locator('#answer').press_sequentially(word,delay=1)
  assert page.locator('#next').is_hidden()
 assert '×4' in page.locator('#g-combo').inner_text()
 assert 'lần' in page.locator('#g-ticket-rate').inner_text() and '/20' in page.locator('#g-ticket-rate').inner_text()
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert state['guardian']['nursery']['pets']['sprout']['hatched']
 assert state['guardian']['nursery']['incubator'] is None
 page.keyboard.press('Escape');page.keyboard.press('Enter');page.locator('#g-open').click();page.locator('[data-tab="pet"]').click()
 page.locator('.g-small-card').filter(has_text='Sóc Nâu').get_by_role('button').click()
 assert page.locator('#g-home-name').inner_text()=='Sóc Nâu'
 page.locator('[data-tab="gacha"]').click()
 assert 'Lượt tiếp theo chắc chắn Rainbow' in page.locator('#g-dialog-body').inner_text()
 page.locator('#g-summon').click()
 page.locator('.g-summon-result').wait_for(state='visible')
 assert page.locator('.g-summon-result .g-rarity').inner_text().lower()=='rainbow'
 assert 'BẢO HIỂM 50' in page.locator('.g-summon-result').inner_text()
 assert page.locator('#g-summon').is_disabled() # Ack avoids accidental repeat draws.
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert state['guardian']['nursery']['pity']==0 and state['guardian']['nursery']['pulls']==50
 rainbow=state['guardian']['nursery']['history'][0]['species']
 assert state['guardian']['nursery']['pets'][rainbow]['hatched'] is False
 page.screenshot(animations='disabled',path='/tmp/nursery-rainbow-result.png')
 page.locator('#g-ack').click()
 # Deterministic normal/fox duplicate via the production draw code with an injected test RNG.
 page.evaluate("""() => {const draw=GuardianNursery.summon;GuardianNursery.summon=s=>draw(s,()=>0);}""")
 page.locator('#g-summon').click()
 assert 'Trùng loài → +40 XP' in page.locator('.g-summon-result').inner_text()
 page.locator('#g-ack').click();page.locator('[data-tab="pet"]').click()
 page.get_by_role('button',name='Tất cả',exact=True).click();assert page.locator('.g-small-card').count()==60
 page.get_by_role('button',name='Rainbow',exact=True).click();assert page.locator('.g-small-card').count()==10
 page.locator('.g-small-card').first.scroll_into_view_if_needed();page.screenshot(animations='disabled',path='/tmp/nursery-rainbow-collection.png')
 page.locator('#g-close').click();page.locator('#home > details summary').click()
 with page.expect_download() as d:page.locator('#export').click()
 d.value.save_as('/tmp/nursery-backup.json')
 backup=json.loads(Path('/tmp/nursery-backup.json').read_text());saved=backup['guardian']['nursery']
 page.reload();page.locator('#g-open').click();page.locator('[data-tab="gacha"]').click()
 assert 'Trùng loài → +40 XP' in page.locator('.g-summon-result').inner_text()
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert state['guardian']['nursery']==saved
 page.locator('#g-close').click();page.locator('#home > details summary').click()
 page.on('dialog',lambda d:d.accept());page.locator('#import').set_input_files('/tmp/nursery-backup.json')
 page.get_by_text('Đã khôi phục tiến độ.',exact=True).wait_for()
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert state['guardian']['nursery']==saved
 # Every tab, including detailed rates, fits a narrow screen. Hidden pages cannot start shortcuts.
 page.set_viewport_size({'width':390,'height':844});page.locator('#g-open').click()
 for tab in ['pet','eggs','gacha','shop','journey','rules']:
  page.locator(f'[data-tab="{tab}"]').click()
  assert page.locator('#guardian-dialog').evaluate('(e)=>e.scrollWidth<=e.clientWidth'),tab
 page.locator('[data-tab="gacha"]').click();page.screenshot(animations='disabled',path='/tmp/nursery-gacha-mobile.png')
 page.keyboard.press('Escape');assert not page.locator('#guardian-dialog').is_visible()
 assert not errors,errors
 b.close()
print('PASS: zero-day coin-only purchase, egg purchase/switch/hatch, continuous combo x4, ticket odds HUD, hard-pity Rainbow UI, duplicate species XP, 60/10 collection filters, immutable saved draw result, JSON roundtrip, all mobile tabs and keyboard modal.')
