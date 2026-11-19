"""Sentence practice, draft isolation, and phone layouts with a resized keyboard viewport."""
import os
import re

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:8000")
REFERENCE = (
    "Children growing up in low-income families often have to think carefully about "
    "how they spend money, thereby learning to distinguish between essential needs "
    "and unnecessary expenses."
)
DRAFT = "Children in families with limited incomes often budget more carefully.\nThey learn to prioritise essentials."
PROGRESS = "localStorage.getItem('letsstudy-vocabulary-v1')"

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    for width in (360, 375, 390, 414, 430):
        context = browser.new_context(
            viewport={"width": width, "height": 780}, is_mobile=True, has_touch=True
        )
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(BASE + "/vocabulary.html")
        progress_before = page.evaluate(PROGRESS)
        entry = page.get_by_role("button", name="Luyện câu Việt → Anh")
        assert entry.bounding_box()["height"] >= 44
        entry.tap()

        heading = page.get_by_role("heading", name="Luyện câu Việt → Anh")
        expect(heading).to_be_focused()
        expect(page.locator("#home")).to_be_hidden()
        expect(page.locator("#sentence-source")).to_contain_text("Trẻ em lớn lên")
        expect(page.locator("#sentence-topic")).to_have_text("IELTS Writing Task 2 — Family & Education")
        expect(page.locator("#sentence-style")).to_have_text("Phù hợp văn phong Band 7.5+")
        expect(page.locator("#sentence-reference")).to_be_hidden()
        expect(page.locator("#sentence-reference-copy")).to_be_empty()

        masks = page.locator("#sentence-blanks").inner_text().split()
        expected = ["_" * len(re.sub(r"[^A-Za-z]", "", word)) for word in REFERENCE.split()]
        assert masks == expected
        expect(page.locator("#sentence-count")).to_have_text(f"Số từ trong câu mẫu: {len(expected)}")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")

        draft = page.get_by_role("textbox", name="Bài viết tiếng Anh của bạn")
        compare = page.get_by_role("button", name="Đối chiếu với câu mẫu")
        expect(compare).to_be_disabled()
        draft.fill(DRAFT)
        expect(compare).to_be_enabled()
        page.get_by_text("Khó", exact=True).tap()
        expect(page.locator("#sentence-hint")).to_be_hidden()
        expect(draft).to_have_value(DRAFT)
        page.get_by_text("Dễ", exact=True).tap()
        expect(page.locator("#sentence-hint")).to_be_visible()
        expect(draft).to_have_value(DRAFT)

        structures = page.get_by_text("Cấu trúc cần ghi nhớ", exact=True)
        vocabulary = page.get_by_text("Từ vựng và collocation", exact=True)
        expect(page.locator("#sentence-structures")).to_be_hidden()
        expect(page.locator("#sentence-vocabulary")).to_be_hidden()
        structures.tap()
        expect(page.locator("#sentence-structures")).to_contain_text("thereby + V-ing")
        expect(page.locator("#sentence-vocabulary")).to_be_hidden()
        vocabulary.tap()
        structures.tap()
        expect(page.locator("#sentence-structures")).to_be_hidden()
        expect(page.locator("#sentence-vocabulary")).to_contain_text("essential needs")
        expect(page.locator("#sentence-reference")).to_be_hidden()

        page.get_by_role("button", name="Xem câu mẫu").tap()
        expect(page.locator("#sentence-reference-copy")).to_have_text(REFERENCE)
        expect(page.locator("#sentence-comparison")).to_be_hidden()
        page.get_by_role("button", name="Ẩn câu mẫu").tap()
        compare.tap()
        expect(page.locator("#sentence-reference-copy")).to_have_text(REFERENCE)
        assert page.locator("#sentence-comparison-copy").inner_text() == DRAFT
        expect(page.locator("#sentence-comparison")).to_contain_text("được viết đúng theo nhiều cách")
        page.get_by_role("button", name="Ẩn câu mẫu").tap()
        expect(page.locator("#sentence-reference")).to_be_hidden()

        page.get_by_text("Khó", exact=True).tap()
        page.reload()
        expect(draft).to_have_value(DRAFT)
        expect(page.locator("#sentence-hint")).to_be_hidden()
        expect(page.locator("#sentence-reference")).to_be_hidden()
        expect(page.locator("#sentence-vocabulary")).to_be_hidden()

        assert draft.evaluate("(element) => parseFloat(getComputedStyle(element).fontSize)") >= 16
        draft.scroll_into_view_if_needed()
        draft.focus()
        page.set_viewport_size({"width": width, "height": 340})
        expect(draft).to_be_in_viewport(ratio=1)
        page.keyboard.press("End")
        page.keyboard.press("Enter")
        page.keyboard.insert_text("Another line.")
        expect(draft).to_have_value(DRAFT + "\nAnother line.")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")

        page.set_viewport_size({"width": width, "height": 780})
        draft.scroll_into_view_if_needed()
        draft.focus()
        page.evaluate("""() => {
            Object.defineProperty(visualViewport, 'height', { configurable: true, get: () => 340 });
            visualViewport.dispatchEvent(new Event('resize'));
        }""")
        box = draft.bounding_box()
        assert box["y"] >= 0 and box["y"] + box["height"] <= 340, (width, box)
        assert page.evaluate(PROGRESS) == progress_before

        page.get_by_role("link", name="Về khu học").tap()
        expect(entry).to_be_visible()
        entry.tap()
        expect(draft).to_have_value(DRAFT + "\nAnother line.")
        assert not errors, errors
        context.close()

    browser.close()
print("PASS: sentence navigation, word-length hints, independent notes, neutral comparison, draft isolation, and 360–430px keyboard layouts.")
