// ============================================================
// Ink — a quiet chat app
// Part 1: config, state, DOM, utils
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyB_J_H7sLMSiknI7ukqtYPvd6F9pz0wnkY",
    authDomain: "chatapp-8ecb0.firebaseapp.com",
    databaseURL: "https://chatapp-8ecb0-default-rtdb.firebaseio.com/",
    projectId: "chatapp-8ecb0",
    storageBucket: "chatapp-8ecb0.firebasestorage.app",
    messagingSenderId: "393002965681",
    appId: "1:393002965681:web:fa6ad2bac0850f915090",
    measurementId: "G-BM0XDEMFC3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const usersRef = db.ref('users');
const friendRequestsRef = db.ref('friendRequests');
const friendsRef = db.ref('friends');
const dmsRef = db.ref('dms');
const groupsRef = db.ref('groups');
const presenceRef = db.ref('presence');
const typingRef = db.ref('typing');
const unreadRef = db.ref('unread');
const mutedRef = db.ref('muted');
const pinnedRef = db.ref('pinned');
const draftsRef = db.ref('drafts');

// ============================================================
// STATE
// ============================================================
let currentUser = null;
let username = '';
let displayName = '';
let userId = '';
let currentProfile = null;
let currentDmUser = null;
let currentGroup = null;
let friends = [];
let friendsData = {};
let pendingRequests = [];
let onlineUsers = {};
let unreadCounts = {};
let userGroups = {};
let groupsData = {};
let mutedChats = {};
let pinnedChats = {};
let lastMessages = {};
let isLoggedIn = false;
let isInitializing = false;
let myStatus = 'online';
let notifSoundEnabled = true;
let typingEnabled = true;
let dateSeparatorsEnabled = true;

// Media
let pendingFile = null;
let pendingType = null;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;
let isRecording = false;
let recordingTarget = null;

let groupPendingFile = null;
let groupPendingType = null;

// Edit state for profile modal
let editState = {
    avatar: '',
    banner: ''
};

// Open conversation caches
let dmLastMsgs = [];
let groupLastMsgs = [];

// Performance hashes (prevent useless re-renders)
let _lastPresenceHash = '';
let _lastUnreadHash = '';
let _lastRailHash = '';
let _lastFriendsHash = '';
let _lastMutedHash = '';
let _lastPinnedHash = '';

// Per-friend last-message listeners
const _lastMsgListeners = {};

// Guard against double friend requests
let _sendingFriendRequest = false;

// ============================================================
// DOM — via querySelector
// ============================================================
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const loginScreen = $('#loginScreen');
const authTitle = $('#authTitle');
const authSubtitle = $('#authSubtitle');
const loginForm = $('#loginForm');
const signupForm = $('#signupForm');
const forgotForm = $('#forgotForm');
const loginEmail = $('#loginEmail');
const loginPassword = $('#loginPassword');
const loginBtn = $('#loginBtn');
const signupEmail = $('#signupEmail');
const signupUsername = $('#signupUsername');
const signupDisplayName = $('#signupDisplayName');
const signupPassword = $('#signupPassword');
const signupConfirm = $('#signupConfirm');
const signupBtn = $('#signupBtn');
const forgotEmail = $('#forgotEmail');
const forgotBtn = $('#forgotBtn');
const authMessage = $('#authMessage');

const chatApp = $('#chatApp');
const sidebar = $('#sidebar');
const navFriends = $('#navFriends');
const pendingBadge = $('#pendingBadge');
const dmList = $('#dmList');
const newGroupBtn = $('#newGroupBtn');
const userPanel = $('#userPanel');
const userAvatar = $('#userAvatar');
const usernameDisplay = $('#usernameDisplay');
const userStatus = $('#userStatus');
const settingsBtn = $('#settingsBtn');
const accountMenu = $('#accountMenu');
const accountMenuAvatar = $('#accountMenuAvatar');
const accountMenuDisplayName = $('#accountMenuDisplayName');
const accountMenuUsername = $('#accountMenuUsername');
const statusBtn = $('.status-btn');
const statusDropdown = $('#statusDropdown');
const logoutBtn = $('#logoutBtn');
const myProfileBtn = $('#myProfileBtn');
const contextMenu = $('#contextMenu');

const views = $$('.view');
const tabs = $$('.tab');
const tabPanels = $$('.tab-panel');
const onlineRibbon = $('#onlineRibbon');
const allRibbon = $('#allRibbon');
const onlineList = $('#onlineList');
const allList = $('#allList');
const pendingList = $('#pendingList');
const userSearchInput = $('#userSearchInput');
const searchBtn = $('#searchBtn');
const searchResults = $('#searchResults');
const searchResultsList = $('#searchResultsList');
const pendingTabBadge = $('#pendingTabBadge');
const welcomeAddBtn = $('#welcomeAddBtn');

const dmHeaderAvatar = $('#dmHeaderAvatar');
const dmHeaderName = $('#dmHeaderName');
const dmHeaderStatus = $('#dmHeaderStatus');
const dmMessages = $('#dmMessages');
const dmTyping = $('#dmTyping');
const dmInput = $('#dmInput');
const dmSendBtn = $('#dmSendBtn');
const dmViewProfileBtn = $('#dmViewProfileBtn');
const dmDeleteBtn = $('#dmDeleteBtn');
const dmAttachBtn = $('#dmAttachBtn');
const dmMicBtn = $('#dmMicBtn');
const dmAttachMenu = $('#dmAttachMenu');
const dmImageInput = $('#dmImageInput');
const dmFileInput = $('#dmFileInput');
const dmSearchBtn = $('#dmSearchBtn');
const dmMuteBtn = $('#dmMuteBtn');
const dmPinBtn = $('#dmPinBtn');
const dmSearchBar = $('#dmSearchBar');
const dmSearchInput = $('#dmSearchInput');
const dmSearchClose = $('#dmSearchClose');

const groupHeaderAvatar = $('#groupHeaderAvatar');
const groupHeaderName = $('#groupHeaderName');
const groupHeaderMembers = $('#groupHeaderMembers');
const groupMessages = $('#groupMessages');
const groupInput = $('#groupInput');
const groupSendBtn = $('#groupSendBtn');
const groupMembersBtn = $('#groupMembersBtn');
const groupAddMembersBtn = $('#groupAddMembersBtn');
const groupLeaveBtn = $('#groupLeaveBtn');
const groupAttachBtn = $('#groupAttachBtn');
const groupMicBtn = $('#groupMicBtn');
const groupAttachMenu = $('#groupAttachMenu');
const groupImageInput = $('#groupImageInput');
const groupFileInput = $('#groupFileInput');
const groupSearchBtn = $('#groupSearchBtn');
const groupMuteBtn = $('#groupMuteBtn');
const groupSearchBar = $('#groupSearchBar');
const groupSearchInput = $('#groupSearchInput');
const groupSearchClose = $('#groupSearchClose');

const uploadPreview = $('#uploadPreview');
const previewContent = $('#previewContent');
const previewRemove = $('#previewRemove');
const recordingIndicator = $('#recordingIndicator');
const recTime = $('#recTime');
const recCancel = $('#recCancel');
const recSend = $('#recSend');
const groupUploadPreview = $('#groupUploadPreview');
const groupPreviewContent = $('#groupPreviewContent');
const groupPreviewRemove = $('#groupPreviewRemove');
const groupRecordingIndicator = $('#groupRecordingIndicator');
const groupRecTime = $('#groupRecTime');
const groupRecCancel = $('#groupRecCancel');
const groupRecSend = $('#groupRecSend');

const profileViewModal = $('#profileViewModal');
const editProfileModal = $('#editProfileModal');
const editAvatar = $('#editAvatar');
const editBanner = $('#editBanner');
const editDisplayNameInput = $('#editDisplayNameInput');
const editUsernameInput = $('#editUsernameInput');
const editBioInput = $('#editBioInput');
const bioCount = $('#bioCount');
const usernameChangeHint = $('#usernameChangeHint');
const avatarInput = $('#avatarInput');
const bannerInput = $('#bannerInput');

const settingsModal = $('#settingsModal');
const newGroupModal = $('#newGroupModal');
const groupPicker = $('#groupPicker');
const groupNameInput = $('#groupNameInput');
const groupMembersModal = $('#groupMembersModal');
const groupMembersList = $('#groupMembersList');
const groupMembersCount = $('#groupMembersCount');
const addMembersModal = $('#addMembersModal');
const addMembersPicker = $('#addMembersPicker');

const lightbox = $('#lightbox');
const lightboxImg = $('#lightboxImg');
const toastContainer = $('#toastContainer');

// ============================================================
// UTILS
// ============================================================
const AVATAR_COLORS = [
    '#c65d3b', '#b8442e', '#a67c52', '#8b6b47',
    '#5a7d4a', '#6b8e6f', '#4a7d8c', '#5d7ea8',
    '#8b6fa8', '#a85d8b', '#c98b5d', '#8c7a5a'
];

function getColor(name) {
    let hash = 0;
    const str = name || '?';
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name) {
    return (name || '?').charAt(0).toUpperCase();
}

function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
}

function formatTime(ts) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDuration(s) {
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}

function dmKey(a, b) {
    return [a, b].sort().join('_');
}

function timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
}

