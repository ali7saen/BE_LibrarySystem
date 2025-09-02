function checkSequenceIntegrity(books) {
    // نأخذ فقط الكتب النشطة ونرتبها حسب book_sequence ASC
    const activeBooks = books
        .filter(book => book.is_active)
        .sort((a, b) => (a.book_sequence ?? 0) - (b.book_sequence ?? 0));

    const seen = new Map();
    const issues = [];
    let expectedSequence = 1;

    for (let i = 0; i < activeBooks.length; i++) {
        const book = activeBooks[i];
        const currentSeq = book.book_sequence;

        // تحقق من التكرار
        if (seen.has(currentSeq)) {
            // تكرار: نحتفظ بالأحدث على الرقم (حسب created_at)، ونعلّم الآخر كمكرر
            const existing = seen.get(currentSeq);
            const isNewer =
                new Date(book.created_at).getTime() >
                new Date(existing.created_at).getTime();

            if (isNewer) {
                // الجديد يحل محل القديم
                issues.push({ ...existing, reason: "duplicate" });
                seen.set(currentSeq, book);
            } else {
                // الحالي هو المكرر
                issues.push({ ...book, reason: "duplicate" });
            }
        } else {
            seen.set(currentSeq, book);
        }

        // تحقق من الفجوة
        if (currentSeq > expectedSequence) {
            issues.push({ ...book, reason: "gap" });
            expectedSequence++;
        } else if (currentSeq === expectedSequence) {
            expectedSequence++;
        } else if (currentSeq < expectedSequence) {
            // رقم أقل من المتوقع → ترتيب خاطئ (قد يكون بسبب تزاحم أو حذف سابق)
            issues.push({ ...book, reason: "wrong_order" });
            expectedSequence = currentSeq + 1;
        }
    }

    return issues;
}



module.exports = {
    checkSequenceIntegrity
}; 