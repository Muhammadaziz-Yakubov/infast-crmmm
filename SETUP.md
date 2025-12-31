# InFast CRM - Sozlash Qo'llanmasi

## ⚠️ MUHIM: Birinchi foydalanishdan oldin

Agar sizda hali admin foydalanuvchisi yo'q bo'lsa, uni yaratishingiz kerak!

## 1. MongoDB ishga tushirish

MongoDB ishga tushirilgan bo'lishi kerak:
- Local MongoDB: `mongod` komandasi
- Yoki MongoDB Atlas (cloud)

## 2. Backend sozlash

`server` papkasida `.env` faylini yarating:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/infast-crm
JWT_SECRET=your-very-secret-key-change-this-in-production
NODE_ENV=development
```

## 3. Birinchi admin foydalanuvchisini yaratish

Backend ishga tushgandan keyin, quyidagi usullardan birini ishlating:

### Usul 1: Postman yoki Insomnia

**Postman sozlamalari:**

1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/auth/register`
3. **Headers** bo'limiga o'ting:
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body** bo'limiga o'ting:
   - `raw` ni tanlang
   - Dropdown'dan `JSON` ni tanlang
   - Quyidagi JSON ni yozing:

```json
{
  "email": "admin@infast.uz",
  "password": "admin123"
}
```

5. **Send** tugmasini bosing

**Yoki to'g'ridan-to'g'ri copy-paste:**

**URL:**
```
http://localhost:5000/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@infast.uz",
  "password": "admin123"
}
```

### Usul 2: curl (Terminal)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infast.uz","password":"admin123"}'
```

### Usul 3: Browser Console

Backend ishga tushgandan keyin, browser console'da:

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@infast.uz',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(console.log);
```

## 4. Dasturni ishga tushirish

```bash
npm run dev
```

Yoki alohida:

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2  
cd client
npm run dev
```

## 5. Kirish

1. Browser'da: http://localhost:3000
2. Email: `admin@infast.uz` (yoki yaratgan emailingiz)
3. Parol: `admin123` (yoki yaratgan parolingiz)

## ✅ Tizim tayyor!

Endi siz:
- Kurslar yaratishingiz mumkin
- Guruhlar yaratishingiz mumkin
- O'quvchilar qo'shishingiz mumkin
- To'lovlar kiritishingiz mumkin
- Davomat belgilashingiz mumkin

## 🔧 Muammo hal qilish

### 401 Unauthorized xatosi

Agar 401 xatosi ko'rsatilsa:
1. Token localStorage'da borligini tekshiring (F12 → Application → Local Storage)
2. Agar token yo'q bo'lsa, qayta login qiling
3. Agar token bor bo'lsa, backend `.env` faylida `JWT_SECRET` to'g'ri ekanligini tekshiring

### MongoDB ulanmayapti

1. MongoDB ishga tushganligini tekshiring
2. `.env` faylida `MONGODB_URI` to'g'ri ekanligini tekshiring
3. MongoDB porti 27017 ekanligini tekshiring

### Port band

Agar port band bo'lsa:
- Backend: `.env` faylida `PORT` ni o'zgartiring
- Frontend: `client/vite.config.js` da portni o'zgartiring