function dateLabel(ts) {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function dayKey(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function shortTime(ts) {
    const d = new Date(ts);
    const diff = Date.now() - ts;
    if (diff < 86400000) return formatTime(ts);
    if (diff < 7 * 86400000) return d.toLocaleDateString(undefined, { weekday: 'short' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Activity status (new feature)
function activityLabel(uid) {
    const p = onlineUsers[uid];
    if (!p) return 'Offline';
    if (p.online) {
        if (p.status === 'idle') return 'Idle';
        if (p.status === 'dnd') return 'Do not disturb';
        return 'Active now';
    }
    if (p.lastSeen) return `Active ${timeAgo(p.lastSeen)}`;
    return 'Offline';
}

function getStatusClass(uid) {
    const p = onlineUsers[uid];
    if (!p) return 'offline';
    if (!p.online) return 'offline';
    return p.status || 'online';
}

function isChatMuted(key) { return !!mutedChats[key]; }
function isChatPinned(key) { return !!pinnedChats[key]; }

// ============================================================
// TOASTS + SOUND
// ============================================================
function showToast(title, message) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `
        <div class="toast-icon"><i class="fas fa-bell"></i></div>
        <div>
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
    `;
    toastContainer.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 300);
    }, 4000);
}

function playNotifSound() {
    if (!notifSoundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
}

// ============================================================
// AUTH FORM UI
// ============================================================
function showAuthMessage(text, type = 'info') {
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
    if (type !== 'error') setTimeout(() => authMessage.style.display = 'none', 6000);
}

function clearAuthMessage() {
    authMessage.textContent = '';
    authMessage.className = 'auth-message';
    authMessage.style.display = 'none';
}

function showLoginForm() {
    authTitle.textContent = 'Ink';
    authSubtitle.textContent = 'A quiet place to talk.';
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    forgotForm.style.display = 'none';
    clearAuthMessage();
}

function showSignupForm() {
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Takes just a moment.';
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    forgotForm.style.display = 'none';
    clearAuthMessage();
}

function showForgotForm() {
    authTitle.textContent = 'Reset Password';
    authSubtitle.textContent = 'We\'ll send you a reset link.';
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    forgotForm.style.display = 'flex';
    clearAuthMessage();
}

$('#toSignupLink').addEventListener('click', e => { e.preventDefault(); showSignupForm(); });
$('#toLoginLink').addEventListener('click', e => { e.preventDefault(); showLoginForm(); });
$('#forgotLink').addEventListener('click', e => { e.preventDefault(); showForgotForm(); });
$('#backToLoginLink').addEventListener('click', e => { e.preventDefault(); showLoginForm(); });

// ============================================================
// AUTH — Signup / Login / Reset / Logout
// ============================================================
signupBtn.addEventListener('click', async () => {
    clearAuthMessage();
    const email = signupEmail.value.trim();
    const uname = signupUsername.value.trim().toLowerCase();
    const dname = signupDisplayName.value.trim();
    const pass = signupPassword.value;
    const confirm = signupConfirm.value;

    if (!email) return showAuthMessage('Please enter your email.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthMessage('Email is not valid.', 'error');
    if (!uname) return showAuthMessage('Please enter a username.', 'error');
    if (uname.length < 3) return showAuthMessage('Username must be at least 3 characters.', 'error');
    if (uname.length > 14) return showAuthMessage('Username must be 14 characters or less.', 'error');
    if (!/^[a-z0-9_]+$/.test(uname)) return showAuthMessage('Username: lowercase letters, numbers, underscores only.', 'error');
    if (!dname) return showAuthMessage('Please enter a display name.', 'error');
    if (dname.length > 20) return showAuthMessage('Display name must be 20 characters or less.', 'error');
    if (!pass) return showAuthMessage('Please enter a password.', 'error');
    if (pass.length < 6) return showAuthMessage('Password must be at least 6 characters.', 'error');
    if (pass !== confirm) return showAuthMessage('Passwords do not match.', 'error');

    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating...';

    try {
        const snap = await usersRef.child('usernames').child(uname).once('value');
        if (snap.exists()) throw new Error('USERNAME_TAKEN');

        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        const user = cred.user;

        // Wait for auth token to propagate to the Database
        await new Promise(resolve => {
            let done = false;
            const finish = () => { if (!done) { done = true; resolve(); } };
            const unsub = auth.onAuthStateChanged(u => {
                if (u && u.uid === user.uid) { unsub(); finish(); }
            });
            setTimeout(finish, 3000);
        });
        await new Promise(r => setTimeout(r, 200));

        await usersRef.child('usernames').child(uname).set(user.uid);
        await usersRef.child(user.uid).set({
            uid: user.uid,
            email,
            username: uname,
            displayName: dname,
            usernameChangedAt: Date.now(),
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            avatar: '',
            banner: '',
            bio: '',
            status: 'online'
        });
    } catch (err) {
        console.error('=== SIGNUP ERROR ===', err.code, err.message);
        let msg = 'Failed to create account.';
        if (err.code === 'auth/email-already-in-use') msg = 'That email is already registered.';
        else if (err.code === 'auth/invalid-email') msg = 'That email is not valid.';
        else if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
        else if (err.code === 'PERMISSION_DENIED' || (err.message || '').includes('PERMISSION_DENIED')) {
            msg = 'Database permission denied.';
        } else if (err.message === 'USERNAME_TAKEN') msg = 'That username is already taken.';
        showAuthMessage(msg, 'error');
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Create Account';
    }
});

loginBtn.addEventListener('click', async () => {
    clearAuthMessage();
    const email = loginEmail.value.trim();
    const pass = loginPassword.value;
    if (!email) return showAuthMessage('Please enter your email.', 'error');
    if (!pass) return showAuthMessage('Please enter your password.', 'error');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
        let msg = 'Failed to log in.';
        if (err.code === 'auth/user-not-found') msg = 'No account with that email.';
        else if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
        else if (err.code === 'auth/invalid-credential') msg = 'Email or password is incorrect.';
        else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
        showAuthMessage(msg, 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In';
    }
});

loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
signupConfirm.addEventListener('keydown', e => { if (e.key === 'Enter') signupBtn.click(); });

forgotBtn.addEventListener('click', async () => {
    clearAuthMessage();
    const email = forgotEmail.value.trim();
    if (!email) return showAuthMessage('Please enter your email.', 'error');
    forgotBtn.disabled = true;
    forgotBtn.textContent = 'Sending...';
    try {
        await auth.sendPasswordResetEmail(email);
        showAuthMessage('Reset link sent. Check your inbox.', 'success');
        setTimeout(() => showLoginForm(), 3000);
    } catch (err) {
        showAuthMessage('Failed to send reset link.', 'error');
    } finally {
        forgotBtn.disabled = false;
        forgotBtn.textContent = 'Send Reset Link';
    }
});

auth.onAuthStateChanged(async user => {
    if (isInitializing) return;
    if (user) {
        if (isLoggedIn && currentUser && currentUser.uid === user.uid) return;
        isInitializing = true;
        try {
            currentUser = user;
            userId = user.uid;
            await handleLogin(user);
            isLoggedIn = true;
        } finally {
            isInitializing = false;
        }
    } else {
        if (!isLoggedIn && !currentUser) return;
        isInitializing = true;
        try {
            handleLogout();
            isLoggedIn = false;
        } finally {
            isInitializing = false;
        }
    }
});

async function handleLogin(user) {
    try {
        const snap = await usersRef.child(user.uid).once('value');
        const data = snap.val();

        if (data) {
            username = data.username || user.email.split('@')[0].toLowerCase();
            displayName = data.displayName || data.username || username;
            myStatus = data.status || 'online';
            if (!data.displayName) await usersRef.child(user.uid).update({ displayName });
            currentProfile = {
                username,
                displayName,
                bio: data.bio || '',
                avatar: data.avatar || '',
                banner: data.banner || '',
                joined: data.createdAt || Date.now(),
                usernameChangedAt: data.usernameChangedAt || 0
            };
        } else {
            username = user.email.split('@')[0].toLowerCase();
            displayName = username;
            myStatus = 'online';
            currentProfile = {
                username, displayName, bio: '', avatar: '', banner: '',
                joined: Date.now(), usernameChangedAt: 0
            };
            await usersRef.child(user.uid).set({
                uid: user.uid, email: user.email, username, displayName,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                usernameChangedAt: Date.now(),
                status: 'online', avatar: '', banner: '', bio: ''
            });
        }

        updateUserBadge();
        updateSettingsUser();
        updateStatusButton();

        document.body.classList.add('logged-in');
        loginScreen.classList.add('hidden');
        chatApp.style.display = 'grid';

        setPresence(true);
        listenMuted();
        listenPinned();
        listenFriends();
        listenFriendRequests();
        listenPresence();
        listenUnread();
        listenGroups();
        listenSelfProfile();

        switchView('friends');
    } catch (err) {
        console.error('[Auth] Login error:', err);
        await auth.signOut();
    }
}

function handleLogout() {
    setPresence(false);
    currentUser = null;
    username = '';
    displayName = '';
    userId = '';
    currentProfile = null;
    currentDmUser = null;
    currentGroup = null;
    friends = [];
    friendsData = {};
    unreadCounts = {};
    userGroups = {};
    groupsData = {};
    mutedChats = {};
    pinnedChats = {};
    lastMessages = {};
    _lastPresenceHash = '';
    _lastUnreadHash = '';
    _lastRailHash = '';
    _lastFriendsHash = '';
    _lastMutedHash = '';
    _lastPinnedHash = '';
    // Detach last-message listeners
    Object.keys(_lastMsgListeners).forEach(k => {
        try { _lastMsgListeners[k].ref.off('child_added', _lastMsgListeners[k].cb); } catch (e) {}
        try { _lastMsgListeners[k].ref.off('child_changed', _lastMsgListeners[k].cb); } catch (e) {}
        delete _lastMsgListeners[k];
    });
    chatApp.style.display = 'none';
    loginScreen.classList.remove('hidden');
    document.body.classList.remove('logged-in');
    showLoginForm();
}

function setPresence(online) {
    if (!userId) return;
    const ref = presenceRef.child(userId);
    if (online) {
        const status = myStatus === 'invisible' ? 'offline' : myStatus;
        ref.set({
            online: status !== 'offline',
            status: myStatus,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).catch(() => {});
        ref.onDisconnect().set({
            online: false,
            status: 'offline',
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
    } else {
        ref.set({
            online: false,
            status: 'offline',
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).catch(() => {});
    }
}

// ============================================================
// USER BADGE / STATUS UI
// ============================================================
function updateUserBadge() {
    const bg = `linear-gradient(135deg, ${getColor(displayName)}, ${getColor(displayName)}cc)`;
    if (currentProfile?.avatar) {
        userAvatar.style.backgroundImage = `url('${currentProfile.avatar}')`;
        userAvatar.style.backgroundSize = 'cover';
        userAvatar.style.backgroundPosition = 'center';
        userAvatar.textContent = '';
        accountMenuAvatar.style.backgroundImage = `url('${currentProfile.avatar}')`;
        accountMenuAvatar.style.backgroundSize = 'cover';
        accountMenuAvatar.style.backgroundPosition = 'center';
        accountMenuAvatar.textContent = '';
    } else {
        userAvatar.style.backgroundImage = '';
        userAvatar.style.background = bg;
        userAvatar.textContent = getInitial(displayName);
        accountMenuAvatar.style.backgroundImage = '';
        accountMenuAvatar.style.background = bg;
        accountMenuAvatar.textContent = getInitial(displayName);
    }
    usernameDisplay.textContent = displayName;
    accountMenuDisplayName.textContent = displayName;
    accountMenuUsername.textContent = '@' + username;

    userAvatar.classList.remove('status-idle', 'status-dnd', 'status-invisible');
    if (myStatus !== 'online') userAvatar.classList.add('status-' + myStatus);

    const labels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible' };
    userStatus.innerHTML = `<span class="status-dot"></span> ${labels[myStatus]}`;
    userStatus.classList.remove('idle', 'dnd', 'invisible');
    if (myStatus !== 'online') userStatus.classList.add(myStatus);
}

function updateStatusButton() {
    const labels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible' };
    statusBtn.innerHTML = `<span class="status-dot ${myStatus}"></span> ${labels[myStatus]}`;
}

function updateSettingsUser() {
    const a = $('#settingsUserAvatar');
    if (currentProfile?.avatar) {
        a.style.backgroundImage = `url('${currentProfile.avatar}')`;
        a.style.backgroundSize = 'cover';
        a.style.backgroundPosition = 'center';
        a.textContent = '';
    } else {
        const bg = `linear-gradient(135deg, ${getColor(displayName)}, ${getColor(displayName)}cc)`;
        a.style.backgroundImage = '';
        a.style.background = bg;
        a.textContent = getInitial(displayName);
    }
    $('#settingsUserName').textContent = displayName;
    $('#settingsUserUsername').textContent = '@' + username;
    $('#infoDisplayName').textContent = displayName;
    $('#infoUsername').textContent = '@' + username;
    $('#infoEmail').textContent = currentUser?.email || '';
    $('#infoBio').textContent = currentProfile?.bio || 'No bio yet';
}

// ============================================================
// VIEW SWITCHING
// ============================================================
function switchView(name) {
    views.forEach(v => v.classList.toggle('active', v.dataset.view === name));
    navFriends.classList.toggle('active', name === 'friends');
    $$('.dm-item').forEach(el => el.classList.toggle('active',
        (el.dataset.uid === currentDmUser?.uid) || (el.dataset.gid === currentGroup?.id)
    ));
}

navFriends.addEventListener('click', () => switchView('friends'));
welcomeAddBtn.addEventListener('click', () => {
    switchView('friends');
    const t = document.querySelector('.tab[data-tab="add"]');
    if (t) t.click();
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(x => x.classList.toggle('active', x === tab));
        tabPanels.forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
        if (tab.dataset.tab === 'add') setTimeout(() => userSearchInput.focus(), 100);
    });
});

// ============================================================
// ACCOUNT MENU
// ============================================================
userPanel.addEventListener('click', e => {
    if (e.target.closest('#settingsBtn')) return;
    e.stopPropagation();
    accountMenu.classList.toggle('open');
});

document.addEventListener('click', () => {
    accountMenu.classList.remove('open');
    statusDropdown.classList.remove('open');
    contextMenu.classList.remove('open');
});

accountMenu.addEventListener('click', e => e.stopPropagation());

settingsBtn.addEventListener('click', e => {
    e.stopPropagation();
    accountMenu.classList.remove('open');
    openSettings('account');
});

statusBtn.addEventListener('click', e => {
    e.stopPropagation();
    statusDropdown.classList.toggle('open');
});

$$('.status-option').forEach(opt => {
    opt.addEventListener('click', async () => {
        myStatus = opt.dataset.status;
        statusDropdown.classList.remove('open');
        updateStatusButton();
        updateUserBadge();
        await usersRef.child(userId).update({ status: myStatus });
        setPresence(true);
    });
});

// ============================================================
// DRAFT AUTO-SAVE (new feature)
// ============================================================
let _draftTimer = null;

function setupDraftAutosave(inputEl, keyFn) {
    inputEl.addEventListener('input', () => {
        clearTimeout(_draftTimer);
        _draftTimer = setTimeout(async () => {
            const key = keyFn();
            if (!key || !userId) return;
            const val = inputEl.value;
            if (val) await draftsRef.child(userId).child(key).set(val);
            else await draftsRef.child(userId).child(key).remove();
        }, 500);
    });
}

async function loadDraft(key, inputEl) {
    if (!key || !userId) return;
    try {
        const snap = await draftsRef.child(userId).child(key).once('value');
        const val = snap.val();
        if (val) inputEl.value = val;
    } catch (e) {}
}

async function clearDraft(key) {
    if (!key || !userId) return;
    try { await draftsRef.child(userId).child(key).remove(); } catch (e) {}
}

// ============================================================
// (Part 2 continues — listeners, friends, DMs, groups)
// ============================================================// ============================================================
// LISTENERS — performance-first
// ============================================================

function listenPresence() {
    presenceRef.on('value', snap => {
        onlineUsers = snap.val() || {};
        const hash = Object.keys(onlineUsers).sort().map(k => {
            const p = onlineUsers[k];
            return `${k}:${p.online ? 1 : 0}:${p.status || ''}:${p.lastSeen || 0}`;
        }).join('|');
        if (hash === _lastPresenceHash) return;
        _lastPresenceHash = hash;
        renderAllFriends();
        renderRailDms();
    });
}

function listenUnread() {
    unreadRef.child(userId).on('value', snap => {
        unreadCounts = snap.val() || {};
        const hash = JSON.stringify(unreadCounts);
        if (hash === _lastUnreadHash) return;
        _lastUnreadHash = hash;
        renderRailDms();
    });
}

function listenMuted() {
    mutedRef.child(userId).on('value', snap => {
        mutedChats = snap.val() || {};
        const hash = JSON.stringify(mutedChats);
        if (hash === _lastMutedHash) return;
        _lastMutedHash = hash;
        _lastRailHash = '';
        renderRailDms();
        updateMuteButtons();
    });
}

function listenPinned() {
    pinnedRef.child(userId).on('value', snap => {
        pinnedChats = snap.val() || {};
        const hash = JSON.stringify(pinnedChats);
        if (hash === _lastPinnedHash) return;
        _lastPinnedHash = hash;
        _lastRailHash = '';
        renderRailDms();
        updatePinButtons();
    });
}

function listenGroups() {
    groupsRef.orderByChild('members/' + userId).equalTo(true).on('value', async snap => {
        const data = snap.val() || {};
        userGroups = data;
        groupsData = {};
        Object.keys(data).forEach(gid => { groupsData[gid] = data[gid]; });

        _lastRailHash = '';
        renderRailDms();
        listenLastMessages();

        if (currentGroup && data[currentGroup.id]) {
            currentGroup = { id: currentGroup.id, ...data[currentGroup.id] };
            groupHeaderName.textContent = currentGroup.name || 'Group';
            const mc = Object.keys(currentGroup.members || {}).length;
            groupHeaderMembers.textContent = `${mc} member${mc > 1 ? 's' : ''}`;
        }
    });
}

// Friend profiles — one listener per friend, cached
const _friendProfileListeners = {};
function listenFriendProfiles() {
    Object.keys(_friendProfileListeners).forEach(uid => {
        if (!friends.includes(uid)) {
            try { usersRef.child(uid).off('value', _friendProfileListeners[uid]); } catch (e) {}
            delete _friendProfileListeners[uid];
        }
    });

    friends.forEach(uid => {
        if (_friendProfileListeners[uid]) return;
        const handler = snap => {
            const data = snap.val();
            if (!data) return;
            const prev = friendsData[uid];
            if (prev && JSON.stringify(prev) === JSON.stringify(data)) return;
            friendsData[uid] = data;
            renderAllFriends();
            _lastRailHash = '';
            renderRailDms();
            if (currentDmUser?.uid === uid) {
                updateDmHeader();
            }
        };
        _friendProfileListeners[uid] = handler;
        usersRef.child(uid).on('value', handler);
    });
}

function listenSelfProfile() {
    usersRef.child(userId).on('value', snap => {
        const data = snap.val();
        if (!data) return;
        const changed =
            data.avatar !== currentProfile?.avatar ||
            data.displayName !== currentProfile?.displayName ||
            data.banner !== currentProfile?.banner ||
            data.bio !== currentProfile?.bio ||
            data.status !== myStatus;

        if (!changed) return;

        currentProfile = {
            ...(currentProfile || {}),
            username: data.username || currentProfile?.username,
            displayName: data.displayName || currentProfile?.displayName,
            bio: data.bio || '',
            avatar: data.avatar || '',
            banner: data.banner || ''
        };
        displayName = currentProfile.displayName;
        username = currentProfile.username;
        myStatus = data.status || myStatus;

        updateUserBadge();
        updateSettingsUser();
        updateStatusButton();
    });
}

// ============================================================
// LAST MESSAGES — only one small request per conversation
// This is the fix for the 23 MB download.
// ============================================================
function listenLastMessages() {
    // DMs — only subscribe to conversations involving current user
    friends.forEach(uid => {
        const key = dmKey(userId, uid);
        const listenKey = 'dm_' + key;
        if (_lastMsgListeners[listenKey]) return;

        const ref = dmsRef.child(key).child('messages').limitToLast(1);
        const cb = snap => {
            snap.forEach(child => {
                const m = child.val() || {};
                // Strip base64 media data — we only need metadata for preview
                if (m.type === 'image' || m.type === 'voice' || m.type === 'file') {
                    delete m.data;
                }
                lastMessages[listenKey] = m;
            });
            _lastRailHash = '';
            renderRailDms();
        };
        ref.on('child_added', cb);
        ref.on('child_changed', cb);
        _lastMsgListeners[listenKey] = { ref, cb };
    });

    // Groups — one listener per group you belong to
    Object.keys(userGroups).forEach(gid => {
        const listenKey = 'group_' + gid;
        if (_lastMsgListeners[listenKey]) return;

        const ref = groupsRef.child(gid).child('messages').limitToLast(1);
        const cb = snap => {
            snap.forEach(child => {
                const m = child.val() || {};
                if (m.type === 'image' || m.type === 'voice' || m.type === 'file') {
                    delete m.data;
                }
                lastMessages[listenKey] = m;
            });
            _lastRailHash = '';
            renderRailDms();
        };
        ref.on('child_added', cb);
        ref.on('child_changed', cb);
        _lastMsgListeners[listenKey] = { ref, cb };
    });
}

// ============================================================
// FRIENDS — subscribe to friend list, fetch profiles once
// ============================================================
function listenFriends() {
    friendsRef.child(userId).on('value', async snap => {
        const data = snap.val() || {};
        const newFriends = Object.keys(data);
        const hash = newFriends.sort().join(',');
        if (hash === _lastFriendsHash) return;
        _lastFriendsHash = hash;

        const toFetch = newFriends.filter(uid => !friendsData[uid]);
        friends = newFriends;

        // Clean removed friends
        Object.keys(friendsData).forEach(uid => {
            if (!newFriends.includes(uid)) delete friendsData[uid];
        });

        // Fetch profiles of new friends only
        if (toFetch.length > 0) {
            const results = await Promise.all(
                toFetch.map(uid =>
                    usersRef.child(uid).once('value').then(s => ({ uid, data: s.val() }))
                )
            );
            results.forEach(r => { if (r.data) friendsData[r.uid] = r.data; });
        }

        listenFriendProfiles();
        renderAllFriends();
        _lastRailHash = '';
        renderRailDms();
        listenLastMessages();

        if (friends.length === 0 && pendingRequests.length === 0 && Object.keys(userGroups).length === 0) {
            switchView('welcome');
        }
    });
}

function listenFriendRequests() {
    friendRequestsRef.child(userId).on('value', async snap => {
        const data = snap.val() || {};
        pendingRequests = [];
        for (const uid of Object.keys(data)) {
            const u = await usersRef.child(uid).once('value');
            if (u.exists()) {
                pendingRequests.push({ uid, ...u.val(), requestAt: data[uid].at });
            }
        }
        renderPending();
        updatePendingBadge();
    });
}

// ============================================================
// FRIEND ACTIONS — parallel + idempotent
// ============================================================
async function sendFriendRequest(targetUid) {
    if (_sendingFriendRequest) return;
    if (targetUid === userId) { alert('You cannot add yourself.'); return; }

    _sendingFriendRequest = true;
    showToast('Sending request', 'Please wait...');

    try {
        // All 3 pre-checks in parallel (was 3 sequential = ~525ms, now ~175ms)
        const [f, s, r] = await Promise.all([
            friendsRef.child(userId).child(targetUid).once('value'),
            friendRequestsRef.child('sent_' + userId).child(targetUid).once('value'),
            friendRequestsRef.child(userId).child(targetUid).once('value')
        ]);

        if (f.exists()) { showToast('Already friends', 'You two are already connected.'); return; }
        if (s.exists()) { showToast('Already sent', 'You already sent them a request.'); return; }
        if (r.exists()) {
            // They already sent you a request → auto-accept
            await acceptFriendRequest(targetUid);
            return;
        }

        // Both writes in a single atomic update (~350ms instead of ~700ms)
        const updates = {};
        updates[`friendRequests/${targetUid}/${userId}`] = { at: firebase.database.ServerValue.TIMESTAMP };
        updates[`friendRequests/sent_${userId}/${targetUid}`] = { at: firebase.database.ServerValue.TIMESTAMP };
        await friendRequestsRef.root.update(updates);

        showToast('Request sent', 'Waiting for them to accept.');
        searchResults.style.display = 'none';
        userSearchInput.value = '';
    } catch (err) {
        console.error('[FriendRequest] Failed:', err);
        showToast('Failed', 'Could not send request. Try again.');
    } finally {
        _sendingFriendRequest = false;
    }
}

async function acceptFriendRequest(fromUid) {
    const updates = {};
    updates[`friends/${userId}/${fromUid}`] = true;
    updates[`friends/${fromUid}/${userId}`] = true;
    updates[`friendRequests/${userId}/${fromUid}`] = null;
    updates[`friendRequests/sent_${fromUid}/${userId}`] = null;
    await friendsRef.root.update(updates);
    showToast('Friend added', 'You are now connected.');
}

async function declineFriendRequest(fromUid) {
    const updates = {};
    updates[`friendRequests/${userId}/${fromUid}`] = null;
    updates[`friendRequests/sent_${fromUid}/${userId}`] = null;
    await friendRequestsRef.root.update(updates);
}

async function removeFriend(uid) {
    if (!confirm('Remove this friend?')) return;
    const updates = {};
    updates[`friends/${userId}/${uid}`] = null;
    updates[`friends/${uid}/${userId}`] = null;
    await friendsRef.root.update(updates);
    showToast('Friend removed', 'You are no longer connected.');
}

// ============================================================
// USER SEARCH — parallel
// ============================================================
async function searchUsers() {
    const query = userSearchInput.value.trim().toLowerCase();
    if (!query) { searchResults.style.display = 'none'; return; }
    searchResultsList.innerHTML = '<div class="empty-message">Searching...</div>';
    searchResults.style.display = 'block';

    try {
        const snap = await usersRef.child('usernames').child(query).once('value');
        if (!snap.exists()) {
            searchResultsList.innerHTML = '<div class="empty-message"><strong>No one found</strong>No user has that username.</div>';
            return;
        }
        const uid = snap.val();

        const [uSnap, sentSnap, recvSnap] = await Promise.all([
            usersRef.child(uid).once('value'),
            friendRequestsRef.child('sent_' + userId).child(uid).once('value'),
            friendRequestsRef.child(userId).child(uid).once('value')
        ]);

        const userData = uSnap.val();
        if (!userData) {
            searchResultsList.innerHTML = '<div class="empty-message">User profile not found.</div>';
            return;
        }

        const isSelf = uid === userId;
        const isFriend = friends.includes(uid);
        const isSent = sentSnap.exists();
        const isRecv = recvSnap.exists();

        searchResultsList.innerHTML = '';
        searchResultsList.appendChild(renderUserCard(uid, userData, {
            isSelf, isFriend, isSent, isRecv, showStatus: true
        }));
    } catch (err) {
        console.error('[Search] Error:', err);
        searchResultsList.innerHTML = '<div class="empty-message">Search failed.</div>';
    }
}

searchBtn.addEventListener('click', searchUsers);
userSearchInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchUsers(); });

// ============================================================
// RENDER — user cards
// ============================================================
function renderUserCard(uid, userData, opts = {}) {
    const { isSelf, isFriend, isSent, isRecv, showStatus } = opts;
    const dname = userData.displayName || userData.username || 'Unknown';
    const uname = userData.username || 'unknown';
    const color = getColor(dname);
    const status = getStatusClass(uid);
    const div = document.createElement('div');
    div.className = 'user-card';

    const avatarHtml = userData.avatar
        ? `<div class="user-card-avatar" style="background-image: url('${userData.avatar}');" data-action="profile" data-username="${uname}"><div class="dot ${status}"></div></div>`
        : `<div class="user-card-avatar" style="background: linear-gradient(135deg, ${color}, ${color}cc);" data-action="profile" data-username="${uname}">${getInitial(dname)}<div class="dot ${status}"></div></div>`;

    const statusText = showStatus
        ? `<div class="user-card-status ${status}">@${escapeHtml(uname)} · ${activityLabel(uid)}</div>`
        : '';

    let actionsHtml = '';
    if (isSelf) actionsHtml = '<span style="font-size:0.75rem;color:var(--ink-muted);padding:0 8px;font-weight:500;">You</span>';
    else if (isFriend) actionsHtml = `<button class="user-card-btn dm" data-action="dm" data-uid="${uid}" title="Message"><i class="fas fa-comment"></i></button>`;
    else if (isRecv) actionsHtml = `
        <button class="user-card-btn accept" data-action="accept" data-uid="${uid}" title="Accept"><i class="fas fa-check"></i></button>
        <button class="user-card-btn decline" data-action="decline" data-uid="${uid}" title="Decline"><i class="fas fa-times"></i></button>`;
    else if (isSent) actionsHtml = '<span class="user-card-btn" style="color:var(--warning);cursor:default;" title="Request pending"><i class="fas fa-clock"></i></span>';
    else actionsHtml = `<button class="user-card-btn" data-action="add" data-uid="${uid}" title="Add friend"><i class="fas fa-user-plus"></i></button>`;

    div.innerHTML = `
        ${avatarHtml}
        <div class="user-card-info">
            <div class="user-card-name" data-action="profile" data-username="${uname}">${escapeHtml(dname)}</div>
            ${statusText}
        </div>
        <div class="user-card-actions">${actionsHtml}</div>
    `;

    div.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            const action = btn.dataset.action;
            if (action === 'add') sendFriendRequest(btn.dataset.uid);
            else if (action === 'accept') acceptFriendRequest(btn.dataset.uid);
            else if (action === 'decline') declineFriendRequest(btn.dataset.uid);
            else if (action === 'dm') openDM(btn.dataset.uid, userData.displayName || userData.username, userData);
            else if (action === 'profile') viewProfile(btn.dataset.username);
        });
    });
    return div;
}

