# 🚀 Render.com ga Deploy Qilish

## 📋 Oldindan tayyorgarlik

### 1. MongoDB Atlas (Bepul cloud database)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ga ro'yxatdan o'ting
2. **Free Cluster** yarating
3. **Database Access** → Yangi user qo'shing (username/password)
4. **Network Access** → `0.0.0.0/0` qo'shing (hamma IP ruxsat)
5. **Connect** → **Drivers** → Connection string'ni nusxalang:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/infast-crm?retryWrites=true&w=majority
   ```

### 2. GitHub'ga yuklash
```bash
git add .
git commit -m "Render deployment ready"
git push origin main
```

---

## 🔧 Render.com da sozlash

### 1. Render.com ga kiring
[https://render.com](https://render.com) → GitHub bilan ro'yxatdan o'ting

### 2. Backend API yaratish

1. **New +** → **Web Service**
2. GitHub repo'ni tanlang
3. Sozlamalar:

| Sozlama | Qiymat |
|---------|--------|
| **Name** | `infast-crm-api` |
| **Region** | Singapore (yoki yaqinroq) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

4. **Environment Variables** qo'shing:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://...` (Atlas'dan) |
| `JWT_SECRET` | `infast-crm-secret-key-2024-very-long-string` |
| `FRONTEND_URL` | (keyinroq frontend URL'ni qo'shasiz) |

5. **Create Web Service** → Deploy boshlanadi

6. Deploy tugagach, URL'ni nusxalang: `https://infast-crm-api.onrender.com`

---

### 3. Frontend Static Site yaratish

1. **New +** → **Static Site**
2. GitHub repo'ni tanlang
3. Sozlamalar:

| Sozlama | Qiymat |
|---------|--------|
| **Name** | `infast-crm` |
| **Branch** | `main` |
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. **Environment Variables** qo'shing:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://infast-crm-api.onrender.com/api` |

5. **Create Static Site** → Deploy boshlanadi

6. Deploy tugagach, URL: `https://infast-crm.onrender.com`

---

### 4. CORS sozlamalarini yangilash

Backend'ning **Environment Variables** ga qayting va qo'shing:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://infast-crm.onrender.com` |

**Manual Deploy** bosing (yoki keyingi push'da avtomatik yangilanadi)

---

## ✅ Tekshirish

1. Frontend: `https://infast-crm.onrender.com` ga kiring
2. Login:
   - Email: `muhammadazizyaqubov2@gmail.com`
   - Password: `Azizbek0717`

---

## ⚠️ Muhim eslatmalar

### Free tier cheklovlari:
- **Backend**: 15 daqiqa ishlatilmasa uxlaydi (birinchi so'rov sekin ~30-60 sek)
- **Database**: MongoDB Atlas free tier 512MB
- **Bandwidth**: Cheklangan

### Muammolar:
- **CORS xatosi**: `FRONTEND_URL` to'g'ri ekanligini tekshiring
- **Login ishlamayapti**: Backend loglarini tekshiring (Render dashboard → Logs)
- **404 xatosi**: Frontend'da `VITE_API_URL` to'g'ri ekanligini tekshiring

---

## 🔄 Yangilash

Har safar GitHub'ga push qilganingizda, Render avtomatik qayta deploy qiladi.

```bash
git add .
git commit -m "Update"
git push origin main
```

