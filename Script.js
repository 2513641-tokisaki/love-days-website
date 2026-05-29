import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDtrbvV6c9yXNaluWTY-70JtuSBR-I-fSU",
    authDomain: "love-day-project.firebaseapp.com",
    projectId: "love-day-project",
    storageBucket: "love-day-project.firebasestorage.app",
    messagingSenderId: "631964796060",
    appId: "1:631964796060:web:c69d09c691dabe8d361959",
    measurementId: "G-062PRTT7ZL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserObj = null;
let userData = { startDate: new Date().toISOString().split('T')[0], events: [], images: [], avatar1: "", avatar2: "" };
let counterInterval = null;
let quoteInterval = null;
let heartInterval = null;

const quotes = [
    "You are my today and all of my tomorrows.",
    "Every love story is beautiful, but ours is my favorite.",
    "I look at you and see the rest of my life in front of my eyes.",
    "Cảm ơn vì đã đến và làm thanh xuân thêm rực rỡ."
];

window.switchAuthMode = function (mode) {
    if (mode === 'register') {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    } else {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    }
}

window.registerAccount = async function () {
    const email = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pwd').value;
    const errorPlc = document.getElementById('auth-error');
    if (!email || !pass) return alert("Vui lòng điền đủ email và mật khẩu!");

    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("Đăng ký thành công!");
    } catch (error) {
        errorPlc.style.display = 'block';
        errorPlc.innerText = "Lỗi: " + error.message;
    }
}

window.loginAccount = async function () {
    const email = document.getElementById('pwd-user').value.trim();
    const pass = document.getElementById('pwd-input').value;
    const errorPlc = document.getElementById('auth-error');

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        errorPlc.style.display = 'block';
        errorPlc.innerText = "Sai tài khoản hoặc mật khẩu!";
    }
}

window.logoutAccount = function () {
    signOut(auth).then(() => { location.reload(); });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserObj = user;
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';
        document.getElementById('user-display').innerText = `Hi, ${user.email.split('@')[0]}`;

        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                userData = docSnap.data();
            } else {
                userData = { startDate: new Date().toISOString().split('T')[0], events: [], images: [], avatar1: "", avatar2: "" };
                await setDoc(docRef, userData);
            }
        } catch (error) {
            console.error("Lỗi Database:", error);
            alert("Lưu ý: Chưa kết nối được Database. Bạn hãy vào Firebase -> Firestore Database để tạo Database ở chế độ Test Mode nhé!");
        }
        initApp();
    } else {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('app-content').style.display = 'none';
        if (counterInterval) clearInterval(counterInterval);
        if (quoteInterval) clearInterval(quoteInterval);
        if (heartInterval) clearInterval(heartInterval);
    }
});

window.saveNames = async function () {
    const name1 = document.getElementById('name-1').value;
    const name2 = document.getElementById('name-2').value;
    userData.name1 = name1;
    userData.name2 = name2;
    try {
        await updateDoc(doc(db, "users", currentUserObj.uid), { name1, name2 });
    } catch (e) { console.error(e); }
}

function initApp() {
    document.getElementById('start-date-input').value = userData.startDate || new Date().toISOString().split('T')[0];

    // Khôi phục avatar nếu đã lưu
    if (userData.avatar1) document.getElementById('avatar-1').src = userData.avatar1;
    if (userData.avatar2) document.getElementById('avatar-2').src = userData.avatar2;

    updateCounter();
    if (counterInterval) clearInterval(counterInterval);
    counterInterval = setInterval(updateCounter, 1000);

    changeQuote();
    if (quoteInterval) clearInterval(quoteInterval);
    quoteInterval = setInterval(changeQuote, 5000);

    createFloatingHearts();
    loadEvents();
    loadImages();
}

window.setStartDate = async function () {
    const inputDate = document.getElementById('start-date-input').value;
    if (inputDate && currentUserObj) {
        userData.startDate = inputDate;
        updateCounter();
        try { await updateDoc(doc(db, "users", currentUserObj.uid), { startDate: inputDate }); }
        catch (error) { console.error("Lỗi lưu ngày:", error); }
    }
}

function updateCounter() {
    const now = new Date();
    const startTime = new Date(userData.startDate);
    const diff = now - startTime;

    if (diff < 0 || isNaN(diff)) {
        document.getElementById('days').innerText = '0';
        document.getElementById('hours').innerText = '00';
        document.getElementById('mins').innerText = '00';
        document.getElementById('secs').innerText = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById('mins').innerText = mins < 10 ? '0' + mins : mins;
    document.getElementById('secs').innerText = secs < 10 ? '0' + secs : secs;
}

/* ================= XỬ LÝ ẢNH AVATAR ================= */
window.handleAvatarUpload = async function (index, event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        const base64Img = e.target.result;
        // Hiện ảnh lên web ngay lập tức
        document.getElementById(`avatar-${index}`).src = base64Img;

        // Lưu vào object
        if (index === 1) userData.avatar1 = base64Img;
        else userData.avatar2 = base64Img;

        // Đẩy lên Database
        try {
            await updateDoc(doc(db, "users", currentUserObj.uid), {
                avatar1: userData.avatar1 || "",
                avatar2: userData.avatar2 || ""
            });
        } catch (error) {
            alert("Lỗi khi lưu ảnh đại diện. Nhớ bật Firestore Database lên nha!");
        }
    };
    reader.readAsDataURL(file);
}