// ============================================================
// RENDER — friend ribbon + friends list
// ============================================================
function renderRibbon(container, uids) {
    container.innerHTML = '';
    if (uids.length === 0) return;

    uids.forEach(uid => {
        const u = friendsData[uid];
        if (!u) return;
        const dname = u.displayName || u.username;
        const color = getColor(dname);
        const status = getStatusClass(uid);

        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'friend-tile';
        tile.dataset.uid = uid;

        const avatarInner = u.avatar
            ? `<div class="friend-tile-avatar" style="background-image:url('${u.avatar}');"><div class="dot ${status}"></div></div>`
            : `<div class="friend-tile-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${getInitial(dname)}<div class="dot ${status}"></div></div>`;

        tile.innerHTML = `
            ${avatarInner}
            <div class="friend-tile-name">${escapeHtml(dname)}</div>
        `;
        tile.addEventListener('click', () => openDM(uid, dname, u));
        tile.addEventListener('contextmenu', e => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, uid);
        });
        container.appendChild(tile);
    });
}

function renderAllFriends() {
    const online = friends.filter(uid => onlineUsers[uid]?.online);
    const offline = friends.filter(uid => !onlineUsers[uid]?.online);

    // Online ribbon
    if (onlineRibbon) renderRibbon(onlineRibbon, online);
    onlineList.innerHTML = '';
    if (friends.length === 0) {
        onlineList.innerHTML = '<div class="empty-message"><strong>No friends yet</strong>Search for someone by username to get started.</div>';
    } else if (online.length === 0) {
        onlineList.innerHTML = '<div class="empty-message">No one is active right now.</div>';
    } else {
        online.forEach(uid => {
            const u = friendsData[uid];
            if (u) onlineList.appendChild(renderUserCard(uid, u, { isFriend: true, showStatus: true }));
        });
    }

    // All ribbon
    if (allRibbon) renderRibbon(allRibbon, friends);
    allList.innerHTML = '';
    if (friends.length === 0) {
        allList.innerHTML = '<div class="empty-message"><strong>No friends yet</strong>Add someone using the Add Friend tab.</div>';
    } else {
        friends.forEach(uid => {
            const u = friendsData[uid];
            if (u) allList.appendChild(renderUserCard(uid, u, { isFriend: true, showStatus: true }));
        });
    }
}

