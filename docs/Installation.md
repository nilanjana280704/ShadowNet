# ShadowNet — Installation

## Prerequisites

- Node.js ≥ 22.11 and npm ≥ 10
- MongoDB ≥ 7 (local instance or Atlas connection string)
- React Native environment for the **React Native CLI** workflow
  (not Expo) — follow https://reactnative.dev/docs/set-up-your-environment
  - Android: JDK 17+, Android Studio, Android SDK 35, `ANDROID_HOME` set
  - iOS (macOS only): Xcode 16+, CocoaPods
- A Firebase project (Authentication, Firestore, and Cloud Messaging enabled)

## 1. Clone

```bash
git clone <repo-url> ShadowNet
cd ShadowNet
```

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env       # then fill in MONGO_URI, JWT_SECRET, Firebase keys
npm run dev                # starts on http://localhost:5000 (nodemon)
```

Verify: `GET http://localhost:5000/health` → `{ "status": "ok" }`.

## 3. Frontend

```bash
cd frontend
npm install
```

### Firebase native config (required before first build)

- Android: place `google-services.json` in `frontend/android/app/`
- iOS: place `GoogleService-Info.plist` in `frontend/ios/ShadowNet/`

### Run

```bash
npm start                  # Metro bundler
npm run android            # in a second terminal (device/emulator attached)
# macOS only:
cd ios && pod install && cd ..
npm run ios
```

> The Android emulator reaches your local backend at `http://10.0.2.2:5000`
> (configured in `frontend/src/config/index.js`). A physical device needs your
> machine's LAN IP instead.

## 4. Environment Files

| File                    | Purpose                              | Committed?          |
| ----------------------- | ------------------------------------ | ------------------- |
| `backend/.env.example`  | Backend env template                 | yes                 |
| `backend/.env`          | Real backend secrets                 | **no**              |
| `google-services.json`  | Firebase Android config              | no (per-developer)  |

## Troubleshooting

- **Metro cache issues**: `npm start -- --reset-cache`
- **Android build fails after adding native deps**: `cd android && ./gradlew clean`
- **MongoDB connection refused**: confirm `mongod` is running and `MONGO_URI` is correct
