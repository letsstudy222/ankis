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
        page.keyboard.press("Shift+Enter")
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
        draft.fill("Children growng up in low-income families")
        page.set_viewport_size({"width": width, "height": 340})
        page.get_by_role("button", name="Kiểm tra từng từ").tap()
        expect(draft).to_be_focused()
        expect(draft).to_be_in_viewport(ratio=1)
        expect(page.locator(".sentence-expected")).to_have_text("growing")
        expect(page.locator("#sentence-feedback")).not_to_contain_text("low-income")
        assert not errors, errors
        context.close()

    page = browser.new_page()
    page.goto(BASE + "/vocabulary.html?view=sentences")
    draft = page.locator("#sentence-draft")
    feedback = page.locator("#sentence-feedback")
    draft.fill("CHILDREN growing op in low-income families")
    page.get_by_role("button", name="Xem câu mẫu").click()
    draft.press("Enter")
    expect(page.locator("#sentence-reference")).to_be_hidden()
    expect(feedback.locator(".sentence-match")).to_have_text("CHILDREN growing")
    expect(page.locator("#sentence-annotation .sentence-underline")).to_have_text("op")
    expect(feedback.locator(".sentence-expected")).to_have_text("up")
    expect(feedback).not_to_contain_text("low-income")
    assert draft.evaluate("(el) => el.value.slice(el.selectionStart, el.selectionEnd)") == "op"
    masks = feedback.locator(".sentence-masked-tail")
    assert masks.inner_text().split() == [word.replace("_", "*") for word in expected[3:]]
    expect(feedback.locator(".sentence-feedback-line")).to_have_text("CHILDREN growing up " + masks.inner_text())
    page.get_by_text("Khó", exact=True).click()
    expect(masks).to_be_hidden()
    page.get_by_text("Dễ", exact=True).click()
    expect(masks).to_be_visible()
    draft.focus()
    page.keyboard.insert_text("up")
    expect(draft).to_have_value("CHILDREN growing up in low-income families")
    draft.press("Enter")
    expect(feedback.locator(".sentence-match")).to_have_text("CHILDREN growing up in low-income families")
    expect(feedback.locator(".sentence-expected")).to_have_text("often")
    expect(feedback).not_to_contain_text("expenses")

    draft.fill("Children up in")
    page.get_by_role("button", name="Kiểm tra từng từ").click()
    expect(feedback.locator(".sentence-expected")).to_have_text("growing")
    assert draft.evaluate("(el) => [el.selectionStart, el.selectionEnd]") == [9, 9]
    draft.fill("Children very growing up")
    draft.press("Enter")
    expect(page.locator("#sentence-annotation .sentence-underline")).to_have_text("very")
    expect(feedback.locator(".sentence-expected")).to_have_count(0)
    draft.fill(REFERENCE.replace("low-income", "LOW‑INCOME").replace(",", "").rstrip("."))
    draft.press("Enter")
    expect(feedback).to_contain_text("Tất cả các từ đều khớp")
    expect(feedback.locator(".sentence-expected")).to_have_count(0)
    draft.fill(REFERENCE + " Extra")
    draft.press("Enter")
    expect(page.locator("#sentence-annotation .sentence-underline")).to_have_text("Extra")
    draft.fill("Children growin")
    draft.press("Enter")
    expect(page.locator("#sentence-annotation .sentence-underline")).to_have_text("growin")
    expect(feedback.locator(".sentence-expected")).to_have_text("growing")
    assert draft.evaluate("(el) => el.selectionStart === el.selectionEnd && el.selectionEnd === el.value.length")
    page.keyboard.insert_text("g")
    expect(draft).to_have_value("Children growing")
    expect(page.locator("#sentence-annotation")).to_be_hidden()
    draft.fill("")
    expect(feedback).to_be_empty()

    draft.fill("Draft for sentence one.")
    page.get_by_text("Khó", exact=True).click()
    picker = page.get_by_role("navigation", name="Chọn câu luyện")
    expect(picker.get_by_role("link", name="Câu 01")).to_have_attribute("aria-current", "page")
    picker.get_by_role("link", name="Câu 02").click()
    expect(picker.get_by_role("link", name="Câu 02")).to_have_attribute("aria-current", "page")
    expect(page.locator("#sentence-source")).to_have_text(
        "Chẳng hạn, để tiết kiệm chi phí học tập, những đứa trẻ này có thể lựa chọn "
        "mua sách giáo khoa cũ hoặc mượn sách từ thư viện thay vì mua sách mới."
    )
    expect(draft).to_have_value("")
    expect(page.get_by_role("radio", name="Dễ")).to_be_checked()
    expect(page.locator("#sentence-count")).to_have_text("Số từ trong câu mẫu: 26")
    draft.fill("For instanc")
    draft.press("Enter")
    expect(feedback.locator(".sentence-expected")).to_have_text("instance")
    expect(page.locator("#sentence-reference")).to_be_hidden()
    page.get_by_role("button", name="Xem câu mẫu").click()
    expect(page.locator("#sentence-reference-copy")).to_have_text(
        "For instance, these children may choose to buy second-hand textbooks or borrow "
        "them from a library rather than purchase new ones, thereby reducing their educational expenses."
    )
    page.get_by_text("Cấu trúc cần ghi nhớ", exact=True).click()
    expect(page.locator("#sentence-structures dt")).to_have_count(5)
    expect(page.locator("#sentence-structures")).to_contain_text("borrow something from somewhere")
    page.get_by_text("Từ vựng và collocation", exact=True).click()
    expect(page.locator("#sentence-vocabulary dt")).to_have_count(4)
    expect(page.locator("#sentence-vocabulary")).to_contain_text("reduce expenses")
    picker.get_by_role("link", name="Câu 01").click()
    expect(draft).to_have_value("Draft for sentence one.")
    expect(page.get_by_role("radio", name="Khó")).to_be_checked()
    picker.get_by_role("link", name="Câu 02").click()
    page.reload()
    expect(draft).to_have_value("For instanc")
    expect(page.locator("#sentence-reference")).to_be_hidden()

    browser.close()
print("PASS: sentence selection, individual drafts, first-mismatch feedback, and 360–430px keyboard layouts.")