function renderPending() {
    pendingList.innerHTML = '';
    if (pendingRequests.length === 0) {
        pendingList.innerHTML = '<div class="empty-message">No pending requests.</div>';
        return;
    }
    pendingRequests.forEach(u => {
        pendingList.appendChild(renderUserCard(u.uid, u, { isRecv: true, showStatus: true }));
    });
}

function updatePendingBadge() {
    const count = pendingRequests.length;
    if (count > 0) {
        pendingBadge.textContent = count;
        pendingBadge.style.display = 'flex';
        pendingTabBadge.textContent = count;
    } else {
        pendingBadge.style.display = 'none';
        pendingTabBadge.textContent = '0';
    }
}

// ============================================================
// RENDER — conversation rail
// ============================================================
async function renderRailDms() {
    // Hash-based skip — only re-render when something visible changed
    const hashParts = [];
    for (const uid of friends) {
        const u = friendsData[uid];
        if (!u) continue;
        const lm = lastMessages['dm_' + dmKey(userId, uid)];
        hashParts.push(
            `${uid}|${u.displayName || ''}|${u.avatar ? '1' : '0'}|${getStatusClass(uid)}|` +
            `${unreadCounts['dm_' + uid] || 0}|${isChatMuted('dm_' + uid) ? 'M' : ''}|${isChatPinned('dm_' + uid) ? 'P' : ''}|` +
            `${(lm?.text || lm?.type || '').slice(0, 20)}|${lm?.timestamp || 0}`
        );
    }
    for (const gid of Object.keys(userGroups)) {
        const lm = lastMessages['group_' + gid];
        hashParts.push(
            `${gid}|${userGroups[gid].name || ''}|${unreadCounts['group_' + gid] || 0}|` +
            `${isChatMuted('group_' + gid) ? 'M' : ''}|${isChatPinned('group_' + gid) ? 'P' : ''}|` +
            `${(lm?.text || lm?.type || '').slice(0, 20)}|${lm?.timestamp || 0}`
        );
    }
    const newHash = hashParts.join(';');
    if (newHash === _lastRailHash) return;
    _lastRailHash = newHash;

    const prevScroll = dmList.scrollTop;
    dmList.innerHTML = '';

    if (friends.length === 0 && Object.keys(userGroups).length === 0) {
        dmList.innerHTML = '<div class="dm-empty">No conversations yet</div>';
        return;
    }

    // Build items array
    const items = [];
    for (const uid of friends) {
        const u = friendsData[uid];
        if (!u) continue;
        const lm = lastMessages['dm_' + dmKey(userId, uid)];
        items.push({
            type: 'dm',
            uid,
            data: u,
            lm,
            sort: lm?.timestamp || 0,
            pinned: isChatPinned('dm_' + uid)
        });
    }
    for (const gid of Object.keys(userGroups)) {
        const g = userGroups[gid];
        if (!g) continue;
        const lm = lastMessages['group_' + gid];
        items.push({
            type: 'group',
            gid,
            data: g,
            lm,
            sort: lm?.timestamp || 0,
            pinned: isChatPinned('group_' + gid)
        });
    }

    // Sort: pinned first, then by latest timestamp
    items.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.sort - a.sort;
    });

    for (const item of items) {
        const el = document.createElement('button');
        el.type = 'button';

        if (item.type === 'dm') {
            const u = item.data;
            const dname = u.displayName || u.username;
            const color = getColor(dname);
            const status = getStatusClass(item.uid);
            const unread = unreadCounts['dm_' + item.uid] || 0;
            const muted = isChatMuted('dm_' + item.uid);
            el.dataset.uid = item.uid;

            const avatarHtml = u.avatar
                ? `<div class="dm-item-avatar" style="background-image:url('${u.avatar}');">${status !== 'offline' ? `<div class="dm-dot ${status}"></div>` : ''}</div>`
                : `<div class="dm-item-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${getInitial(dname)}${status !== 'offline' ? `<div class="dm-dot ${status}"></div>` : ''}</div>`;

            let preview = 'No messages yet';
            if (item.lm) {
                if (item.lm.type === 'image') preview = 'Photo';
                else if (item.lm.type === 'file') preview = 'File';
                else if (item.lm.type === 'voice') preview = 'Voice message';
                else preview = item.lm.text || '';
                if (item.lm.userId === userId) preview = 'You: ' + preview;
            }

            const timeStr = item.lm ? shortTime(item.lm.timestamp) : '';
            el.className = 'dm-item' + ((unread > 0 && !muted) ? ' unread' : '') + (item.pinned ? ' pinned' : '');
            el.innerHTML = `
                ${avatarHtml}
                <div class="dm-item-body">
                    <div class="dm-item-top">
                        <span class="dm-item-name">${escapeHtml(dname)}</span>
                        <span class="dm-item-time">${timeStr}</span>
                    </div>
                    <div class="dm-item-preview">${escapeHtml(preview)}</div>
                </div>
                ${unread > 0 && !muted ? `<span class="dm-item-badge">${unread}</span>` : ''}
            `;
            el.addEventListener('click', () => openDM(item.uid, dname, u));
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, item.uid);
            });
        } else {
            const g = item.data;
            const unread = unreadCounts['group_' + item.gid] || 0;
            const muted = isChatMuted('group_' + item.gid);
            el.dataset.gid = item.gid;

            let preview = 'No messages yet';
            if (item.lm) {
                if (item.lm.type === 'image') preview = 'Photo';
                else if (item.lm.type === 'file') preview = 'File';
                else if (item.lm.type === 'voice') preview = 'Voice message';
                else preview = item.lm.text || '';
                preview = (item.lm.displayName || item.lm.user || 'Someone') + ': ' + preview;
            }

            const timeStr = item.lm ? shortTime(item.lm.timestamp) : '';
            el.className = 'dm-item' + ((unread > 0 && !muted) ? ' unread' : '') + (item.pinned ? ' pinned' : '');
            el.innerHTML = `
                <div class="dm-item-avatar group-avatar"><i class="fas fa-users" style="font-size:0.8rem;"></i></div>
                <div class="dm-item-body">
                    <div class="dm-item-top">
                        <span class="dm-item-name">${escapeHtml(g.name || 'Group')}</span>
                        <span class="dm-item-time">${timeStr}</span>
                    </div>
                    <div class="dm-item-preview">${escapeHtml(preview)}</div>
                </div>
                ${unread > 0 && !muted ? `<span class="dm-item-badge">${unread}</span>` : ''}
            `;
            el.addEventListener('click', () => openGroup(item.gid));
        }

        dmList.appendChild(el);
    }

    $$('.dm-item').forEach(el => el.classList.toggle('active',
        (el.dataset.uid === currentDmUser?.uid) || (el.dataset.gid === currentGroup?.id)
    ));

    dmList.scrollTop = prevScroll;
}

// ============================================================
// CONTEXT MENU
// ============================================================
let _contextTarget = null;

function showContextMenu(x, y, uid) {
    _contextTarget = uid;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.dataset.uid = uid;
    contextMenu.classList.add('open');
}

contextMenu.querySelectorAll('.context-item').forEach(item => {
    item.addEventListener('click', async () => {
        const action = item.dataset.action;
        const uid = _contextTarget;
        contextMenu.classList.remove('open');
        if (!uid) return;
        const u = friendsData[uid];

        if (action === 'profile') {
            if (u) viewProfile(u.username);
        } else if (action === 'mark-read') {
            await unreadRef.child(userId).child('dm_' + uid).remove();
            showToast('Marked read', 'Conversation cleared.');
        } else if (action === 'pin') {
            const key = 'dm_' + uid;
            const nowPinned = !isChatPinned(key);
            if (nowPinned) await pinnedRef.child(userId).child(key).set(true);
            else await pinnedRef.child(userId).child(key).remove();
            showToast(nowPinned ? 'Pinned' : 'Unpinned', nowPinned ? 'Moved to top.' : 'Back to normal.');
        } else if (action === 'mute') {
            const key = 'dm_' + uid;
            const nowMuted = !isChatMuted(key);
            if (nowMuted) await mutedRef.child(userId).child(key).set(true);
            else await mutedRef.child(userId).child(key).remove();
            showToast(nowMuted ? 'Muted' : 'Unmuted', nowMuted ? 'Notifications muted.' : 'Notifications on.');
        } else if (action === 'remove') {
            if (u && confirm(`Remove ${u.displayName || u.username}?`)) removeFriend(uid);
        } else if (action === 'delete') {
            if (!confirm('Delete this conversation?')) return;
            await dmsRef.child(dmKey(userId, uid)).remove();
            await unreadRef.child(userId).child('dm_' + uid).remove();
            if (currentDmUser?.uid === uid) switchView('friends');
            showToast('Deleted', 'Conversation removed.');
        }
    });
});

