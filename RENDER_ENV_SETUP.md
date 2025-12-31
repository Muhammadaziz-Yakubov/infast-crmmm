# Render.com Environment Variables - Qo'llanma

## 📝 Qanday qo'shish (Rasmlar bilan)

### 1. Render.com Dashboard'ga kiring

1. [Render.com](https://render.com) ga kirib, service'ingizga kiring
2. Service nomiga bosing (masalan: `infast-crm-backend`)

### 2. Environment tab'iga o'ting

Service sahifasida chap menudan **Environment** ni tanlang.

### 3. Har bir variable'ni qo'shing

**Qadam 1:** `Add Environment Variable` tugmasini bosing

**Qadam 2:** Key va Value ni yozing

**Qadam 3:** `Save Changes` tugmasini bosing

---

## 🔑 Barcha Environment Variables

Quyidagi 5 ta variable'ni qo'shing:

### 1. MONGODB_URI

**Key:** `MONGODB_URI`

**Value:** 
```
mongodb+srv://infast-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/infast-crm?retryWrites=true&w=majority
```

**Qanday olish:**
- MongoDB Atlas → Connect → Connect your application
- Connection string ni copy qiling
- `YOUR_PASSWORD` o'rniga parolingizni yozing

**Misol:**
```
mongodb+srv://infast-admin:MyPassword123@cluster0.abc123.mongodb.net/infast-crm?retryWrites=true&w=majority
```

---

### 2. JWT_SECRET

**Key:** `JWT_SECRET`

**Value:** 
```
InFast2024SecretKeyForJWTTokenGeneration123!
```

**Yoki o'zingiz yarating:**
- Minimum 32 belgi
- Harflar, raqamlar va belgilar aralash
- Masalan: `MySuperSecretKey123456789!@#$%`

---

### 3. NODE_ENV

**Key:** `NODE_ENV`

**Value:** 
```
production
```

---

### 4. PORT

**Key:** `PORT`

**Value:** 
```
5000
```

---

### 5. FRONTEND_URL

**Key:** `FRONTEND_URL`

**Value:** 
```
https://your-project.railway.app
```

**Qanday olish:**
1. Railway'da frontend deploy qiling
2. Railway dashboard'da service'ingizga kiring
3. **Settings** → **Domains** bo'limida URL ni ko'rasiz
4. Bu URL ni copy qiling va Render.com'ga yozing

**Misol:**
```
https://infast-crm-production.up.railway.app
```

---

## ✅ Tekshirish

Barcha variable'lar qo'shilgandan keyin:

1. **Save Changes** tugmasini bosing
2. Service avtomatik restart bo'ladi
3. **Logs** tab'ida xatolarni tekshiring
4. Agar "✅ MongoDB connected" ko'rsatilsa - hammasi to'g'ri!

---

## ⚠️ Muhim eslatmalar

1. **MONGODB_URI** - Parolni to'g'ri yozing (maxsus belgilar bo'lsa encode qiling)
2. **JWT_SECRET** - Hech kimga ko'rsatmang, xavfsiz saqlang
3. **FRONTEND_URL** - Railway URL ni to'g'ri yozing (https:// bilan boshlanadi)
4. Har bir variable'ni alohida qo'shing
5. Key nomlari katta-kichik harfga sezgir (MONGODB_URI, PORT, va hokazo)

---

## 🐛 Muammo bo'lsa

Agar service ishlamasa:

1. **Logs** tab'ini tekshiring
2. MongoDB connection xatosi bo'lsa - MONGODB_URI ni tekshiring
3. CORS xatosi bo'lsa - FRONTEND_URL ni tekshiring
4. 401 xatosi bo'lsa - JWT_SECRET ni tekshiring


