"""Real deck library, keyboard flashcards, assessment and backup/legacy persistence."""
import os,json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8008')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1200,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/vocabulary.html');page.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));s.records.recall={learned:true,stage:2,attempts:3,due:Date.now()+86400000};s.guardian.coins=12345;s.guardian.nursery.ticketMisses=7;localStorage.setItem('letsstudy-vocabulary-v1',JSON.stringify(s))}""");page.reload()
 original=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
 words=page.evaluate('VOCABULARY');page.locator('#library-open').click();assert page.locator('[data-deck]').count()==16
 page.locator('#lib-size').select_option('24');assert page.locator('[data-deck]').count()==8;page.locator('#lib-size').select_option('12')
 page.locator('#lib-view-all').click();assert page.locator('#lib-word-list .lib-word').count()==192
 page.locator('#lib-search').fill('ma sat');assert page.locator('#lib-word-list .lib-word').count()==1;assert 'friction' in page.locator('#lib-word-list').inner_text()
 page.locator('#lib-search').fill('zzzznoresult');assert page.locator('#lib-empty').is_visible();page.locator('#lib-view-decks').click()
 page.locator('[data-deck="0"]').click();assert page.locator('#lib-deck-words .lib-word').count()==12
 page.locator('#lib-shuffle').uncheck();page.locator('#lib-direction').select_option('en');page.locator('#lib-cards-start').click()
 assert page.locator('#lib-card-front').inner_text()==words[0]['word'];assert page.locator('#lib-card-back').is_hidden();assert page.locator('#lib-rating').is_hidden()
 page.keyboard.press('Space');assert page.locator('#lib-card-answer').inner_text()==words[0]['meaning'];page.keyboard.press('3');assert '2 / 12' in page.locator('#lib-practice-progress').inner_text()
 page.keyboard.press('Space');page.keyboard.press('1');page.locator('#lib-stop').click();assert '2/12' in page.locator('#lib-result-copy').inner_text()
 saved=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");assert saved['records']==original['records'];assert saved['guardian']==original['guardian'];assert saved['library']['words'][words[0]['word']]['tests']==0
 page.locator('#lib-result-back').click();page.locator('#lib-direction').select_option('vi');page.locator('#lib-quiz-start').click()
 page.locator('#lib-quiz-answer').fill('wrong');page.keyboard.press('Enter');assert page.locator('#lib-card-back').is_hidden();assert page.locator('#lib-quiz-next').is_hidden()
 page.locator('#lib-quiz-answer').fill(words[0]['word']);page.keyboard.press('Enter');assert page.locator('#lib-quiz-next').is_visible();page.keyboard.press('Enter')
 page.locator('#lib-quiz-reveal').click();assert page.locator('#lib-card-answer').inner_text()==words[1]['word'];page.keyboard.press('Enter')
 for word in words[2:12]:
  page.locator('#lib-quiz-answer').fill(word['word']);page.keyboard.press('Enter');page.keyboard.press('Enter')
 assert page.locator('#lib-result').is_visible();assert '11/12' in page.locator('#lib-result-copy').inner_text();assert words[1]['word'] in page.locator('#lib-result-words').inner_text()
 page.locator('#lib-result-back').click();assert '11/12' in page.locator('#lib-deck-last').inner_text()
 page.locator('#lib-quiz-start').click()
 for word in words[:2]:page.locator('#lib-quiz-answer').fill(word['word']);page.keyboard.press('Enter');page.keyboard.press('Enter')
 page.keyboard.press('Escape');assert '2/2' in page.locator('#lib-result-copy').inner_text();assert '2/12' in page.locator('#lib-result-copy').inner_text()
 page.locator('#lib-home').click();before=page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))");assert before['guardian']==original['guardian'];assert before['records']==original['records'];assert len(before['library']['history'])==2
 page.reload();page.locator('#library-open').click();assert '12 từ đã kiểm tra' in page.locator('#lib-summary').inner_text();page.locator('[data-deck="0"]').click();assert '2/2' in page.locator('#lib-deck-last').inner_text()
 page.locator('#lib-home').click();page.locator('#home > details summary').click()
 with page.expect_download() as d:page.locator('#export').click()
 path='/tmp/library-backup.json';d.value.save_as(path);backup=json.loads(Path(path).read_text());assert backup['library']==before['library']
 legacy=json.loads(json.dumps(backup));del legacy['library'];Path('/tmp/library-legacy.json').write_text(json.dumps(legacy));page.on('dialog',lambda d:d.accept());page.locator('#import').set_input_files('/tmp/library-legacy.json');page.get_by_text('Đã khôi phục tiến độ.',exact=True).wait_for()
 page.locator('#library-open').click();assert '0 từ đã kiểm tra' in page.locator('#lib-summary').inner_text();page.locator('#lib-home').click()
 page.locator('#import').set_input_files(path);page.get_by_text('Đã khôi phục tiến độ.',exact=True).wait_for();assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).library")==backup['library']
 invalid=json.loads(json.dumps(backup));invalid['library']['size']=0;Path('/tmp/library-invalid.json').write_text(json.dumps(invalid));page.locator('#import').set_input_files('/tmp/library-invalid.json');page.get_by_text('Bản sao không hợp lệ. Tiến độ hiện tại được giữ nguyên.',exact=True).wait_for();assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).library")==backup['library']
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/vocabulary.html?view=library');assert page.locator('#library').is_visible();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('[data-deck="0"]').click();page.locator('#lib-cards-start').click();page.keyboard.press('Space');assert page.locator('#lib-rate-3').bounding_box()['y']+page.locator('#lib-rate-3').bounding_box()['height']<=844
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');page.keyboard.press('Escape');page.keyboard.press('Escape');page.keyboard.press('Escape');page.keyboard.press('Escape');assert page.locator('#home').is_visible()
 assert not errors,errors;b.close()
print('PASS: 192-word library, 12/24-word decks, accent search, keyboard two-way flashcards, ratings separate from quiz, typo correction, assisted and partial scoring, persisted history, untouched learning/economy, JSON/legacy roundtrip and invalid backup rejection, deep link and mobile.')