// ============================================================
// (Part 3 continues — DMs, groups, media, voice)
// ============================================================// ============================================================
// DMs — open, render, send
// ============================================================
function updateDmHeader() {
    if (!currentDmUser) return;
    const u = friendsData[currentDmUser.uid];
    if (!u) return;
    const dname = u.displayName || u.username;
    const color = getColor(dname);
    dmHeaderName.textContent = dname;

    if (u.avatar) {
        dmHeaderAvatar.style.backgroundImage = `url('${u.avatar}')`;
        dmHeaderAvatar.style.backgroundSize = 'cover';
        dmHeaderAvatar.style.backgroundPosition = 'center';
        dmHeaderAvatar.textContent = '';
    } else {
        dmHeaderAvatar.style.backgroundImage = '';
        dmHeaderAvatar.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
        dmHeaderAvatar.textContent = getInitial(dname);
    }

    const status = getStatusClass(currentDmUser.uid);
    dmHeaderStatus.textContent = activityLabel(currentDmUser.uid);
    dmHeaderStatus.className = 'dm-header-status ' + status;
}

function updateMuteButtons() {
    if (currentDmUser) {
        const m = isChatMuted('dm_' + currentDmUser.uid);
        dmMuteBtn.classList.toggle('active-mute', m);
        dmMuteBtn.innerHTML = m
            ? '<i class="fas fa-bell-slash"></i>'
            : '<i class="fas fa-bell"></i>';
    }
    if (currentGroup) {
        const m = isChatMuted('group_' + currentGroup.id);
        groupMuteBtn.classList.toggle('active-mute', m);
        groupMuteBtn.innerHTML = m
            ? '<i class="fas fa-bell-slash"></i>'
            : '<i class="fas fa-bell"></i>';
    }
}

function updatePinButtons() {
    if (currentDmUser) {
        const p = isChatPinned('dm_' + currentDmUser.uid);
        dmPinBtn.innerHTML = p
            ? '<i class="fas fa-thumbtack" style="color:var(--accent);"></i>'
            : '<i class="fas fa-thumbtack"></i>';
    }
}

async function openDM(uid, dname, userData) {
    currentDmUser = { uid, displayName: dname };
    currentGroup = null;
    if (!friendsData[uid] && userData) friendsData[uid] = userData;

    updateDmHeader();
    updateMuteButtons();
    updatePinButtons();
    switchView('dm');
    dmSearchBar.style.display = 'none';

    await unreadRef.child(userId).child('dm_' + uid).remove();

    // Detach old listener
    if (window._dmCurrentListener) {
        try { window._dmCurrentListener.ref.off('child_added', window._dmCurrentListener.cb); } catch (e) {}
    }

    dmMessages.innerHTML = '';
    dmLastMsgs = [];
    const key = dmKey(userId, uid);
    const ref = dmsRef.child(key).child('messages');

    const cb = snap => {
        const msg = snap.val();
        if (!msg) return;
        msg._id = snap.key;
        dmLastMsgs.push(msg);
        renderDmMessage(msg);
        if (msg.userId !== userId) {
            if (!isChatMuted('dm_' + uid)) playNotifSound();
        }
    };
    ref.limitToLast(60).on('child_added', cb);
    window._dmCurrentListener = { ref, cb };

    // Typing indicator
    typingRef.child(key).on('value', snap => {
        const t = snap.val();
        if (!t) { dmTyping.textContent = ''; return; }
        const typers = Object.keys(t).filter(k => k !== userId);
        if (typers.length > 0) {
            dmTyping.innerHTML = `${escapeHtml(dname)} is typing<span>.</span><span>.</span><span>.</span>`;
        } else {
            dmTyping.textContent = '';
        }
    });

    // Load draft for this conversation
    await loadDraft('dm_' + uid, dmInput);

    dmInput.focus();
    _lastRailHash = '';
    renderRailDms();
}

// ============================================================
// RENDER — DM message
// ============================================================
function renderDmMessage(msg) {
    const isOwn = msg.userId === userId;
    const div = document.createElement('div');
    div.className = 'message' + (isOwn ? ' own' : '');
    const time = formatTime(msg.timestamp);

    // Date separator
    if (dateSeparatorsEnabled) {
        const last = dmMessages.lastElementChild;
        const lastTs = last?.dataset?.ts;
        if (!lastTs || dayKey(parseInt(lastTs)) !== dayKey(msg.timestamp)) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateLabel(msg.timestamp);
            dmMessages.appendChild(sep);
        }
    }

    const senderData = isOwn ? (currentProfile || {}) : (friendsData[msg.userId] || msg);
    const nameColor = senderData?.nameColor || getColor(msg.displayName || msg.user);
    const senderAvatar = senderData?.avatar || msg.avatar || '';

    let avatarStyle, avatarContent;
    if (senderAvatar) {
        avatarStyle = `background-image: url('${senderAvatar}'); background-size: cover; background-position: center;`;
        avatarContent = '';
    } else {
        avatarStyle = `background: linear-gradient(135deg, ${nameColor}, ${nameColor}cc);`;
        avatarContent = getInitial(msg.displayName || msg.user);
    }

    let contentHtml = '';
    if (msg.type === 'image') {
        contentHtml = `<div class="msg-media" onclick="openLightbox('${msg.data}')"><img src="${msg.data}" loading="lazy" /></div>`;
    } else if (msg.type === 'file') {
        contentHtml = `<a class="msg-file" href="${msg.data}" download="${escapeHtml(msg.fileName || 'file')}">
            <i class="fas fa-file"></i>
            <div class="file-info">
                <span class="file-name">${escapeHtml(msg.fileName || 'File')}</span>
                <span class="file-size">${formatBytes(msg.fileSize || 0)}</span>
            </div>
        </a>`;
    } else if (msg.type === 'voice') {
        contentHtml = `<div class="msg-voice">
            <button class="voice-play" onclick="playVoice(this, '${msg.data}')"><i class="fas fa-play"></i></button>
            <div class="voice-wave">${generateWaveBars()}</div>
            <span class="voice-time">${formatDuration(msg.duration || 0)}</span>
        </div>`;
    } else {
        contentHtml = `<div class="msg-text">${escapeHtml(msg.text || '')}</div>`;
    }

    div.dataset.ts = msg.timestamp;
    div.innerHTML = `
        <div class="msg-avatar" style="${avatarStyle}" onclick="if('${msg.userId}' !== '${userId}') viewProfile('${escapeHtml(msg.user || '')}')">${avatarContent}</div>
        <div class="msg-content">
            <div class="msg-header">
                <span class="name">${escapeHtml(msg.displayName || msg.user)}</span>
                <span class="time">${time}</span>
            </div>
            ${contentHtml}
        </div>
        ${buildMessageActions(msg, isOwn)}
    `;
    bindMessageActions(div, msg, 'dm');
    dmMessages.appendChild(div);

    const nearBottom = dmMessages.scrollHeight - dmMessages.scrollTop - dmMessages.clientHeight < 120;
    if (nearBottom || msg.userId === userId) {
        dmMessages.scrollTop = dmMessages.scrollHeight;
    }
}

function buildMessageActions(msg, isOwn) {
    const copyBtn = `<button class="msg-action-btn" data-msg-action="copy" title="Copy"><i class="fas fa-copy"></i></button>`;
    const delBtn = isOwn
        ? `<button class="msg-action-btn danger" data-msg-action="delete" title="Delete"><i class="fas fa-trash"></i></button>`
        : '';
    return `<div class="msg-actions">${copyBtn}${delBtn}</div>`;
}

function bindMessageActions(div, msg, source) {
    div.querySelectorAll('[data-msg-action]').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            const action = btn.dataset.msgAction;
            if (action === 'copy') {
                const text = msg.text || msg.fileName || 'message';
                try {
                    await navigator.clipboard.writeText(text);
                    showToast('Copied', 'Message copied to clipboard.');
                } catch (err) {}
            } else if (action === 'delete') {
                if (!confirm('Delete this message for everyone?')) return;
                try {
                    if (source === 'dm' && currentDmUser) {
                        const key = dmKey(userId, currentDmUser.uid);
                        await dmsRef.child(key).child('messages').child(msg._id).remove();
                    } else if (source === 'group' && currentGroup) {
                        await groupsRef.child(currentGroup.id).child('messages').child(msg._id).remove();
                    }
                } catch (err) { console.error(err); }
            }
        });
    });
}

// ============================================================
// SEND — DM text + media
// ============================================================
async function sendDm() {
    const text = dmInput.value.trim();
    if (!text && !pendingFile) return;
    if (pendingFile) { sendDmMedia(); return; }

    const key = dmKey(userId, currentDmUser.uid);
    const msg = {
        user: username,
        displayName,
        text,
        color: getColor(displayName),
        avatar: currentProfile?.avatar || '',
        timestamp: Date.now(),
        userId,
        type: 'text'
    };
    dmInput.value = '';
    dmInput.focus();
    stopTyping();
    clearDraft('dm_' + currentDmUser.uid);

    try {
        await dmsRef.child(key).child('messages').push(msg);
        await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
    } catch (e) { console.error(e); }
}

async function sendDmMedia() {
    if (!pendingFile) return;
    if (pendingFile.size > 5000 * 1024) { alert('File too large (max ~5MB).'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
        const key = dmKey(userId, currentDmUser.uid);
        const msg = {
            type: pendingType,
            user: username,
            displayName,
            color: getColor(displayName),
            avatar: currentProfile?.avatar || '',
            timestamp: Date.now(),
            userId,
            fileName: pendingFile.name,
            fileSize: pendingFile.size,
            data: reader.result
        };
        clearPreview();
        try {
            await dmsRef.child(key).child('messages').push(msg);
            await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
        } catch (e) { console.error(e); }
    };
    reader.readAsDataURL(pendingFile);
}

dmSendBtn.addEventListener('click', sendDm);
dmInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDm(); }
});
dmViewProfileBtn.addEventListener('click', () => {
    if (currentDmUser) {
        const u = friendsData[currentDmUser.uid];
        if (u) viewProfile(u.username);
    }
});
dmDeleteBtn.addEventListener('click', async () => {
    if (!currentDmUser) return;
    if (!confirm('Delete this conversation?')) return;
    await dmsRef.child(dmKey(userId, currentDmUser.uid)).remove();
    currentDmUser = null;
    switchView('friends');
    showToast('Deleted', 'Conversation removed.');
});

dmMuteBtn.addEventListener('click', async () => {
    if (!currentDmUser) return;
    const key = 'dm_' + currentDmUser.uid;
    const nowMuted = !isChatMuted(key);
    if (nowMuted) await mutedRef.child(userId).child(key).set(true);
    else await mutedRef.child(userId).child(key).remove();
    updateMuteButtons();
    _lastRailHash = '';
    renderRailDms();
    showToast(nowMuted ? 'Muted' : 'Unmuted', nowMuted ? 'Notifications off.' : 'Notifications on.');
});

dmPinBtn.addEventListener('click', async () => {
    if (!currentDmUser) return;
    const key = 'dm_' + currentDmUser.uid;
    const nowPinned = !isChatPinned(key);
    if (nowPinned) await pinnedRef.child(userId).child(key).set(true);
    else await pinnedRef.child(userId).child(key).remove();
    updatePinButtons();
    _lastRailHash = '';
    renderRailDms();
    showToast(nowPinned ? 'Pinned' : 'Unpinned', nowPinned ? 'Moved to top.' : 'Back to normal.');
});

dmSearchBtn.addEventListener('click', () => {
    dmSearchBar.style.display = dmSearchBar.style.display === 'none' ? 'flex' : 'none';
    if (dmSearchBar.style.display === 'flex') dmSearchInput.focus();
    else { dmSearchInput.value = ''; filterMessages(dmMessages, ''); }
});
dmSearchClose.addEventListener('click', () => {
    dmSearchBar.style.display = 'none';
    dmSearchInput.value = '';
    filterMessages(dmMessages, '');
});
dmSearchInput.addEventListener('input', e => {
    filterMessages(dmMessages, e.target.value.trim().toLowerCase());
});

// Draft autosave on DM input
setupDraftAutosave(dmInput, () => currentDmUser ? 'dm_' + currentDmUser.uid : null);

