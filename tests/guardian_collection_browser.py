"""Species eggs, silhouette album, ten draws, ticket boundaries and persisted results."""
import os
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:8000')
with sync_playwright() as p:
 b = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
 page = b.new_page(viewport={'width':1280,'height':1000})
 errors=[]
 page.on('pageerror', lambda e: errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html')
 page.evaluate('''() => {let s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.tickets=100;s.guardian.nursery.pity=49;s.guardian.nursery.pulls=49;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s));}''')
 page.reload();page.locator('#g-open').click()
 page.locator('[data-tab="collection"]').click()
 assert page.locator('.g-small-card').count()==60
 assert page.locator('.g-unowned').count()==59
 assert page.locator('.g-unowned > svg').first.evaluate('e=>getComputedStyle(e).filter')=='grayscale(1) brightness(0.22)'
 assert page.locator('.g-small-card[data-species="fox"]').get_attribute('class').find('g-unowned')==-1
 for rarity, count in [('normal',15),('rare',15),('epic',10),('legend',10),('rainbow',10)]:
  page.locator(f'[data-collection-filter="{rarity}"]').click()
  assert page.locator('.g-small-card').count()==count
 page.locator('[data-tab="eggs"]').click()
 assert page.locator('.g-egg[data-species="fox"] image').count()>0
 # Every species egg embeds its own species illustration, not a shared generic egg.
 assert page.evaluate('GuardianModel.pets.every(p=>GuardianArt.draw(p,0,true).includes(GuardianArt.assets[p.id][1]))')
 page.locator('[data-tab="gacha"]').click()
 page.evaluate('''()=>{const draw=GuardianNursery.summonMany;GuardianNursery.summonMany=(s,count)=>draw(s,count,()=>0)}''')
 page.locator('#g-summon-ten').click()
 assert page.locator('.g-summon-result').count()==10
 assert page.locator('.g-summon-result h3').first.inner_text().startswith('Nhận được trứng ')
 assert 'BẢO HIỂM 50' in page.locator('.g-summon-result').first.inner_text()
 assert page.locator('#g-summon-ten').is_disabled()
 assert page.locator('#g-summon').is_disabled()
 state=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery")
 assert state['tickets']==0 and state['pulls']==59 and state['pity']==9
 assert len(state['history'])==10
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('#guardian-dialog').evaluate('e=>e.scrollWidth<=e.clientWidth')
 page.screenshot(path='/tmp/guardian-ten-mobile.png',full_page=True)
 page.locator('#g-ack').click()
 page.locator('[data-tab="collection"]').click()
 page.locator('[data-collection-filter="all"]').click()
 assert page.locator('.g-unowned').count()==58
 page.screenshot(path='/tmp/guardian-album-mobile.png',full_page=True)
 page.reload();page.locator('#g-open').click();page.locator('[data-tab="gacha"]').click()
 assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.nursery")==state
 assert page.locator('#g-summon-ten').is_disabled()
 assert not errors, errors
 b.close()
print('PASS: 60 distinctive eggs, locked/owned album and all rarity filters, x10/100 tickets, sequential pity, explicit species results, acknowledgement, mobile and persistence.')
