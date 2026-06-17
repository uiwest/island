# 🏝️ 섬 우편함 (Island Mail)

동물의 숲 스타일 익명 편지 교환 서비스!  
모르는 섬 주민에게 편지를 보내고 받아요.

---

## ✨ 기능

- 🌱 나만의 섬 만들기 (이름 + 섬 이름)
- ✉️ 다른 섬 주민에게 편지 보내기
- 🎲 랜덤 섬으로 편지 보내기
- 📬 받은 편지함 / 📤 보낸 편지함
- 🗺️ 다른 섬 탐험 및 편지 보내기
- 💌 안 읽은 편지 알림 (우편함 깃발)
- 🔑 섬 ID로 다른 기기에서 로그인

---

## 🚀 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 서버 시작
npm start

# 3. 브라우저에서 열기
http://localhost:3000
```

---

## 🌐 배포 방법

### Railway (추천 - 무료)

1. [railway.app](https://railway.app) 에서 계정 생성
2. "New Project" → "Deploy from GitHub"
3. 이 폴더를 GitHub에 올린 후 연결
4. 자동으로 빌드 & 배포됩니다!

### Render (무료)

1. [render.com](https://render.com) 에서 계정 생성
2. "New Web Service" → GitHub 저장소 연결
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 배포 완료!

### Fly.io

```bash
npm install -g flyctl
flyctl launch
flyctl deploy
```

---

## 📁 파일 구조

```
island-mail/
├── server.js          # Express 백엔드 + SQLite DB
├── package.json       # 의존성
├── island_mail.db     # SQLite DB (자동 생성)
└── public/
    └── index.html     # 프론트엔드 (동물의 숲 UI)
```

---

## 🛠️ 기술 스택

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: Vanilla HTML/CSS/JS
- **폰트**: Jua, Nanum Gothic (Google Fonts)

---

## 🌸 즐겁게 사용하세요!

섬 ID는 잃어버리면 다시 찾을 수 없으니  
안전한 곳에 저장해두세요! 🔑