// ============================================================
// GROUPS — open, render, send
// ============================================================
async function openGroup(gid) {
    const g = userGroups[gid];
    if (!g) return;

    currentGroup = { id: gid, ...g };
    currentDmUser = null;
    groupHeaderName.textContent = g.name || 'Group';
    const mc = Object.keys(g.members || {}).length;
    groupHeaderMembers.textContent = `${mc} member${mc > 1 ? 's' : ''}`;
    updateMuteButtons();

    switchView('group');
    groupSearchBar.style.display = 'none';

    await unreadRef.child(userId).child('group_' + gid).remove();

    if (window._groupCurrentListener) {
        try { window._groupCurrentListener.ref.off('child_added', window._groupCurrentListener.cb); } catch (e) {}
    }

    groupMessages.innerHTML = '';
    groupLastMsgs = [];
    const ref = groupsRef.child(gid).child('messages');
    const cb = snap => {
        const msg = snap.val();
        if (!msg) return;
        msg._id = snap.key;
        groupLastMsgs.push(msg);
        renderGroupMessage(msg);
        if (msg.userId !== userId) {
            if (!isChatMuted('group_' + gid)) playNotifSound();
        }
    };
    ref.limitToLast(60).on('child_added', cb);
    window._groupCurrentListener = { ref, cb };

    await loadDraft('group_' + gid, groupInput);

    groupInput.focus();
    _lastRailHash = '';
    renderRailDms();
}

function renderGroupMessage(msg) {
    const isOwn = msg.userId === userId;
    const div = document.createElement('div');
    div.className = 'message' + (isOwn ? ' own' : '');
    const time = formatTime(msg.timestamp);

    if (dateSeparatorsEnabled) {
        const last = groupMessages.lastElementChild;
        const lastTs = last?.dataset?.ts;
        if (!lastTs || dayKey(parseInt(lastTs)) !== dayKey(msg.timestamp)) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateLabel(msg.timestamp);
            groupMessages.appendChild(sep);
        }
    }

    const senderData = isOwn ? (currentProfile || {}) : (friendsData[msg.userId] || msg);
    const nameColor = senderData?.nameColor || getColor(msg.displayName || msg.user);
    const senderAvatar = senderData?.avatar || msg.avatar || '';

    let avatarStyle, avatarContent;
    if (senderAvatar) {
        avatarStyle = `background-image: url('${senderAvatar}'); background-size: cover; background-position: center;`;
        avatarContent = '';
    } else {
        avatarStyle = `background: linear-gradient(135deg, ${nameColor}, ${nameColor}cc);`;
        avatarContent = getInitial(msg.displayName || msg.user);
    }

    let contentHtml = '';
    if (msg.type === 'image') {
        contentHtml = `<div class="msg-media" onclick="openLightbox('${msg.data}')"><img src="${msg.data}" loading="lazy" /></div>`;
    } else if (msg.type === 'file') {
        contentHtml = `<a class="msg-file" href="${msg.data}" download="${escapeHtml(msg.fileName || 'file')}">
            <i class="fas fa-file"></i>
            <div class="file-info">
                <span class="file-name">${escapeHtml(msg.fileName || 'File')}</span>
                <span class="file-size">${formatBytes(msg.fileSize || 0)}</span>
            </div>
        </a>`;
    } else if (msg.type === 'voice') {
        contentHtml = `<div class="msg-voice">
            <button class="voice-play" onclick="playVoice(this, '${msg.data}')"><i class="fas fa-play"></i></button>
            <div class="voice-wave">${generateWaveBars()}</div>
            <span class="voice-time">${formatDuration(msg.duration || 0)}</span>
        </div>`;
    } else {
        contentHtml = `<div class="msg-text">${escapeHtml(msg.text || '')}</div>`;
    }

    div.dataset.ts = msg.timestamp;
    div.innerHTML = `
        <div class="msg-avatar" style="${avatarStyle}">${avatarContent}</div>
        <div class="msg-content">
            <div class="msg-header">
                <span class="name">${escapeHtml(msg.displayName || msg.user)}</span>
                <span class="time">${time}</span>
            </div>
            ${contentHtml}
        </div>
        ${buildMessageActions(msg, isOwn)}
    `;
    bindMessageActions(div, msg, 'group');
    groupMessages.appendChild(div);

    const nearBottom = groupMessages.scrollHeight - groupMessages.scrollTop - groupMessages.clientHeight < 120;
    if (nearBottom || msg.userId === userId) {
        groupMessages.scrollTop = groupMessages.scrollHeight;
    }
}

async function sendGroupMessage() {
    const text = groupInput.value.trim();
    if (!text || !currentGroup) return;

    const msg = {
        user: username,
        displayName,
        text,
        color: getColor(displayName),
        avatar: currentProfile?.avatar || '',
        timestamp: Date.now(),
        userId,
        type: 'text'
    };
    groupInput.value = '';
    groupInput.focus();
    clearDraft('group_' + currentGroup.id);

    try {
        await groupsRef.child(currentGroup.id).child('messages').push(msg);
        const g = userGroups[currentGroup.id];
        if (g?.members) {
            for (const m of Object.keys(g.members)) {
                if (m !== userId) {
                    await unreadRef.child(m).child('group_' + currentGroup.id).transaction(c => (c || 0) + 1);
                }
            }
        }
    } catch (e) { console.error(e); }
}

groupSendBtn.addEventListener('click', sendGroupMessage);
groupInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendGroupMessage(); }
});

