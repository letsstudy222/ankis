"""New gacha eggs can actually hatch and equip without resetting old saves."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
IDS=['aurora','leviathan','sphinx','moonrabbit','stargazer']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1280,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/pet-art-preview.html#new-rainbow-species');assert page.locator('#new-rainbow-species img').count()==15
 page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('#new-rainbow-species img')].map(async i=>{i.loading='eager';await i.decode();if(i.naturalWidth<1024)throw Error('resolution')}))}")
 page.goto(BASE+'/vocabulary.html');page.evaluate("""()=>{let s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.coins=22000;s.guardian.nursery.tickets=70;for(const id of ['astra','iris','nova','orion','halo'])GuardianNursery.receive(s.guardian,id);for(const w of VOCABULARY.slice(0,40))s.records[w.word]={stage:0,attempts:0,due:0,learned:true};localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload()
 old=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 page.locator('#g-open').click();page.get_by_role('button',name='Rainbow',exact=True).click();assert page.locator('.g-small-card').count()==10
 page.locator('[data-tab="gacha"]').click()
 page.get_by_text('Tỷ lệ từng loài ở lượt tiếp theo',exact=True).click()
 odds=page.locator('.g-probability-list li');assert odds.count()==60
 expected={'normal':3.667,'rare':2,'epic':1.2,'legend':.25,'rainbow':.1}
 for pet in page.evaluate('GuardianModel.pets.map(p=>({name:p.name,rarity:p.rarity}))'):
  text=odds.filter(has_text=pet['name']+':').inner_text();assert abs(float(text.split(': ')[-1].rstrip('%'))-(0 if pet['name'] in ['Tinh Long Vạn Sắc','Hồ Ly Cửu Sắc','Phượng Vũ Cầu Vồng','Thiên Kình Vĩnh Cửu','Kỳ Lân Thiên Quang'] else expected[pet['rarity']]))<.0001,text
 assert abs(sum(float(t.split(': ')[-1].rstrip('%')) for t in odds.all_inner_texts())-100)<.01

 page.evaluate("""()=>{const draw=GuardianNursery.summon;let i=0;GuardianNursery.summon=s=>{let k=0;const values=[.999,0];i++;return draw(s,()=>values[k++])}}""")
 for id in IDS:
  page.locator('#g-summon').click();page.locator('.g-summon-result').wait_for(state='visible');page.locator('#g-ack').click()
 bought=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 assert bought['guardian']['coins']==22000;assert bought['guardian']['nursery']['tickets']==20;assert bought['records']==old['records'];assert bought['guardian']['nursery']['pets']['fox']==old['guardian']['nursery']['pets']['fox']
 for id in IDS:assert id in bought['guardian']['nursery']['eggs']
 page.locator('[data-tab="eggs"]').click()
 page.get_by_role('button',name='Cất trứng / đổi trứng',exact=True).click();page.locator('[data-egg="aurora"]').click();page.keyboard.press('Escape');page.locator('#game').click()
 for _ in range(240):
  word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word");page.locator('#answer').press_sequentially(word,delay=1);assert page.locator('#next').is_hidden()
 page.reload();page.locator('#g-open').click();page.get_by_role('button',name='Rainbow',exact=True).click();card=page.locator('.g-small-card').filter(has=page.locator('[data-species="aurora"]'));card.get_by_role('button').click();page.locator('#g-close').click()
 assert page.locator('#g-home-art [data-species="aurora"][data-pet-art="painted"]').is_visible()
 page.locator('#game').click();assert page.locator('#arena-companion [data-species="aurora"]').is_visible()
 page.reload();assert page.locator('#g-home-art [data-species="aurora"]').is_visible()
 # Both real typing thresholds evolve the active new species and survive reload.
 for level,previous,form in [(8,1,2),(16,2,3)]:
  page.evaluate("""level=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.guardian.nursery.pets.aurora.xp=GuardianModel.threshold(level)-8;for(const w of Object.keys(s.guardian.day.words))delete s.guardian.day.words[w];localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""",level)
  page.reload();page.locator('#game').click();assert page.locator(f'#arena-companion [data-form="{previous}"]').is_visible()
  word=page.evaluate("VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word");page.locator('#answer').press_sequentially(word,delay=1);assert page.locator(f'#arena-companion [data-form="{form}"]').is_visible()
  assert page.locator('#arena-companion image').get_attribute('href').endswith(f'aurora-{form}.png');page.reload();assert page.locator(f'#g-home-art [data-form="{form}"]').is_visible()
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/pet-art-preview.html#new-rainbow-species');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');page.screenshot(path='/tmp/rainbow-expansion-mobile.png',animations='disabled')
 assert not errors,errors;b.close()
print('PASS: fifteen new gallery assets, ten-Rainbow filter, five real gacha acquisitions, old records/coins/fox preserved, actual 240-word hatch and both evolution thresholds and equip/reload/arena, mobile layout.')
