# 🚀 Deployment Qo'llanmasi

## Backend (Render.com) va Frontend (Railway) ga deploy qilish

---

## 📋 1. MongoDB Cloud sozlash (MongoDB Atlas)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ga kirish
2. Yangi cluster yaratish (FREE tier yetarli)
3. Database User yaratish:
   - Username va Password yozing
   - Database User Privileges: `Read and write to any database`
4. Network Access:
   - `Add IP Address` → `Allow Access from Anywhere` (0.0.0.0/0)
5. Connection String olish:
   - `Connect` → `Connect your application`
   - Connection string ni copy qiling
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/infast-crm?retryWrites=true&w=majority`

---

## 🔧 2. Backend - Render.com ga deploy

### 2.1. GitHub'ga yuklash

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/infast-crm.git
git push -u origin main
```

### 2.2. Render.com'da Web Service yaratish

1. [Render.com](https://render.com) ga kirish
2. `New +` → `Web Service` ni tanlang
3. GitHub repository'ni ulang
4. Sozlamalar:

**Basic Settings:**
- **Name**: `infast-crm-backend`
- **Environment**: `Node`
- **Region**: `Singapore` (yoki yaqinroq)
- **Branch**: `main`
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables:**
Quyidagi o'zgaruvchilarni qo'shing:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/infast-crm?retryWrites=true&w=majority
JWT_SECRET=your-very-secret-key-min-32-characters-long
NODE_ENV=production
```

**Advanced Settings:**
- **Auto-Deploy**: `Yes`

5. `Create Web Service` ni bosing

### 2.3. Backend URL ni olish

Deploy bo'lgandan keyin, sizga URL beriladi:
```
https://infast-crm-backend.onrender.com
```

⚠️ **Eslatma**: Render.com'da free tier'da 15 daqiqa ishlatilmayotganda service uxlaydi. Birinchi so'rov sekin bo'lishi mumkin (cold start).

---

## 🚂 3. Frontend - Railway ga deploy

### 3.1. Railway'da Project yaratish

1. [Railway](https://railway.app) ga kirish
2. `New Project` → `Deploy from GitHub repo`
3. Repository'ni tanlang

### 3.2. Frontend sozlamalari

1. Service yaratilgandan keyin, `Settings` ga o'ting
2. **Root Directory**: `client` ni tanlang (yoki `railway.json` fayli avtomatik ishlaydi)
3. **Build Command**: Avtomatik (railway.json'dan olinadi)
4. **Start Command**: Avtomatik (railway.json'dan olinadi)

**Yoki manual sozlash:**
- **Build Command**: `cd client && npm install && npm run build`
- **Start Command**: `cd client && npm run start`

**Railway avtomatik ravishda `railway.json` faylini ishlatadi.**

### 3.3. Environment Variables

Railway'da `Variables` bo'limiga o'ting va qo'shing:

```
VITE_API_URL=https://infast-crm-backend.onrender.com
```

### 3.4. Frontend kodini yangilash

`client/src/utils/api.js` faylini yangilash kerak:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // ...
});
```

---

## 🔄 4. Kod o'zgarishlari

### 4.1. Backend CORS sozlash

`server/index.js` faylida CORS ni yangilash:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.railway.app',
    // Railway'dan kelgan domain
  ],
  credentials: true
}));
```

### 4.2. Frontend API URL

`client/src/utils/api.js` fayli allaqachon yangilangan:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // ...
});
```

Railway'da `VITE_API_URL` environment variable'ni qo'shing:
```
VITE_API_URL=https://infast-crm-backend.onrender.com/api
```

---

## 📝 5. Deployment checklist

### Backend (Render.com):
- ✅ GitHub'ga yuklangan
- ✅ Render.com'da Web Service yaratilgan
- ✅ Root Directory: `server`
- ✅ Build Command: `npm install`
- ✅ Start Command: `npm start`
- ✅ Environment Variables qo'shilgan:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `NODE_ENV=production`
- ✅ Deploy muvaffaqiyatli

### Frontend (Railway):
- ✅ Railway'da Project yaratilgan
- ✅ Root Directory: `client`
- ✅ Build Command: `npm install && npm run build`
- ✅ Environment Variable: `VITE_API_URL`
- ✅ Deploy muvaffaqiyatli

### MongoDB:
- ✅ MongoDB Atlas cluster yaratilgan
- ✅ Database User yaratilgan
- ✅ Network Access: 0.0.0.0/0
- ✅ Connection String olingan

---

## 🧪 6. Test qilish

1. **Backend test:**
```bash
curl https://infast-crm-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

2. **Frontend test:**
- Railway'dan berilgan URL ga kiring
- Login qiling

---

## ⚠️ Muhim eslatmalar

### Render.com:
- Free tier'da 15 daqiqa ishlatilmayotganda service uxlaydi
- Birinchi so'rov sekin bo'lishi mumkin (cold start ~30-60 sekund)
- Production uchun paid plan tavsiya etiladi

### Railway:
- Free tier'da limitlar bor
- Custom domain qo'shish mumkin
- Auto-deploy GitHub'dan

### MongoDB Atlas:
- Free tier'da 512MB storage
- Connection limitlar bor
- Production uchun paid plan tavsiya etiladi

---

## 🔐 7. Xavfsizlik

1. **JWT_SECRET** - Kuchli parol ishlating (min 32 belgi)
2. **MongoDB Password** - Kuchli parol
3. **Environment Variables** - Hech qachon kodga yozmang
4. **CORS** - Faqat kerakli domain'larni qo'shing

---

## 🐛 Muammo hal qilish

### Backend ishlamayapti:
- Render.com'da `Logs` ni tekshiring
- MongoDB connection string to'g'ri ekanligini tekshiring
- Environment variables to'g'ri ekanligini tekshiring

### Frontend ishlamayapti:
- Railway'da `Deployments` → `View Logs` ni tekshiring
- `VITE_API_URL` to'g'ri ekanligini tekshiring
- Build muvaffaqiyatli bo'lganini tekshiring

### CORS xatosi:
- Backend'da CORS sozlamalarini tekshiring
- Frontend URL'ni CORS'ga qo'shing

---

## 📞 Yordam

Agar muammo bo'lsa:
1. Render.com Logs ni tekshiring
2. Railway Logs ni tekshiring
3. Browser Console'da xatolarni tekshiring
4. Network tab'da API so'rovlarini tekshiring

