const isFirebaseConfigured = () => {
  const config = window.__FF_EARN_FIREBASE_CONFIG__ || {};
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );
};

const showToast = (message) => {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.add("hidden"), 2200);
};

async function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    showToast("Firebase config missing.");
    return null;
  }

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");

  const app = initializeApp(window.__FF_EARN_FIREBASE_CONFIG__);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  return { auth, provider, signInWithPopup };
}

async function loginWithGoogle() {
  if (!isFirebaseConfigured()) {
    showToast("Firebase not configured yet.");
    return;
  }

  try {
    const firebase = await getFirebaseAuth();
    if (!firebase) return;

    const result = await firebase.signInWithPopup(firebase.auth, firebase.provider);
    const user = result.user;

    const profile = {
      ign: user.displayName || "Google User",
      uid: user.uid,
      email: user.email || "",
      photoURL: user.photoURL || "",
      walletBalance: 2500,
      winnings: 1850,
      deposit: 0,
      joinedMatches: [],
      role: window.__FF_EARN_ADMIN_EMAILS__?.includes(user.email || "") ? "admin" : "user"
    };

    localStorage.setItem("ff_earn_user", JSON.stringify(profile));
    const profileName = document.getElementById("profileName");
    const avatarBadge = document.getElementById("avatarBadge");
    const authModal = document.getElementById("authModal");

    if (profileName) profileName.textContent = profile.ign;
    if (avatarBadge) avatarBadge.textContent = (profile.ign || "G").slice(0, 1).toUpperCase();
    if (authModal) authModal.classList.add("hidden");

    window.state = window.state || {};
    window.state.user = profile;
    window.renderApp?.();
    showToast("Google login successful");
  } catch (error) {
    console.error("Google login failed:", error);
    showToast("Google login failed");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("googleLoginBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", loginWithGoogle);
  }
});

window.FFEarnAuth = { loginWithGoogle };
