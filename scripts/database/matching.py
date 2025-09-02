import json
from rapidfuzz import process, fuzz

# تحميل الملفات
with open("./authors.json", "r", encoding="utf-8") as f:
    reference_books = json.load(f)

with open("./books.json", "r", encoding="utf-8") as f:
    main_books = json.load(f)

# تجهيز قائمة عناوين المرجع
titles = [b["book_title"] for b in reference_books]

# محاولة مطابقة كل كتاب مع المرجع
for book in main_books:
    title = book["book_title"]
    match, score, idx = process.extractOne(
        title, titles, scorer=fuzz.token_sort_ratio
    )
    if score >= 85:  # نسبة التشابه
        book["book_author"] = reference_books[idx]["book_author"]
    else:
        book["book_author"] = "❓ غير معروف"

# حفظ النتيجة في ملف جديد
with open("books_with_authors.json", "w", encoding="utf-8") as f:
    json.dump(main_books, f, ensure_ascii=False, indent=2)

print("✅ تمت إضافة أسماء المؤلفين إلى الكتب وحفظها في books_with_authors.json")