// Group — create
newGroupBtn.addEventListener('click', () => {
    if (friends.length < 1) { alert('Add some friends first.'); return; }
    groupNameInput.value = '';
    groupPicker.innerHTML = '';
    friends.forEach(uid => {
        const u = friendsData[uid];
        if (!u) return;
        const dname = u.displayName || u.username;
        const color = getColor(dname);
        const item = document.createElement('div');
        item.className = 'group-picker-item';
        item.dataset.uid = uid;
        item.innerHTML = `
            <div class="group-picker-checkbox"><i class="fas fa-check"></i></div>
            ${u.avatar
                ? `<div class="group-picker-avatar" style="background-image:url('${u.avatar}');"></div>`
                : `<div class="group-picker-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${getInitial(dname)}</div>`}
            <span class="group-picker-name">${escapeHtml(dname)}</span>
        `;
        item.addEventListener('click', () => item.classList.toggle('selected'));
        groupPicker.appendChild(item);
    });
    newGroupModal.classList.add('open');
});

$('#newGroupClose').addEventListener('click', () => newGroupModal.classList.remove('open'));
$('#newGroupCancelBtn').addEventListener('click', () => newGroupModal.classList.remove('open'));
newGroupModal.addEventListener('click', e => {
    if (e.target === newGroupModal) newGroupModal.classList.remove('open');
});

$('#newGroupCreateBtn').addEventListener('click', async () => {
    const name = groupNameInput.value.trim();
    if (!name) { alert('Please enter a group name.'); return; }
    const selected = [...groupPicker.querySelectorAll('.group-picker-item.selected')].map(i => i.dataset.uid);
    if (selected.length === 0) { alert('Pick at least one friend.'); return; }

    const btn = $('#newGroupCreateBtn');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    try {
        const members = { [userId]: true };
        selected.forEach(uid => { members[uid] = true; });
        const gid = groupsRef.push().key;
        await groupsRef.child(gid).set({
            name,
            owner: userId,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            members
        });
        newGroupModal.classList.remove('open');
        showToast('Group created', `${name} is ready.`);
        setTimeout(() => openGroup(gid), 300);
    } catch (e) {
        console.error(e);
        alert('Failed to create group.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create';
    }
});

// Group members modal
groupMembersBtn.addEventListener('click', () => {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g || !g.members) return;

    const memberUids = Object.keys(g.members);
    groupMembersCount.textContent = `${memberUids.length} member${memberUids.length > 1 ? 's' : ''}`;
    groupMembersList.innerHTML = '';

    memberUids.forEach(uid => {
        const u = uid === userId ? currentProfile : friendsData[uid];
        if (!u) return;
        const dname = uid === userId ? displayName : (u.displayName || u.username);
        const color = getColor(dname);
        const el = document.createElement('div');
        el.className = 'group-member';
        el.innerHTML = `
            ${u.avatar
                ? `<div class="group-member-avatar" style="background-image:url('${u.avatar}');"></div>`
                : `<div class="group-member-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${getInitial(dname)}</div>`}
            <div class="group-member-info">
                <div class="group-member-name">${escapeHtml(dname)}</div>
                ${uid === g.owner ? '<div class="group-member-tag">Owner</div>' : uid === userId ? '<div class="group-member-tag">You</div>' : ''}
            </div>
        `;
        groupMembersList.appendChild(el);
    });
    groupMembersModal.classList.add('open');
});

$('#groupMembersClose').addEventListener('click', () => groupMembersModal.classList.remove('open'));
groupMembersModal.addEventListener('click', e => {
    if (e.target === groupMembersModal) groupMembersModal.classList.remove('open');
});

groupLeaveBtn.addEventListener('click', async () => {
    if (!currentGroup) return;
    if (!confirm('Leave this group?')) return;
    await groupsRef.child(currentGroup.id).child('members').child(userId).remove();
    currentGroup = null;
    switchView('friends');
    showToast('Left group', 'You are no longer a member.');
});

// Add members modal
groupAddMembersBtn.addEventListener('click', () => {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g) return;

    const memberUids = Object.keys(g.members || {});
    const candidates = friends.filter(uid => !memberUids.includes(uid));
    if (candidates.length === 0) {
        alert('All your friends are already in this group.');
        return;
    }

    addMembersPicker.innerHTML = '';
    candidates.forEach(uid => {
        const u = friendsData[uid];
        if (!u) return;
        const dname = u.displayName || u.username;
        const color = getColor(dname);
        const item = document.createElement('div');
        item.className = 'group-picker-item';
        item.dataset.uid = uid;
        item.innerHTML = `
            <div class="group-picker-checkbox"><i class="fas fa-check"></i></div>
            ${u.avatar
                ? `<div class="group-picker-avatar" style="background-image:url('${u.avatar}');"></div>`
                : `<div class="group-picker-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${getInitial(dname)}</div>`}
            <span class="group-picker-name">${escapeHtml(dname)}</span>
        `;
        item.addEventListener('click', () => item.classList.toggle('selected'));
        addMembersPicker.appendChild(item);
    });
    addMembersModal.classList.add('open');
});

$('#addMembersClose').addEventListener('click', () => addMembersModal.classList.remove('open'));
$('#addMembersCancelBtn').addEventListener('click', () => addMembersModal.classList.remove('open'));
addMembersModal.addEventListener('click', e => {
    if (e.target === addMembersModal) addMembersModal.classList.remove('open');
});

$('#addMembersConfirmBtn').addEventListener('click', async () => {
    if (!currentGroup) return;
    const selected = [...addMembersPicker.querySelectorAll('.group-picker-item.selected')].map(i => i.dataset.uid);
    if (selected.length === 0) { alert('Pick at least one friend.'); return; }

    const btn = $('#addMembersConfirmBtn');
    btn.disabled = true;
    btn.textContent = 'Adding...';

    try {
        const gid = currentGroup.id;
        const updates = {};
        selected.forEach(uid => { updates['members/' + uid] = true; });
        await groupsRef.child(gid).update(updates);

        for (const uid of selected) {
            await unreadRef.child(uid).child('group_' + gid).transaction(c => (c || 0) + 1);
        }

        addMembersModal.classList.remove('open');
        showToast('Members added', `${selected.length} friend${selected.length > 1 ? 's' : ''} joined.`);
    } catch (e) {
        console.error(e);
        alert('Failed to add members.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Add';
    }
});

// Group search + mute
groupSearchBtn.addEventListener('click', () => {
    groupSearchBar.style.display = groupSearchBar.style.display === 'none' ? 'flex' : 'none';
    if (groupSearchBar.style.display === 'flex') groupSearchInput.focus();
    else { groupSearchInput.value = ''; filterMessages(groupMessages, ''); }
});
groupSearchClose.addEventListener('click', () => {
    groupSearchBar.style.display = 'none';
    groupSearchInput.value = '';
    filterMessages(groupMessages, '');
});
groupSearchInput.addEventListener('input', e => {
    filterMessages(groupMessages, e.target.value.trim().toLowerCase());
});

groupMuteBtn.addEventListener('click', async () => {
    if (!currentGroup) return;
    const key = 'group_' + currentGroup.id;
    const nowMuted = !isChatMuted(key);
    if (nowMuted) await mutedRef.child(userId).child(key).set(true);
    else await mutedRef.child(userId).child(key).remove();
    updateMuteButtons();
    _lastRailHash = '';
    renderRailDms();
    showToast(nowMuted ? 'Muted' : 'Unmuted', nowMuted ? 'Notifications off.' : 'Notifications on.');
});

// Group draft autosave
setupDraftAutosave(groupInput, () => currentGroup ? 'group_' + currentGroup.id : null);

// ============================================================
// CHAT SEARCH FILTER
// ============================================================
function filterMessages(container, query) {
    const messages = container.querySelectorAll('.message');
    messages.forEach(m => {
        const textEl = m.querySelector('.msg-text');
        const text = (textEl?.textContent || '').toLowerCase();
        if (!query) {
            m.style.display = '';
            m.classList.remove('search-hit');
        } else if (text.includes(query)) {
            m.style.display = '';
            m.classList.add('search-hit');
        } else {
            m.style.display = 'none';
            m.classList.remove('search-hit');
        }
    });
}

// ============================================================
// DM MEDIA — attach menu, file picker
// ============================================================
dmAttachBtn.addEventListener('click', e => {
    e.stopPropagation();
    dmAttachMenu.classList.toggle('open');
});
document.addEventListener('click', () => dmAttachMenu.classList.remove('open'));
dmAttachMenu.addEventListener('click', e => e.stopPropagation());

$$('#dmAttachMenu .attach-item').forEach(item => {
    item.addEventListener('click', () => {
        const t = item.dataset.type;
        dmAttachMenu.classList.remove('open');
        if (t === 'image') dmImageInput.click();
        else if (t === 'file') dmFileInput.click();
    });
});

dmImageInput.addEventListener('change', e => { if (e.target.files[0]) handleFileSelected(e.target.files[0], 'image'); });
dmFileInput.addEventListener('change', e => { if (e.target.files[0]) handleFileSelected(e.target.files[0], 'file'); });

function handleFileSelected(file, type) {
    if (file.size > 5000 * 1024) { alert(`File too large (${formatBytes(file.size)}). Max ~5MB.`); return; }
    pendingFile = file;
    pendingType = type;
    const reader = new FileReader();
    reader.onload = e => {
        const previewHtml = type === 'image'
            ? `<img src="${e.target.result}" />`
            : `<div class="preview-file"><i class="fas fa-file"></i></div>`;
        previewContent.innerHTML = `
            ${previewHtml}
            <div class="preview-info">
                <span class="preview-name">${escapeHtml(file.name)}</span>
                <span class="preview-size">${formatBytes(file.size)}</span>
            </div>
        `;
        uploadPreview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

previewRemove.addEventListener('click', clearPreview);
function clearPreview() {
    pendingFile = null;
    pendingType = null;
    uploadPreview.style.display = 'none';
    previewContent.innerHTML = '';
    dmImageInput.value = '';
    dmFileInput.value = '';
}

// ============================================================
// GROUP MEDIA
// ============================================================
groupAttachBtn.addEventListener('click', e => {
    e.stopPropagation();
    groupAttachMenu.classList.toggle('open');
});
document.addEventListener('click', () => groupAttachMenu.classList.remove('open'));
groupAttachMenu.addEventListener('click', e => e.stopPropagation());

$$('#groupAttachMenu .attach-item').forEach(item => {
    item.addEventListener('click', () => {
        const t = item.dataset.type;
        groupAttachMenu.classList.remove('open');
        if (t === 'image') groupImageInput.click();
        else if (t === 'file') groupFileInput.click();
    });
});

groupImageInput.addEventListener('change', e => { if (e.target.files[0]) handleGroupFile(e.target.files[0], 'image'); });
groupFileInput.addEventListener('change', e => { if (e.target.files[0]) handleGroupFile(e.target.files[0], 'file'); });

function handleGroupFile(file, type) {
    if (file.size > 5000 * 1024) { alert(`File too large (${formatBytes(file.size)}). Max ~5MB.`); return; }
    groupPendingFile = file;
    groupPendingType = type;
    const reader = new FileReader();
    reader.onload = e => {
        const previewHtml = type === 'image'
            ? `<img src="${e.target.result}" />`
            : `<div class="preview-file"><i class="fas fa-file"></i></div>`;
        groupPreviewContent.innerHTML = `
            ${previewHtml}
            <div class="preview-info">
                <span class="preview-name">${escapeHtml(file.name)}</span>
                <span class="preview-size">${formatBytes(file.size)}</span>
            </div>
        `;
        groupUploadPreview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

groupPreviewRemove.addEventListener('click', () => {
    groupPendingFile = null;
    groupPendingType = null;
    groupUploadPreview.style.display = 'none';
    groupPreviewContent.innerHTML = '';
    groupImageInput.value = '';
    groupFileInput.value = '';
});

// Send group media on send click if a file is pending
groupSendBtn.addEventListener('click', async () => {
    if (groupPendingFile) await sendGroupMedia();
    else await sendGroupMessage();
});
groupInput.addEventListener('keydown', async e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (groupPendingFile) await sendGroupMedia();
        else await sendGroupMessage();
    }
});

async function sendGroupMedia() {
    if (!groupPendingFile || !currentGroup) return;
    if (groupPendingFile.size > 5000 * 1024) { alert('File too large (max ~5MB).'); return; }

    const reader = new FileReader();
    reader.onload = async () => {
        const msg = {
            type: groupPendingType,
            user: username,
            displayName,
            color: getColor(displayName),
            avatar: currentProfile?.avatar || '',
            timestamp: Date.now(),
            userId,
            fileName: groupPendingFile.name,
            fileSize: groupPendingFile.size,
            data: reader.result
        };
        const gid = currentGroup.id;
        groupPendingFile = null;
        groupPendingType = null;
        groupUploadPreview.style.display = 'none';
        groupPreviewContent.innerHTML = '';
        groupImageInput.value = '';
        groupFileInput.value = '';

        try {
            await groupsRef.child(gid).child('messages').push(msg);
            const g = userGroups[gid];
            if (g?.members) {
                for (const m of Object.keys(g.members)) {
                    if (m !== userId) {
                        await unreadRef.child(m).child('group_' + gid).transaction(c => (c || 0) + 1);
                    }
                }
            }
        } catch (e) { console.error(e); }
    };
    reader.readAsDataURL(groupPendingFile);
}

// ============================================================
// VOICE RECORDING (kept)
// ============================================================
dmMicBtn.addEventListener('click', async () => {
    if (isRecording) { stopRecording(true); return; }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startRecording(stream, 'dm');
    } catch (e) { alert('Microphone access denied.'); }
});

groupMicBtn.addEventListener('click', async () => {
    if (isRecording) { stopRecording(true); return; }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startRecording(stream, 'group');
    } catch (e) { alert('Microphone access denied.'); }
});

function startRecording(stream, target) {
    isRecording = true;
    recordingTarget = target;
    audioChunks = [];
    recordingSeconds = 0;
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };

    mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (audioChunks.length === 0) return;

        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        if (blob.size > 5000 * 1024) { alert('Recording too long.'); return; }

        const reader = new FileReader();
        reader.onload = async () => {
            const msg = {
                type: 'voice',
                user: username,
                displayName,
                color: getColor(displayName),
                avatar: currentProfile?.avatar || '',
                timestamp: Date.now(),
                userId,
                duration: recordingSeconds,
                data: reader.result
            };

            try {
                if (recordingTarget === 'dm' && currentDmUser) {
                    const key = dmKey(userId, currentDmUser.uid);
                    await dmsRef.child(key).child('messages').push(msg);
                    await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
                } else if (recordingTarget === 'group' && currentGroup) {
                    const gid = currentGroup.id;
                    await groupsRef.child(gid).child('messages').push(msg);
                    const g = userGroups[gid];
                    if (g?.members) {
                        for (const m of Object.keys(g.members)) {
                            if (m !== userId) {
                                await unreadRef.child(m).child('group_' + gid).transaction(c => (c || 0) + 1);
                            }
                        }
                    }
                }
            } catch (e) { console.error(e); }
        };
        reader.readAsDataURL(blob);
    };

    mediaRecorder.start();

    if (target === 'dm') {
        dmMicBtn.classList.add('recording');
        recordingIndicator.style.display = 'flex';
        dmInput.style.display = 'none';
        dmSendBtn.style.display = 'none';
        dmAttachBtn.style.display = 'none';
    } else {
        groupMicBtn.classList.add('recording');
        groupRecordingIndicator.style.display = 'flex';
        groupInput.style.display = 'none';
        groupSendBtn.style.display = 'none';
        groupAttachBtn.style.display = 'none';
    }

    recordingTimer = setInterval(() => {
        recordingSeconds++;
        if (target === 'dm') recTime.textContent = formatDuration(recordingSeconds);
        else groupRecTime.textContent = formatDuration(recordingSeconds);
        if (recordingSeconds >= 60) stopRecording(true);
    }, 1000);
}

function stopRecording(send) {
    if (!mediaRecorder) return;
    isRecording = false;
    clearInterval(recordingTimer);

    if (recordingTarget === 'dm') {
        dmMicBtn.classList.remove('recording');
        recordingIndicator.style.display = 'none';
        dmInput.style.display = '';
        dmSendBtn.style.display = '';
        dmAttachBtn.style.display = '';
    } else {
        groupMicBtn.classList.remove('recording');
        groupRecordingIndicator.style.display = 'none';
        groupInput.style.display = '';
        groupSendBtn.style.display = '';
        groupAttachBtn.style.display = '';
    }

    if (send) mediaRecorder.stop();
    else { audioChunks = []; mediaRecorder.stop(); }
}

recCancel.addEventListener('click', () => stopRecording(false));
recSend.addEventListener('click', () => stopRecording(true));
groupRecCancel.addEventListener('click', () => stopRecording(false));
groupRecSend.addEventListener('click', () => stopRecording(true));

// ============================================================
// VOICE PLAYBACK + LIGHTBOX
// ============================================================
window.playVoice = function (btn, dataUrl) {
    document.querySelectorAll('audio').forEach(a => a.pause());
    document.querySelectorAll('.voice-play').forEach(b => b.innerHTML = '<i class="fas fa-play"></i>');

    const audio = new Audio(dataUrl);
    btn.innerHTML = '<i class="fas fa-pause"></i>';
    audio.play();
    audio.onended = () => { btn.innerHTML = '<i class="fas fa-play"></i>'; };
    audio.onpause = () => { btn.innerHTML = '<i class="fas fa-play"></i>'; };
};

function generateWaveBars() {
    let html = '';
    for (let i = 0; i < 16; i++) {
        html += `<div class="voice-bar" style="height:${6 + Math.random() * 12}px;"></div>`;
    }
    return html;
}

window.openLightbox = function (src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
};

$('#lightboxClose').addEventListener('click', () => {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
});
lightbox.addEventListener('click', e => {
    if (e.target === lightbox) {
        lightbox.classList.remove('open');
        lightboxImg.src = '';
    }
});

// ============================================================
// TYPING INDICATORS
// ============================================================
let typingTimeout = null;

function getTypingRef() {
    if (currentDmUser) {
        const key = dmKey(userId, currentDmUser.uid);
        return typingRef.child(key).child(userId);
    }
    return null;
}

function startTyping() {
    if (!typingEnabled) return;
    const ref = getTypingRef();
    if (!ref) return;
    ref.set(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, 2000);
}

function stopTyping() {
    const ref = getTypingRef();
    if (ref) ref.remove();
    clearTimeout(typingTimeout);
}

dmInput.addEventListener('input', startTyping);

// ============================================================
// (Part 4 continues — profile, settings, boot)
// ============================================================// ============================================================
// PROFILE VIEW
// ============================================================
window.viewProfile = async function (usernameToFind) {
    if (!usernameToFind) return;
    const snap = await usersRef.child('usernames').child(usernameToFind.toLowerCase()).once('value');
    if (!snap.exists()) { alert('User not found.'); return; }
    const uid = snap.val();

    const uSnap = await usersRef.child(uid).once('value');
    const data = uSnap.val();
    if (!data) return;

    const dname = data.displayName || data.username;
    const color = getColor(dname);
    const isOwn = uid === userId;
    const isFriend = friends.includes(uid);

    const banner = $('#viewBannerGradient');
    if (data.banner) {
        banner.style.backgroundImage = `url('${data.banner}')`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
    } else {
        banner.style.backgroundImage = '';
        banner.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
    }

    const avatar = $('#viewAvatar');
    if (data.avatar) {
        avatar.style.backgroundImage = `url('${data.avatar}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
    } else {
        avatar.style.backgroundImage = '';
        avatar.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
        avatar.textContent = getInitial(dname);
    }

    const status = getStatusClass(uid);
    const labels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline', invisible: 'Invisible' };
    const statusEl = $('#viewStatus');
    statusEl.className = 'profile-status ' + status;
    statusEl.innerHTML = `<span class="profile-dot"></span> ${labels[status] || 'Offline'}`;

    $('#viewDisplayName').textContent = dname;
    $('#viewUsername').textContent = '@' + data.username;
    $('#viewBio').textContent = data.bio || 'No bio yet.';
    $('#viewJoined').textContent = `Joined ${timeAgo(data.createdAt || Date.now())}`;

    const actionsRow = $('#profileActionsRow');
    actionsRow.innerHTML = '';

    if (!isOwn) {
        if (isFriend) {
            const dmBtn = document.createElement('button');
            dmBtn.className = 'profile-action-btn';
            dmBtn.innerHTML = '<i class="fas fa-comment"></i> Message';
            dmBtn.onclick = () => { closeProfileView(); openDM(uid, dname, data); };
            actionsRow.appendChild(dmBtn);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'profile-action-btn secondary';
            removeBtn.innerHTML = '<i class="fas fa-user-minus"></i> Remove';
            removeBtn.onclick = () => {
                if (confirm('Remove friend?')) { removeFriend(uid); closeProfileView(); }
            };
            actionsRow.appendChild(removeBtn);
        } else {
            const addBtn = document.createElement('button');
            addBtn.className = 'profile-action-btn';
            addBtn.innerHTML = '<i class="fas fa-user-plus"></i> Add Friend';
            addBtn.onclick = () => { sendFriendRequest(uid); closeProfileView(); };
            actionsRow.appendChild(addBtn);
        }
    } else {
        const editBtn = document.createElement('button');
        editBtn.className = 'profile-action-btn';
        editBtn.innerHTML = '<i class="fas fa-pen"></i> Edit Profile';
        editBtn.onclick = () => { closeProfileView(); openEditProfile(); };
        actionsRow.appendChild(editBtn);
    }

    profileViewModal.classList.add('open');
};

$('#profileViewClose').addEventListener('click', closeProfileView);
profileViewModal.addEventListener('click', e => {
    if (e.target === profileViewModal) closeProfileView();
});

function closeProfileView() {
    profileViewModal.classList.remove('open');
}

// ============================================================
// EDIT PROFILE
// ============================================================
myProfileBtn.addEventListener('click', () => {
    accountMenu.classList.remove('open');
    openEditProfile();
});

function openEditProfile() {
    const profile = currentProfile;

    editState.avatar = profile?.avatar || '';
    editState.banner = profile?.banner || '';

    const bg = $('#editBannerGradient');
    if (editState.banner) {
        bg.style.backgroundImage = `url('${editState.banner}')`;
        bg.style.backgroundSize = 'cover';
        bg.style.backgroundPosition = 'center';
    } else {
        bg.style.backgroundImage = '';
        const c = getColor(displayName);
        bg.style.background = `linear-gradient(135deg, ${c}, ${c}cc)`;
    }

    if (editState.avatar) {
        editAvatar.style.backgroundImage = `url('${editState.avatar}')`;
        editAvatar.style.backgroundSize = 'cover';
        editAvatar.style.backgroundPosition = 'center';
        editAvatar.childNodes[0].nodeValue = '';
    } else {
        editAvatar.style.backgroundImage = '';
        const c = getColor(displayName);
        editAvatar.style.background = `linear-gradient(135deg, ${c}, ${c}cc)`;
        editAvatar.childNodes[0].nodeValue = getInitial(displayName);
    }

    editDisplayNameInput.value = displayName;
    editUsernameInput.value = username;
    editBioInput.value = profile?.bio || '';
    bioCount.textContent = editBioInput.value.length;
    updateUsernameHint();

    editProfileModal.classList.add('open');
}

function updateUsernameHint() {
    const last = currentProfile?.usernameChangedAt || 0;
    const elapsed = Date.now() - last;
    const cooldown = 15 * 24 * 60 * 60 * 1000;
    if (elapsed >= cooldown) {
        usernameChangeHint.textContent = 'You can change your username.';
        usernameChangeHint.style.color = 'var(--positive)';
    } else {
        const remaining = cooldown - elapsed;
        const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
        usernameChangeHint.textContent = `Available in ${days} day${days > 1 ? 's' : ''}.`;
        usernameChangeHint.style.color = 'var(--warning)';
    }
}

editBioInput.addEventListener('input', () => {
    bioCount.textContent = editBioInput.value.length;
});

$('#editSaveBtn').addEventListener('click', async () => {
    const nd = editDisplayNameInput.value.trim();
    const nu = editUsernameInput.value.trim().toLowerCase();
    const nb = editBioInput.value.trim();

    if (!nd) return alert('Display name cannot be empty.');
    if (nd.length > 20) return alert('Display name too long.');
    if (!nu || nu.length < 3 || nu.length > 14) return alert('Username must be 3-14 characters.');
    if (!/^[a-z0-9_]+$/.test(nu)) return alert('Username: lowercase letters, numbers, underscores only.');

    let usernameChanged = false;
    if (nu !== username) {
        const last = currentProfile?.usernameChangedAt || 0;
        const elapsed = Date.now() - last;
        const cooldown = 15 * 24 * 60 * 60 * 1000;
        if (last > 0 && elapsed < cooldown) {
            const days = Math.ceil((cooldown - elapsed) / (24 * 60 * 60 * 1000));
            return alert(`You can change your username every 15 days. ${days} day${days > 1 ? 's' : ''} left.`);
        }
        usernameChanged = true;
    }

    const saveBtn = $('#editSaveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const updates = { displayName: nd, bio: nb };

        if (usernameChanged) {
            const snap = await usersRef.child('usernames').child(nu).once('value');
            if (snap.exists()) {
                alert('That username is already taken.');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save';
                return;
            }
            await usersRef.child('usernames').child(nu).set(userId);
            await usersRef.child('usernames').child(username).remove();
            updates.username = nu;
            updates.usernameChangedAt = Date.now();
            username = nu;
        }

        await usersRef.child(userId).update(updates);
        displayName = nd;
        currentProfile.displayName = nd;
        currentProfile.bio = nb;
        if (usernameChanged) currentProfile.usernameChangedAt = Date.now();

        updateUserBadge();
        updateSettingsUser();
        closeEditProfile();
        showToast('Saved', 'Profile updated.');
    } catch (e) {
        console.error(e);
        alert('Failed to save.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
    }
});

$('#editCancelBtn').addEventListener('click', closeEditProfile);
$('#editProfileClose').addEventListener('click', closeEditProfile);

function closeEditProfile() {
    editProfileModal.classList.remove('open');
}

editAvatar.addEventListener('click', () => avatarInput.click());
editBanner.addEventListener('click', () => bannerInput.click());

avatarInput.addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2000 * 1024) { alert('Avatar too large (max 2MB).'); return; }
    const reader = new FileReader();
    reader.onload = async ev => {
        const url = ev.target.result;
        editState.avatar = url;
        editAvatar.style.backgroundImage = `url('${url}')`;
        editAvatar.style.backgroundSize = 'cover';
        editAvatar.style.backgroundPosition = 'center';
        editAvatar.childNodes[0].nodeValue = '';
        await usersRef.child(userId).update({ avatar: url });
        currentProfile.avatar = url;
        updateUserBadge();
        updateSettingsUser();
    };
    reader.readAsDataURL(f);
});

bannerInput.addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 3000 * 1024) { alert('Banner too large (max 3MB).'); return; }
    const reader = new FileReader();
    reader.onload = async ev => {
        const url = ev.target.result;
        editState.banner = url;
        const bg = $('#editBannerGradient');
        bg.style.backgroundImage = `url('${url}')`;
        bg.style.backgroundSize = 'cover';
        bg.style.backgroundPosition = 'center';
        await usersRef.child(userId).update({ banner: url });
        currentProfile.banner = url;
    };
    reader.readAsDataURL(f);
});