/* ================= QUẢN LÝ SỰ KIỆN KỶ NIỆM ================= */
window.addEvent = async function () {
    const name = document.getElementById('event-name').value;
    const date = document.getElementById('event-date').value;
    if (!name || !date) return alert('Vui lòng nhập đủ thông tin!');

    if (!userData.events) userData.events = [];
    userData.events.push({ id: Date.now(), name, date });

    document.getElementById('event-name').value = '';
    document.getElementById('event-date').value = '';
    loadEvents();
    try { await updateDoc(doc(db, "users", currentUserObj.uid), { events: userData.events }); }
    catch (error) { console.error("Lỗi:", error); }
}

window.deleteEvent = async function (id) {
    userData.events = userData.events.filter(e => e.id !== id);
    loadEvents();
    try { await updateDoc(doc(db, "users", currentUserObj.uid), { events: userData.events }); }
    catch (error) { console.error("Lỗi:", error); }
}

function loadEvents() {
    const list = document.getElementById('events-list');
    list.innerHTML = '';
    if (!userData.events) return;
    userData.events.forEach(e => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `<h3>${e.name}</h3><p><i class="fa-regular fa-calendar"></i> ${e.date}</p><button class="del-btn" onclick="deleteEvent(${e.id})"><i class="fa-solid fa-trash"></i></button>`;
        list.appendChild(card);
    });
}

/* ================= LƯU TRỮ ẢNH (DATABASE) ================= */
window.handleImageUpload = async function (event) {
    const files = event.target.files;
    const status = document.getElementById('upload-status');
    if (!userData.images) userData.images = [];

    for (let file of files) {
        status.innerText = `Đang tối ưu ảnh: ${file.name}...`;
        const reader = new FileReader();
        const blobUrl = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        userData.images.push({ url: blobUrl });
    }

    try {
        await updateDoc(doc(db, "users", currentUserObj.uid), { images: userData.images });
        status.innerText = "Tải lên Cloud thành công!";
        loadImages();
    } catch (error) {
        alert("Lỗi khi lưu ảnh lên Cloud. Hãy kiểm tra lại Database!");
    }
    setTimeout(() => status.innerText = "", 3000);
}

window.deleteImage = async function (index, event) {
    event.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa vĩnh viễn ảnh này?")) {
        try {
            userData.images.splice(index, 1);
            await updateDoc(doc(db, "users", currentUserObj.uid), { images: userData.images });
            loadImages();
        } catch (error) { alert("Lỗi khi xóa ảnh: " + error.message); }
    }
}

function loadImages() {
    const grid = document.getElementById('photo-grid');
    grid.innerHTML = '';
    if (!userData.images) return;
    userData.images.forEach((imgObj, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        const img = document.createElement('img');
        img.src = imgObj.url;
        img.className = 'photo-item';
        img.onclick = () => openModal(imgObj.url);
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&times;';
        delBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 16px;';
        delBtn.onclick = (e) => deleteImage(index, e);
        imgContainer.appendChild(img);
        imgContainer.appendChild(delBtn);
        grid.appendChild(imgContainer);
    });
}

function changeQuote() {
    const quoteBox = document.getElementById('quote-box');
    if (!quoteBox) return;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteBox.style.opacity = 0;
    setTimeout(() => {
        quoteBox.innerText = `"${randomQuote}"`;
        quoteBox.style.opacity = 1;
    }, 500);
}

function createFloatingHearts() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    if (heartInterval) clearInterval(heartInterval);
    heartInterval = setInterval(() => {
        const heart = document.createElement('i');
        heart.classList.add('fa-solid', 'fa-heart', 'heart-anim');
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = Math.random() * 3 + 2 + 's';
        heart.style.fontSize = Math.random() * 20 + 10 + 'px';
        container.appendChild(heart);
        setTimeout(() => { heart.remove(); }, 5000);
    }, 600);
}

let isPlaying = false;
window.toggleMusic = function () {
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('music-btn');
    if (isPlaying) { audio.pause(); btn.innerHTML = '<i class="fa-solid fa-music"></i>'; }
    else { audio.play(); btn.innerHTML = '<i class="fa-solid fa-pause"></i>'; }
    isPlaying = !isPlaying;
}

window.toggleTheme = function () { document.body.classList.toggle('dark-mode'); }
window.openModal = function (src) { document.getElementById('image-modal').style.display = 'block'; document.getElementById('modal-img').src = src; }
window.closeModal = function () { document.getElementById('image-modal').style.display = 'none'; }
