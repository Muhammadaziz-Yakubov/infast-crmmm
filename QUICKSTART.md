# Tezkor Boshlash Qo'llanmasi

## 1. O'rnatish

```bash
# Barcha paketlarni o'rnatish
npm run install-all
```

## 2. MongoDB sozlash

MongoDB ishga tushirilgan bo'lishi kerak. Keyin `server` papkasida `.env` faylini yarating:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/infast-crm
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## 3. Birinchi admin foydalanuvchisini yaratish

Backend ishga tushgandan keyin, Postman yoki curl orqali:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

## 4. Dasturni ishga tushirish

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 5. Kirish

1. Frontend: http://localhost:3000 ga kiring
2. Email va parol bilan kirish qiling
3. Dashboard ochiladi!

## 📝 Asosiy ish oqimi

1. **Kurs yaratish**: Kurslar → Yangi kurs
2. **Guruh yaratish**: Guruhlar → Yangi guruh (status: NABOR)
3. **Nabor o'quvchilar**: Nabor → Yangi nabor qo'shish
4. **Guruhni faollashtirish**: Guruhlar → Play tugmasi (min o'quvchilar yetarli bo'lsa)
5. **To'lovlar**: To'lovlar → Yangi to'lov (avtomatik keyingi sana hisoblanadi)
6. **Davomat**: Davomat → Guruh va sanani tanlang → Qatnashishni belgilang

## ⚠️ Muhim eslatmalar

- Faqat **NABOR** guruhlariga nabor o'quvchilar qo'shiladi
- Faqat **ACTIVE** guruhlar uchun davomat belgilanadi
- To'lov qo'shilganda o'quvchi statusi avtomatik **ACTIVE** ga o'zgaradi
- To'lov kechiksa (3+ kun) status **DEBTOR** ga o'zgaradi

## 🔧 Muammo hal qilish

### MongoDB ulanmayapti
- MongoDB ishga tushganligini tekshiring
- `.env` faylida `MONGODB_URI` to'g'ri ekanligini tekshiring

### Port band
- Backend portini `.env` da o'zgartiring
- Frontend portini `client/vite.config.js` da o'zgartiring

### CORS xatosi
- `server/index.js` da CORS sozlamalarini tekshiring