// ============================================================
// SETTINGS
// ============================================================
function openSettings(section) {
    settingsModal.classList.add('open');
    switchSettingsSection(section);
    updateSettingsUser();
}

function switchSettingsSection(section) {
    $$('.settings-nav-item').forEach(x => x.classList.toggle('active', x.dataset.section === section));
    $$('.settings-section').forEach(c => c.classList.toggle('active', c.dataset.section === section));
}

$$('.settings-nav-item').forEach(item => {
    item.addEventListener('click', () => switchSettingsSection(item.dataset.section));
});

$('#settingsClose').addEventListener('click', () => settingsModal.classList.remove('open'));
settingsModal.addEventListener('click', e => {
    if (e.target === settingsModal) settingsModal.classList.remove('open');
});

$('#settingsLogout').addEventListener('click', async () => {
    if (!confirm('Log out?')) return;
    settingsModal.classList.remove('open');
    await auth.signOut();
});

// Settings action buttons
$$('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
        const a = btn.dataset.action;
        if (a === 'edit-displayname' || a === 'edit-username' || a === 'edit-bio') {
            settingsModal.classList.remove('open');
            openEditProfile();
        } else if (a === 'delete-account') {
            if (!confirm('Delete your account permanently?')) return;
            if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
            try {
                await usersRef.child('usernames').child(username).remove();
                await usersRef.child(userId).remove();
                await presenceRef.child(userId).remove();
                await currentUser.delete();
                alert('Account deleted.');
            } catch (e) {
                alert('Failed to delete account.');
            }
        } else if (a === 'change-password') {
            if (!confirm(`Send a password reset link to ${currentUser.email}?`)) return;
            try {
                await auth.sendPasswordResetEmail(currentUser.email);
                alert('Reset link sent.');
            } catch (e) {
                alert('Failed to send.');
            }
        } else if (a === 'logout-all') {
            if (!confirm('Log out from all devices?')) return;
            await auth.signOut();
        }
    });
});

// Settings toggles
$('#notifToggle').addEventListener('change', e => {
    notifSoundEnabled = e.target.checked;
    localStorage.setItem('chat_notifications', e.target.checked);
});
$('#typingToggle').addEventListener('change', e => {
    typingEnabled = e.target.checked;
    localStorage.setItem('chat_typing', e.target.checked);
});
$('#compactToggle').addEventListener('change', e => {
    document.body.classList.toggle('compact', e.target.checked);
    localStorage.setItem('chat_compact', e.target.checked);
});
$('#dateSepToggle').addEventListener('change', e => {
    dateSeparatorsEnabled = e.target.checked;
    localStorage.setItem('chat_datesep', e.target.checked);
});

// Logout from account menu
logoutBtn.addEventListener('click', async () => {
    if (!confirm('Log out?')) return;
    accountMenu.classList.remove('open');
    await auth.signOut();
});

// ============================================================
// SIDEBAR SEARCH — filter the conversation list
// ============================================================
$('#sidebarSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('.dm-item').forEach(el => {
        const name = el.querySelector('.dm-item-name')?.textContent.toLowerCase() || '';
        el.style.display = (!q || name.includes(q)) ? '' : 'none';
    });
});

// ============================================================
// RESTORE PREFERENCES
// ============================================================
(function restorePrefs() {
    if (localStorage.getItem('chat_notifications') === 'false') {
        notifSoundEnabled = false;
        const t = $('#notifToggle'); if (t) t.checked = false;
    }
    if (localStorage.getItem('chat_typing') === 'false') {
        typingEnabled = false;
        const t = $('#typingToggle'); if (t) t.checked = false;
    }
    if (localStorage.getItem('chat_compact') === 'true') {
        document.body.classList.add('compact');
        const t = $('#compactToggle'); if (t) t.checked = true;
    }
    if (localStorage.getItem('chat_datesep') === 'false') {
        dateSeparatorsEnabled = false;
        const t = $('#dateSepToggle'); if (t) t.checked = false;
    }
})();

// ============================================================
// MOBILE SIDEBAR TOGGLE
// ============================================================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        accountMenu.classList.remove('open');
        statusDropdown.classList.remove('open');
        contextMenu.classList.remove('open');
        dmAttachMenu.classList.remove('open');
        groupAttachMenu.classList.remove('open');
        settingsModal.classList.remove('open');
        profileViewModal.classList.remove('open');
        editProfileModal.classList.remove('open');
        newGroupModal.classList.remove('open');
        groupMembersModal.classList.remove('open');
        addMembersModal.classList.remove('open');
        lightbox.classList.remove('open');
    }
});

// ============================================================
// LOG
// ============================================================
console.log('[Ink] Ready');