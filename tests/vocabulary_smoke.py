"""Run against a static server: BASE_URL=http://127.0.0.1:8001 python3 tests/vocabulary_smoke.py."""
import os
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:8001')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE)
    page.get_by_role('link', name='🚀 Học từ vựng · Mới').click()
    assert page.title() == 'Quỹ đạo từ vựng · LetsStudy'
    assert page.evaluate('window.VOCABULARY.length') == 104
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('#daily').click()
    for n in range(10):
        word = page.evaluate("() => window.VOCABULARY.find(w=>w.meaning===document.querySelector('#meaning').textContent).word")
        page.locator('#answer').fill(word)
        page.locator('#check').click()
        page.locator('#next').click()
    page.locator('#result').wait_for(state='visible')
    state = page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'))")
    assert len(state['daily']['done']) == 10
    assert all(r['stage'] == 1 for r in state['records'].values())
    page.reload()
    assert page.locator('#daily').is_disabled()
    page.locator('#infinite').click()
    page.locator('#answer').fill('incorrect')
    page.locator('#check').click()
    assert 'Chưa đúng' in page.locator('#feedback').inner_text()
    page.locator('#reveal').click()
    assert page.locator('#context').inner_text()
    page.locator('#next').click()
    page.locator('#quit').click()
    page.locator('#back').click()
    page.locator('#game').click()
    word = page.evaluate("() => window.VOCABULARY.find(w=>w.meaning===document.querySelector('#enemy-meaning').textContent).word")
    page.locator('#pause').click()
    assert page.locator('#answer').is_disabled()
    page.locator('#pause').click()
    page.locator('#answer').press_sequentially(word, delay=5)
    assert page.locator('#next').is_visible()
    page.locator('#next').click()
    # Advance animation time deterministically to exercise the collision/game-over path.
    page.evaluate("""() => { const raf=window.requestAnimationFrame; let t=performance.now(); window.requestAnimationFrame=cb=>raf(()=>{t+=10000;cb(t)}); }""")
    page.locator('#result').wait_for(state='visible', timeout=20000)
    assert page.locator('#result-title').inner_text() == 'Chạm vạch rồi!'
    assert not errors, errors
    browser.close()
print('PASS: mobile layout, entry navigation, 10-word daily completion, persistence, wrong answer, reveal/context, arcade typing, pause/resume and collision.')
