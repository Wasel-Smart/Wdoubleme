# Firebase Configuration Files

## 📱 google-services.json (Android)

This file contains Firebase configuration for the **Android app** (`com.Smartrix.waselapp`).

**⚠️ IMPORTANT:** This file is **NOT used** by the web application. It's kept here for reference and future mobile app development.

### Android Configuration:
- **Package Name:** `com.Smartrix.waselapp`
- **App ID:** `1:631682127784:android:f796e4e84543a9954b2f9d`
- **API Key:** `AIzaSyATb1EX3IOnLbY4i5BoAhYIHOJSdeXOtrk`
- **Project:** `wasel-planning-with-ai`

### Usage in Android Studio:
```
1. Open Android project
2. Switch to "Project" view
3. Place google-services.json in: app/
4. Sync Gradle
```

---

## 🌐 Web App Configuration

For the **web application**, Firebase config comes from **environment variables**, not `google-services.json`.

### Setup Steps:

1. **Register Web App in Firebase Console:**
   - Go to: https://console.firebase.google.com/project/wasel-planning-with-ai
   - Add a new web app
   - Get the web app ID (different from Android)

2. **Add to `.env.local`:**
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSyATb1EX3IOnLbY4i5BoAhYIHOJSdeXOtrk
   VITE_FIREBASE_PROJECT_ID=wasel-planning-with-ai
   VITE_FIREBASE_MESSAGING_SENDER_ID=631682127784
   VITE_FIREBASE_APP_ID=1:631682127784:web:YOUR_WEB_APP_ID
   VITE_FIREBASE_STORAGE_BUCKET=wasel-planning-with-ai.firebasestorage.app
   VITE_FIREBASE_AUTH_DOMAIN=wasel-planning-with-ai.firebaseapp.com
   VITE_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY
   ```

3. **Read the full setup guide:**
   - See: `/FIREBASE_SETUP_GUIDE.md`

---

## 🔑 Key Differences

| Platform | Config File | Location | App ID Format |
|----------|------------|----------|---------------|
| Android | `google-services.json` | `app/` | `android:...` |
| iOS | `GoogleService-Info.plist` | `Runner/` | `ios:...` |
| Web | Environment variables | `.env.local` | `web:...` |

All three platforms share the same Firebase **project** but have different **app IDs**.

---

## 📚 Resources

- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Web Setup Guide](/FIREBASE_SETUP_GUIDE.md)
