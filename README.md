# Pi Storage

Raspberry Pi için web tabanlı kişisel dosya yöneticisi. Tarayıcıdan dosya yükle, indir, klasörle ve yönet.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-multiplatform-2496ED?logo=docker&logoColor=white)

## Özellikler

- Dosya yükleme (sürükle-bırak, 2 GB'a kadar)
- Klasör oluşturma, taşıma, silme, indirme
- Şifre korumalı giriş (JWT)
- Raspberry Pi 3/4/5 ve x86 desteği

## Kurulum

### 1. Repoyu klonla

```bash
git clone https://github.com/yusufkus1/pistorage.git
cd pistorage
```

### 2. Ortam değişkenlerini ayarla

```bash
cp .env.example .env
```

Şifre hash'i oluştur (Node gerekmez):

```bash
docker compose run --rm setup-password
```

Çıkan hash'i `.env` dosyasına yapıştır:

```env
PORT=3001
JWT_SECRET=uzun-rastgele-bir-metin
PASSWORD_HASH=$2a$12$...
```

### 3. Başlat

```bash
docker compose up -d
```

Tarayıcıdan `http://<cihaz-ip>:3001` adresine gir.

## Ağ Diski Olarak Bağlama (WebDAV)

Pi Storage, `/dav` yolundan WebDAV sunucu olarak da çalışır.

**macOS Finder**
1. Finder → Git → Sunucuya Bağlan (`Cmd+K`)
2. `http://<pi-ip>:3001/dav` gir → Bağlan
3. Kullanıcı adı: herhangi bir şey (örn. `pi`) — Şifre: Pi Storage şifren

**iOS Files Uygulaması**
1. Dosyalar → `...` → Depolama Alanı Ekle → WebDAV
2. Sunucu: `http://<pi-ip>:3001/dav` — Kullanıcı Adı: `pi` — Şifre: Pi Storage şifren
3. Artık herhangi bir uygulamadan "Paylaş → Dosyalara Kaydet → Pi Storage" diyebilirsin

**Windows**
1. Bu Bilgisayar → Ağ Konumu Ekle
2. `http://<pi-ip>:3001/dav` gir

## Güncelleme

```bash
docker compose pull && docker compose up -d
```

## Desteklenen Platformlar

| Platform | Cihaz |
|----------|-------|
| `linux/amd64` | PC / Sunucu |
| `linux/arm64` | Raspberry Pi 4/5 |
| `linux/arm/v7` | Raspberry Pi 3 |
