/* ================= THIẾT LẬP CƠ BẢN ================= */
const PASSWORD = "1234"; // Đổi mật khẩu ở đây

// Lấy ngày đã lưu trong LocalStorage, nếu chưa có thì lấy ngày hôm nay
let START_DATE = new Date();
const savedDate = localStorage.getItem('love_start_date');
if (savedDate) {
    START_DATE = new Date(savedDate);
}

const quotes = [
    "You are my today and all of my tomorrows.",
    "Every love story is beautiful, but ours is my favorite.",
    "I look at you and see the rest of my life in front of my eyes.",
    "Cảm ơn vì đã đến và làm thanh xuân của anh thêm rực rỡ."
];

/* ================= XỬ LÝ KHÓA (AUTH) ================= */
function checkPassword() {
    const input = document.getElementById('pwd-input').value;
    if (input === PASSWORD) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';
        initApp();
    } else {
        document.getElementById('auth-error').style.display = 'block';
    }
}

/* ================= KHỞI CHẠY APP ================= */
function initApp() {
    // Hiển thị ngày đã chọn lên ô input
    if (savedDate) {
        document.getElementById('start-date-input').value = savedDate;
    }

    updateCounter();
    setInterval(updateCounter, 1000); // Cập nhật mỗi giây

    changeQuote();
    setInterval(changeQuote, 5000);

    createFloatingHearts();
    loadEvents();
    loadImages();
    checkAnniversaries();
}

/* ================= LOGIC BỘ ĐẾM (COUNTER) ================= */
// Hàm lưu ngày người dùng chọn
function setStartDate() {
    const inputDate = document.getElementById('start-date-input').value;
    if (inputDate) {
        START_DATE = new Date(inputDate);
        localStorage.setItem('love_start_date', inputDate);
        updateCounter(); // Cập nhật bộ đếm ngay lập tức
    }
}

function updateCounter() {
    const now = new Date();
    const diff = now - START_DATE;

    // Nếu chọn ngày ở tương lai thì set về 0
    if (diff < 0) {
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

// ... (Các phần code Quotes, Music, Events, Gallery giữ nguyên như cũ)

/* ================= QUOTES & HIỆU ỨNG ================= */
function changeQuote() {
    const quoteBox = document.getElementById('quote-box');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteBox.style.opacity = 0; // Hiệu ứng fade out
    setTimeout(() => {
        quoteBox.innerText = `"${randomQuote}"`;
        quoteBox.style.opacity = 1; // Hiệu ứng fade in
    }, 500);
}

function createFloatingHearts() {
    const container = document.getElementById('hearts-container');
    setInterval(() => {
        const heart = document.createElement('i');
        heart.classList.add('fa-solid', 'fa-heart', 'heart-anim');
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = Math.random() * 3 + 2 + 's'; // Từ 2s đến 5s
        heart.style.fontSize = Math.random() * 20 + 10 + 'px';
        container.appendChild(heart);

        // Xóa sau khi bay xong để tránh lag
        setTimeout(() => { heart.remove(); }, 5000);
    }, 500); // 0.5s tạo 1 tim
}

/* ================= ÂM NHẠC & CHỦ ĐỀ ================= */
let isPlaying = false;
function toggleMusic() {
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('music-btn');
    if (isPlaying) {
        audio.pause();
        btn.innerHTML = '<i class="fa-solid fa-music"></i>';
    } else {
        audio.play();
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
    isPlaying = !isPlaying;
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

/* ================= SỰ KIỆN QUAN TRỌNG (CRUD) ================= */
let events = JSON.parse(localStorage.getItem('love_events')) || [];

function saveEvents() {
    localStorage.setItem('love_events', JSON.stringify(events));
    loadEvents();
}

function addEvent() {
    const name = document.getElementById('event-name').value;
    const date = document.getElementById('event-date').value;
    if (!name || !date) return alert('Vui lòng nhập đủ thông tin!');

    events.push({ id: Date.now(), name, date });
    document.getElementById('event-name').value = '';
    document.getElementById('event-date').value = '';
    saveEvents();
}

function deleteEvent(id) {
    events = events.filter(e => e.id !== id);
    saveEvents();
}

function loadEvents() {
    const list = document.getElementById('events-list');
    list.innerHTML = '';
    events.forEach(e => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <h3>${e.name}</h3>
            <p><i class="fa-regular fa-calendar"></i> ${e.date}</p>
            <button class="del-btn" onclick="deleteEvent(${e.id})"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(card);
    });
}

function checkAnniversaries() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();

    events.forEach(e => {
        const eventDate = new Date(e.date);
        if (eventDate.getMonth() + 1 === currentMonth && eventDate.getDate() === currentDate) {
            alert(`🎉 CHÚC MỪNG! Hôm nay là ${e.name} ❤️`);
        }
    });
}

/* ================= THƯ VIỆN ẢNH (LƯU LOCALSTORAGE) ================= */
// LƯU Ý CHO DEV: LocalStorage giới hạn khoảng 5MB. 
// Nếu tải lên ảnh độ phân giải quá cao sẽ nhanh chóng bị đầy và báo lỗi QuotaExceededError.
let images = JSON.parse(localStorage.getItem('love_images')) || [];

function saveImages() {
    try {
        localStorage.setItem('love_images', JSON.stringify(images));
        loadImages();
    } catch (e) {
        alert("Bộ nhớ tạm đã đầy! Vui lòng xóa bớt ảnh cũ.");
        images.pop(); // Xóa tấm cuối cùng vừa thêm vào
    }
}

function handleImageUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function (e) {
            images.push(e.target.result); // Lưu dưới dạng base64
            saveImages();
        };
        reader.readAsDataURL(file);
    }
}

function deleteImage(index, event) {
    event.stopPropagation(); // Ngăn chặn nổi bọt click (không mở ảnh to)
    if (confirm("Bạn có chắc muốn xóa ảnh này?")) {
        images.splice(index, 1);
        saveImages();
    }
}

function loadImages() {
    const grid = document.getElementById('photo-grid');
    grid.innerHTML = '';
    images.forEach((src, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';

        const img = document.createElement('img');
        img.src = src;
        img.className = 'photo-item';
        img.onclick = () => openModal(src);

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&times;';
        delBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 16px;';
        delBtn.onclick = (e) => deleteImage(index, e);

        imgContainer.appendChild(img);
        imgContainer.appendChild(delBtn);
        grid.appendChild(imgContainer);
    });
}

/* ================= MODAL XEM ẢNH ================= */
function openModal(src) {
    document.getElementById('image-modal').style.display = 'block';
    document.getElementById('modal-img').src = src;
}
function closeModal() {
    document.getElementById('image-modal').style.display = 'none';
}