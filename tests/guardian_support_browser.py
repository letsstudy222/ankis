import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1100,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html');page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=200000;s.guardian.nursery.pets.fox.hatched=true;s.guardian.nursery.incubator=null;s.guardian.nursery.eggs=[];s.records.recall={learned:true,stage:0,attempts:0,due:Date.now()+86400000};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload()
 page.locator('#g-open').click();page.locator('[data-tab="shop"]').click()
 for category,id in [('Tàu bắn','ship-phoenix'),('Vật thể bay','target-comet'),('Bầu trời','sky-solar'),('Tia bắn','trail-sapphire')]:
  page.get_by_role('button',name=category,exact=True).click();page.locator(f'[data-item="{id}"]').click();assert page.locator(f'[data-item="{id}"]').inner_text()=='Đang trang bị'
 page.locator('#g-close').click();assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.coins")==22000
 assert page.locator('#pet-yard').count()==0;assert page.locator('#pet-background, #pet-dock').count()==0
 page.locator('#game').click();assert page.locator('#arena-companion').is_visible();assert page.locator('#arena-companion').evaluate('(e)=>getComputedStyle(e).pointerEvents')=='none';assert page.evaluate('Guardian.timeBonus()')==20
 assert '8%' in page.locator('#g-ticket-rate').inner_text()
 for _ in range(5):page.locator('#answer').press_sequentially('recall')
 assert page.locator('#g-ship-hint').is_enabled();assert '1/1' in page.locator('#g-ship-hint').inner_text()
 page.locator('#answer').focus();page.keyboard.press('Tab');assert page.locator('#answer').input_value()=='r';assert page.locator('#answer').evaluate('(e)=>e===document.activeElement')
 assert page.locator('#g-ship-hint').is_disabled();page.keyboard.press('Tab');assert not page.locator('#answer').evaluate('(e)=>e===document.activeElement')
 page.locator('#answer').fill('recall');saved=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");assert saved['records']['recall']['stage']==0;assert saved['guardian']['gear']['hintCharge']==0;assert saved['guardian']['gear']['hintProgress']==0
 for _ in range(5):page.locator('#answer').press_sequentially('recall')
 page.reload();assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.gear.hintCharge")==1
 page.locator('#game').click();page.locator('#answer').focus();page.keyboard.press('Shift+Tab');assert page.locator('#flight-coach').is_visible();assert page.locator('#answer').input_value()=='';page.locator('#answer').fill('recall')
 page.locator('#answer').focus();page.keyboard.press('Tab');assert page.locator('#answer').input_value()=='r'
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert not errors,errors;b.close()
print('PASS: real shop powers and prices, +3-point ticket HUD, time bonus, five-word recharge, contextual Tab/Shift+Tab, one charge persisted, assisted review scheduling, arena companion, mobile and keyboard interaction.');
