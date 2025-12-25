# InFast CRM

O'quv markazlar uchun soddalashtirilgan CRM tizimi.

## 🚀 Texnologiyalar

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Vite, Tailwind CSS
- **Database**: MongoDB

## 📋 Talablar

- Node.js (v18+)
- MongoDB (local yoki cloud)
- npm yoki yarn

## 🔧 O'rnatish

### 1. Loyihani klonlash yoki yuklab olish

### 2. Barcha paketlarni o'rnatish

```bash
npm run install-all
```

Yoki alohida:

```bash
# Root
npm install

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. MongoDB sozlash

`.env` faylini yarating `server` papkasida:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/infast-crm
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### 4. Dasturni ishga tushirish

```bash
# Root papkadan
npm run dev
```

Yoki alohida:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 🔐 Birinchi foydalanish

1. Backend ishga tushgandan keyin, birinchi admin foydalanuvchisini yarating:

```bash
# Postman yoki boshqa API client orqali
POST http://localhost:5000/api/auth/register
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

2. Frontend: `http://localhost:3000`
3. Login qiling va ishlatishni boshlang!

## 📚 Asosiy funksiyalar

- ✅ **Kurslar** - O'quv yo'nalishlarini boshqarish
- ✅ **Guruhlar** - Nabor, Faol, Yopilgan holatlar
- ✅ **O'quvchilar** - To'liq boshqaruv
- ✅ **Nabor** - Nabor o'quvchilarni boshqarish
- ✅ **To'lovlar** - Avtomatik keyingi to'lov sanasini hisoblash
- ✅ **Davomat** - Faol guruhlar uchun davomat
- ✅ **Dashboard** - Asosiy ko'rsatkichlar
- ✅ **Dark Mode** - Qorong'u/Yorug' rejim

## 🎨 Rang sxemasi

- **Asosiy rang**: Orange (#f97316)
- **Status ranglar**:
  - 🟢 ACTIVE - Yashil
  - 🟡 NABOR - Sariq
  - 🔴 DEBTOR - Qizil
  - ⚫ STOPPED - Kulrang

## 🔄 Avtomatik tizim

- **To'lov nazorati**: Har kuni soat 9:00 da avtomatik tekshiriladi
- **Status o'zgarishi**: To'lov kechiksa avtomatik DEBTOR ga o'zgaradi
- **Keyingi to'lov sanasi**: To'lov qo'shilganda avtomatik hisoblanadi

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish

### Courses
- `GET /api/courses` - Barcha kurslar
- `POST /api/courses` - Yangi kurs
- `PUT /api/courses/:id` - Kursni yangilash
- `DELETE /api/courses/:id` - Kursni o'chirish

### Groups
- `GET /api/groups` - Barcha guruhlar
- `POST /api/groups` - Yangi guruh
- `PUT /api/groups/:id` - Guruhni yangilash
- `POST /api/groups/:id/activate` - Guruhni faollashtirish
- `DELETE /api/groups/:id` - Guruhni o'chirish

### Students
- `GET /api/students` - Barcha o'quvchilar
- `POST /api/students` - Yangi o'quvchi
- `PUT /api/students/:id` - O'quvchini yangilash
- `DELETE /api/students/:id` - O'quvchini o'chirish

### Leads
- `GET /api/leads` - Barcha nabor o'quvchilar
- `POST /api/leads` - Yangi nabor
- `POST /api/leads/:id/convert` - O'quvchiga aylantirish
- `PUT /api/leads/:id` - Naborni yangilash
- `DELETE /api/leads/:id` - Naborni o'chirish

### Payments
- `GET /api/payments` - Barcha to'lovlar
- `POST /api/payments` - Yangi to'lov
- `PUT /api/payments/:id` - To'lovni yangilash
- `DELETE /api/payments/:id` - To'lovni o'chirish

### Attendance
- `GET /api/attendance` - Barcha davomat yozuvlari
- `POST /api/attendance` - Davomat qo'shish/yangilash
- `PUT /api/attendance/:id` - Davomatni yangilash
- `DELETE /api/attendance/:id` - Davomatni o'chirish

### Dashboard
- `GET /api/dashboard` - Dashboard ma'lumotlari

## 🛠️ Rivojlantirish

Loyiha strukturasi:

```
infast-crm/
├── server/          # Backend
│   ├── models/      # MongoDB modellar
│   ├── routes/      # API routes
│   ├── middleware/  # Middleware
│   ├── jobs/        # Background jobs
│   └── index.js     # Server entry point
├── client/          # Frontend
│   ├── src/
│   │   ├── components/  # React komponentlar
│   │   ├── pages/      # Sahifalar
│   │   ├── context/    # Context API
│   │   └── utils/      # Utility funksiyalar
│   └── package.json
└── package.json
```

## 📄 Litsenziya

Bu loyiha shaxsiy foydalanish uchun yaratilgan.

## 👨‍💻 Yordam

Muammo yuzaga kelsa, issue oching yoki aloqaga chiqing.

"# infastcrm" 
"# infastcrm" 
"# infastcrm" 
"# infast-crm" 
"# infastcrmm" 
"# infastcrm-frontend" 
"# infasteducrm" 
"# infastcrm" 
