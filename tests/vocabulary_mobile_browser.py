"""Phone touch targets, compact library and keyboard-size flight viewports."""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:8000')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in (360, 375, 390, 414, 430):
        context = browser.new_context(viewport={'width': width, 'height': 780}, is_mobile=True, has_touch=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(BASE + '/vocabulary.html?view=library')
        def fits(selector, bottom=780):
            box = page.locator(selector).bounding_box()
            assert box and box['x'] >= -1 and box['x'] + box['width'] <= width + 1, (selector, box)
            assert box['y'] >= -1 and box['y'] + box['height'] <= bottom + 1, (width, bottom, selector, box)
        def no_overflow():
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
        no_overflow()
        cards = page.locator('.lib-deck').all()
        assert cards[0].bounding_box()['y'] == cards[1].bounding_box()['y']
        for selector in ('#lib-home', '#lib-search', '#lib-filter', '#lib-size', '#lib-view-decks', '[data-deck="0"]'):
            assert page.locator(selector).bounding_box()['height'] >= 44, selector
        page.locator('[data-deck="0"]').click()
        page.locator('#lib-cards-start').click()
        page.locator('#lib-flip').click()
        for selector in ('#lib-rate-1', '#lib-rate-2', '#lib-rate-3'):
            fits(selector)
            assert page.locator(selector).bounding_box()['height'] >= 44
        no_overflow()
        page.screenshot(path=f'/tmp/ankis-flashcard-{width}.png')
        page.goto(BASE + '/vocabulary.html')
        page.evaluate('''() => {
            const s = JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1'));
            for (const w of VOCABULARY.slice(0, 8)) s.records[w.word] = {learned:true,stage:0,attempts:0,due:0};
            s.guardian.coins = 12345;
            localStorage.setItem('letsstudy-vocabulary-v1', JSON.stringify(s));
        }''')
        page.reload()
        page.locator('#game').click()
        before = page.evaluate("localStorage.getItem('letsstudy-vocabulary-v1')")
        fits('#answer')
        # Resize the content viewport as Android interactive-widget requests.
        for height in (480, 400, 340):
            page.set_viewport_size({'width': width, 'height': height})
            page.wait_for_timeout(100)
            for selector in ('#answer', '#arena', '.flight-clock', '#enemy-meaning', '#game-study', '#pause', '#quit'):
                fits(selector, height)
            assert page.locator('#answer').bounding_box()['height'] >= 44
            no_overflow()
        # Safari can shrink only visualViewport while leaving innerHeight unchanged.
        page.set_viewport_size({'width': width, 'height': 780})
        page.evaluate('''() => {
            Object.defineProperty(visualViewport, 'height', {configurable:true,get:()=>400});
            visualViewport.dispatchEvent(new Event('resize'));
        }''')
        page.wait_for_timeout(100)
        fits('#answer', 400)
        page.screenshot(path=f'/tmp/ankis-keyboard-{width}.png')
        assert page.evaluate("localStorage.getItem('letsstudy-vocabulary-v1')") == before
        page.locator('#answer').focus()
        page.keyboard.press('Shift+Tab')
        fits('#answer', 400)
        fits('#flight-coach', 400)
        # Relearning is still usable; resizing alone must not write progress.
        page.evaluate("delete visualViewport.height; visualViewport.dispatchEvent(new Event('resize'))")
        page.wait_for_timeout(100)
        fits('#answer')
        page.locator('#quit').click()
        assert page.evaluate("JSON.parse(localStorage.getItem('letsstudy-vocabulary-v1')).guardian.coins") == 12345
        assert not errors, errors
        context.close()
    browser.close()
print('PASS: 360/375/390/414/430px, 44px targets, two-column decks, revealed flashcards, 340–480px keyboard viewports, visualViewport-only resize, coaching/input visibility and preserved wallet.')
