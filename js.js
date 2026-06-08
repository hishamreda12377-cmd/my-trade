/**
 * --- ملف الإعدادات والوظائف الأساسية لمتجر الشرقاوي ---
 */

// --- المتغيرات العامة ---
let cart = []; 
let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || []; 

// --- تحميل البيانات عند فتح الصفحة ---
window.onload = function() {
    let savedCart = localStorage.getItem('myCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI(); 
};

// --- وظائف السلة (إضافة، حفظ، حذف، تحديث) ---

// حفظ حالة السلة في ذاكرة المتصفح
function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cart));
}

// إضافة منتج للسلة أو زيادة كميته
function addToCart(name, price) {
    showToast();
    let clickSound = new Audio('click.mp3'); 
    clickSound.play().catch(e => console.log("Audio play failed"));
    
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
}

// تحديث واجهة السلة (Modal) وإجمالي العناصر
function updateCartUI() {
    let container = document.getElementById('cart-items');
    let confirmBtn = document.getElementById('confirm-order-btn'); 
    let showFormBtn = document.getElementById('show-form-btn'); 
    
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px;">🛒 سلتك فارغة حالياً!</div>`;
        if (confirmBtn) confirmBtn.style.display = 'none';
        if (showFormBtn) showFormBtn.style.display = 'none';
        document.getElementById('cart-count').innerText = "0";
        return;
    }

    if (showFormBtn) showFormBtn.style.display = 'block';

    cart.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <span class="item-name">${item.name}</span>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQty(${index}, this.value)">
                <button class="remove-btn" onclick="removeItem(${index})">حذف</button>
            </div>
        `;
    });

    document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// تحديث الكمية داخل السلة
function updateQty(index, newQty) {
    cart[index].quantity = parseInt(newQty);
    saveCart();
    updateCartUI();
}

// حذف منتج من السلة
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

// فتح نافذة السلة
function openCart() {
    document.getElementById('cart-modal').showModal();
}

// --- وظائف إتمام الطلب (Form & EmailJS) ---

// إظهار نموذج بيانات العميل
function showForm() {
    document.getElementById('order-details-form').style.display = 'block';
    document.getElementById('confirm-order-btn').style.display = 'block';
    document.getElementById('show-form-btn').style.display = 'none';
}

// إرسال الطلب عبر EmailJS
function sendOrder() {
    if (cart.length === 0) {
        alert("⚠️ السلة فارغة! أضف منتجات أولاً.");
        return;
    }

    let profile = JSON.parse(localStorage.getItem('customerProfile'));
    
    if (!profile || !profile.shop || !profile.phone || !profile.address) {
        alert("يرجى تسجيل بياناتك أولاً!");
        document.getElementById('profile-modal').showModal();
        return;
    }

    let sendBtn = document.getElementById('send-btn');
    if (sendBtn.disabled) return;

    sendBtn.innerText = "جاري الإرسال...";
    sendBtn.disabled = true; 

    let cartDetails = cart.map((i, index) => `${index + 1}. ${i.name} (الكمية: ${i.quantity})`).join('\n');

    emailjs.send('service_n44lkxg', 'template_s3kgnc8', {
        shop_name: profile.shop,
        phone_number: profile.phone,
        address: profile.address,
        cart_details: cartDetails
    }).then(() => {
        alert("تم إرسال الطلب بنجاح! ✅");
        cart = [];
        saveCart();
        updateCartUI();
        document.getElementById('cart-modal').close();
    }).catch(err => {
        console.error(err);
        alert("حدث خطأ، تأكد من الاتصال بالإنترنت.");
    }).finally(() => {
        sendBtn.innerText = "إرسال الطلب";
        sendBtn.disabled = false;
    });
}

// --- وظائف إدارة بيانات العميل (Profile) ---

// حفظ بيانات العميل في LocalStorage
function saveProfile() {
    let shop = document.getElementById('user-shop').value.trim();
    let phone = document.getElementById('user-phone').value.trim();
    let address = document.getElementById('user-address').value.trim();

    if (!/^01[0-9]{9}$/.test(phone)) {
        alert("⚠️ رقم الهاتف غير صحيح!");
        document.getElementById('user-phone').focus();
        return;
    }

    if (shop === "" || address === "") {
        alert("⚠️ من فضلك، املأ اسم المحل والعنوان!");
        return;
    }

    localStorage.setItem('customerProfile', JSON.stringify({ shop, phone, address }));
    document.getElementById('profile-modal').close();
}

// تحميل بيانات العميل عند فتح الصفحة
window.addEventListener('load', () => {
    let savedProfile = localStorage.getItem('customerProfile');
    if (savedProfile) {
        let profile = JSON.parse(savedProfile);
        if(document.getElementById('user-shop')) {
            document.getElementById('user-shop').value = profile.shop;
            document.getElementById('user-phone').value = profile.phone;
            document.getElementById('user-address').value = profile.address;
        }
    }
});

// --- وظائف العرض والتحكم في الواجهة ---

// تكبير الصور
function zoomImage(imgSrc) {
    if (document.getElementById("side-menu").style.width === "250px") return;
    let modal = document.getElementById('zoom-modal');
    document.getElementById('zoomed-img').src = imgSrc;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
}

function closeZoom() {
    document.getElementById('zoom-modal').style.display = 'none';
    document.body.style.overflow = 'auto'; 
}

// إظهار رسالة التنبيه المؤقتة (Toast)
function showToast() {
    let toast = document.getElementById("toast");
    if(toast) {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }
}

// البحث عن المنتجات
function searchProducts() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.section-box').forEach(section => {
        let items = section.getElementsByClassName('a1');
        let hasMatch = false;
        for (let i = 0; i < items.length; i++) {
            let name = items[i].getElementsByTagName('p')[0].innerText.toLowerCase();
            items[i].style.display = name.includes(input) ? "" : "none";
            if(name.includes(input)) hasMatch = true;
        }
        section.style.display = hasMatch ? "" : "none";
    });
}

// القائمة الجانبية
function toggleMenu() {
    let menu = document.getElementById("side-menu");
    let overlay = document.getElementById("menu-overlay");
    let isOpen = menu.style.width === "250px";
    menu.style.width = isOpen ? "0" : "250px";
    overlay.style.display = isOpen ? "none" : "block";
}

// دوال عامة (النسخ، العودة للأعلى)
function copyNumber(elementId) {
    let text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => alert("تم نسخ الرقم: " + text));
}

window.onscroll = () => {
    let btn = document.getElementById("backToTop");
    if(btn) btn.style.display = (window.scrollY > 300) ? "block" : "none";
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// تفعيل الخدمة الخلفية (Service Worker)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}
