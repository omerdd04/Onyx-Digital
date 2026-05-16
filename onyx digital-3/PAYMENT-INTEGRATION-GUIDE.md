# מדריך חיבור סליקה — Onyx Digital

ה-`payment.html` כרגע מציג את ממשק התשלום ומחזיר חלון "תודה" — **אבל אין סליקה אמיתית עדיין**. זה demo. הנה איך תחבר תשלום אמיתי:

---

## 1. כרטיסי אשראי — מומלץ Cardcom או Tranzila (ישראל)

### Cardcom (הכי פופולרי בארץ)
1. נרשם ב-https://cardcom.solutions ופותח חשבון סוחר
2. מקבל TerminalNumber + APIKey
3. במקום הטופס שלנו — משלב את **Cardcom Lowprofile** (iframe מוכן)
4. זה הקוד להחליף את ה-`payBtn click`:

```js
fetch('https://secure.cardcom.solutions/api/v11/LowProfile/Create', {
  method:'POST',
  body: JSON.stringify({
    TerminalNumber: 1000, // שלך
    ApiName: 'YOUR_API_NAME',
    Amount: 5990,
    SuccessRedirectUrl: 'https://yoursite.com/success',
    FailedRedirectUrl: 'https://yoursite.com/payment',
    ReturnValue: orderId
  })
}).then(r=>r.json()).then(d=> window.location = d.Url);
```

**עלות:** ~1.5%-2.5% לעסקה + 49₪ לחודש
**זמן הקמה:** 3-5 ימים

### Tranzila (אלטרנטיבה)
- https://www.tranzila.com
- עלות דומה, ממשק קצת יותר פשוט
- תומך ב-bit מובנה

### Stripe (לעסקים בינלאומיים)
- 2.9% + 1₪ לעסקה
- פתרון מהיר אבל הופך כספים מ-USD/EUR

---

## 2. Bit — דרך Cardcom

Cardcom תומך ב-bit כ-payment method. אחרי שיש לך חשבון Cardcom, פשוט מוסיף `Operation: "Bit"` לקריאת ה-API והכל מסתדר.

**אופציה DIY (חינם):** משתמש בעמוד שלנו להציג את מספר הטלפון, הלקוח שולח דרך bit, ואתה מאשר ידנית את ההזמנה. עובד טוב לעסקים קטנים.

---

## 3. PayBox — דומה ל-bit

PayBox API עדיין מוגבל. הדרך הכי פשוטה:
- הצג את מספר הטלפון שלך (כבר מוטמע ב-`payment.html`)
- הלקוח שולח דרך האפליקציה
- אתה רואה את ההעברה ב-PayBox שלך ומאשר ידנית

או — דרך Cardcom גם תומך ב-PayBox מאז 2024.

---

## 4. העברה בנקאית

הוסף את פרטי החשבון ל-`payment.html` בתוך ה-`data-form="transfer"` div. שלח חשבונית מס דרך **iCount** או **Greeninvoice** (אינטגרציה אוטומטית).

---

## 5. שליחה אוטומטית של הזמנה לאימייל שלך

תוסיף את הקוד הזה ל-`payment.html` לפני `successModal.classList.add('active')`:

```js
// EmailJS - חינם עד 200 הודעות בחודש
emailjs.send('service_xxx', 'template_xxx', {
  customer: o.fullName,
  business: o.bizName,
  phone: o.phone,
  email: o.email,
  plan: o.planTier,
  amount: o.price
});
```

נרשם ב-https://emailjs.com (חינם), מקבל service_id + template_id.

---

## 6. אבטחה — חשוב!

- **לעולם** אל תשלח פרטי כרטיס לשרת שלך. תמיד דרך iframe של ספק הסליקה (Cardcom/Tranzila).
- הוסף **HTTPS** (Cloudflare = חינם)
- הוסף **CAPTCHA** (Google reCAPTCHA חינם) לטופס ההזמנה — מונע bots

---

## ההמלצה שלי

**שלב 1:** הפעל את האתר עם DEMO + WhatsApp + bit ידני.
**שלב 2:** אחרי 5-10 הזמנות אמיתיות, פתח חשבון Cardcom וחבר אשראי.
**שלב 3:** הוסף EmailJS להתראות אוטומטיות.

זה ייקח כשבועיים לבד, או יום אחד אם תיתן לי לעשות את זה.

---

**צריך עזרה?** רק תגיד מה אתה מעדיף ואני אטמיע את האינטגרציה ב-`payment.html` ישירות.
