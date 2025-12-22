# 🚀 Tezkor Deployment Qo'llanmasi

## 1️⃣ MongoDB Atlas (5 daqiqa)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Sign Up
2. **Free Cluster** yaratish
3. **Database Access** → **Add New Database User**:
   - Username: `infast-admin`
   - Password: Kuchli parol yarating
4. **Network Access** → **Add IP Address** → `0.0.0.0/0` (Allow from anywhere)
5. **Connect** → **Connect your application** → Connection string ni copy qiling

**Connection String format:**
```
mongodb+srv://infast-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/infast-crm?retryWrites=true&w=majority
```

---

## 2️⃣ Backend - Render.com (10 daqiqa)

### Qadam 1: GitHub'ga yuklash
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/infast-crm.git
git push -u origin main
```

### Qadam 2: Render.com'da deploy

1. [Render.com](https://render.com) → **New +** → **Web Service**
2. GitHub repo'ni ulang
3. Sozlamalar:

**Basic:**
- Name: `infast-crm-backend`
- Environment: `Node`
- Region: `Singapore`
- Branch: `main`
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

**Environment Variables:**

Render.com'da **Environment** bo'limiga o'ting va har birini alohida qo'shing:

1. **MONGODB_URI** (Key) = `mongodb+srv://infast-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/infast-crm?retryWrites=true&w=majority`
   - Bu yerda `YOUR_PASSWORD` o'rniga MongoDB Atlas'da yaratgan parolingizni yozing
   - `cluster0.xxxxx` o'rniga sizning cluster nomingiz bo'ladi

2. **JWT_SECRET** (Key) = `your-very-secret-key-min-32-characters-change-this`
   - Bu yerda kuchli parol yozing (masalan: `InFast2024SecretKeyForJWTTokenGeneration123!`)
   - Minimum 32 belgi bo'lishi kerak

3. **NODE_ENV** (Key) = `production`

4. **PORT** (Key) = `5000`

5. **FRONTEND_URL** (Key) = `https://your-frontend.railway.app`
   - Bu yerda Railway'dan olgan frontend URL'ni yozing
   - Avval Railway'da deploy qiling, keyin URL ni oling va bu yerga yozing

**Qanday qo'shish:**
- Render.com dashboard'da service'ingizga kiring
- **Environment** tab'iga o'ting
- **Add Environment Variable** tugmasini bosing
- **Key** va **Value** ni yozing
- **Save Changes** tugmasini bosing

4. **Create Web Service**

5. Backend URL ni oling: `https://infast-crm-backend.onrender.com`

---

## 3️⃣ Frontend - Railway (10 daqiqa)

### Qadam 1: Railway'da deploy

1. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Repo'ni tanlang
3. **Settings** → **Root Directory**: `client`

**Environment Variables:**
```
VITE_API_URL=https://infast-crm-backend.onrender.com/api
```

4. Railway avtomatik deploy qiladi

5. Frontend URL ni oling: `https://your-project.railway.app`

---

## 4️⃣ Backend CORS yangilash

Render.com'da **Environment Variables** ga qo'shing:
```
FRONTEND_URL=https://your-project.railway.app
```

Yoki `server/index.js` faylida qo'lda qo'shing:
```javascript
origin: [
  'http://localhost:3000',
  'https://your-project.railway.app',  // Railway URL
],
```

---

## 5️⃣ Test qilish

1. **Backend test:**
```bash
curl https://infast-crm-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

2. **Frontend test:**
- Railway URL ga kiring
- Login qiling

---

## ✅ Tayyor!

Endi sizning CRM tizimingiz production'da ishlamoqda!

---

## 🔧 Muammo hal qilish

### Backend 401 xatosi:
- Render.com'da Logs ni tekshiring
- MongoDB connection string to'g'ri ekanligini tekshiring

### Frontend CORS xatosi:
- Backend'da `FRONTEND_URL` to'g'ri ekanligini tekshiring
- Browser Console'da xatolarni tekshiring

### Build xatosi:
- Railway Logs ni tekshiring
- `npm install` muvaffaqiyatli bo'lganini tekshiring

