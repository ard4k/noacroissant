# 🥐 Noa Croissant & Bakery - QR Menü & Sipariş Yönetim Sistemi

Noa Croissant, modern kafe ve fırın işletmeleri için tasarlanmış yüksek performanslı, gerçek zamanlı ve çok dilli bir QR Dijital Menü & Sipariş Yönetim platformudur.

---

## ✨ Özellikler

- **📱 Müşteri QR Deneyimi:**
  - Hızlı ve akıcı dijital menü (Türkçe / İngilizce / Rusça / Arapça / Farsça)
  - Alerjen, kalori ve besin değeri filtreleri
  - Sepet yönetimi ve masa bazlı sipariş verme
  - Sipariş durumu canlı takip ekranı (`/siparis/[token]`)

- **👨‍🍳 Mutfak & Bar Ekranı (KDS):**
  - Gerçek zamanlı sipariş akışı ve sesli bildirimler
  - Sipariş hazırlık aşamaları (Yeni, Hazırlanıyor, Hazır, Teslim Edildi)
  - Masa ve garson çağrı takibi

- **📊 Yönetim Paneli (Admin):**
  - PIN ve JWT korumalı güvenli yönetim alanı (`/admin`)
  - Ürün, kategori ve stok yönetimi
  - Canlı ciro, ortalama sipariş tutarı ve popüler ürün analitiği
  - QR Kod üretme ve toplu baskı arayüzü (`/admin/qr-print`)
  - Gelişmiş sliding-window rate limiting ve güvenlik başlıkları

---

## 🛠️ Teknoloji Yığını

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **UI & Stil:** [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **İkonlar:** [Lucide Icons](https://lucide.dev/)
- **Veritabanı / Realtime:** [Firebase Firestore](https://firebase.google.com/) (Fallback in-memory/storage desteği ile)
- **Tip Güvenliği:** TypeScript 5.7+

---

## 🚀 Yerel Geliştirme (Local Development)

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Ortam değişkenlerini ayarlayın:**
   ```bash
   cp .env.example .env.local
   ```
   `.env.local` dosyasını açıp gerekli Firebase veya Admin anahtarlarınızı tanımlayın.

3. **Geliştirici sunucusunu başlatın:**
   ```bash
   npm run dev
   ```
   Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

---

## ⚡ Vercel Deployment Rehberi

1. **GitHub Entegrasyonu:**
   - Projenizi GitHub'a yükleyin.
2. **Vercel'e Aktarma (Import):**
   - [Vercel Dashboard](https://vercel.com/dashboard) > **Add New...** > **Project** adımlarını izleyin.
   - `noacroissant` reposunu seçin.
3. **Ortam Değişkenlerini (Environment Variables) Tanımlayın:**
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `ADMIN_PIN` (Örn: `330738`)
   - `AUTH_SECRET` (Güvenli rasgele bir metin)
4. **Deploy:**
   - **Deploy** butonuna basarak yayınlayın.

---

## 📄 Lisans
Bu proje özel mülkiyettir (Proprietary). Tüm hakları saklıdır.
