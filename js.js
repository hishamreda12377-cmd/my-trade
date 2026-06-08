// --- تعريف المتغيرات العامة ---
let cart = []; 
let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || []; 

// --- تحميل البيانات عند فتح الصفحة ---
window.onload = function() {
    let savedCart = localStorage.getItem('myCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI(); 
    }
};

// --- وظائف السلة ---
function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cart));
}

function addToCart(name, price) {
    showToast();
    let clickSound = new Audio('click.mp3'); // تأكد أن ملف الصوت موجود
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

    // إظهار الأزرار إذا كانت السلة غير فارغة
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

function updateQty(index, newQty) {
    cart[index].quantity = parseInt(newQty);
    saveCart();
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

// --- دالة فتح السلة ---
function openCart() {
    document.getElementById('cart-modal').showModal();
}

// --- وظائف إتمام الطلب ---

function showForm() {
    document.getElementById('order-details-form').style.display = 'block';
    document.getElementById('confirm-order-btn').style.display = 'block';
    document.getElementById('show-form-btn').style.display = 'none';
}

function sendOrder() {
    // جلب قيم الخانات
    let shopName = document.getElementById('shop-name').value.trim();
    let phoneNum = document.getElementById('phone-number').value.trim();
    let address = document.getElementById('address').value.trim();

    // التحقق من كل خانة بالترتيب
    if (shopName === "") {
        alert("من فضلك، اكتب اسم المحل!");
        document.getElementById('shop-name').focus(); // وضع مؤشر الكتابة في الخانة الفارغة
        return;
    }
    
    if (phoneNum === "") {
        alert("من فضلك، اكتب رقم التواصل!");
        document.getElementById('phone-number').focus();
        return;
    }
    
    if (address === "") {
        alert("من فضلك، اكتب عنوان التسليم!");
        document.getElementById('address').focus();
        return;
    }

    // إذا وصلت الكود هنا، فهذا يعني أن كل شيء مكتوب بشكل صحيح
    let cartDetails = cart.map(i => `• ${i.name} (x${i.quantity})`).join('\n');

    emailjs.send('service_n44lkxg', 'template_s3kgnc8', {
        shop_name: shopName,
        phone_number: phoneNum,
        address: address, // تأكد من إضافة هذا المتغير في قالب EmailJS
        cart_details: cartDetails
    }).then(() => {
        alert("تم إرسال الطلب بنجاح! ✅");
        
        // إعادة تعيين الحالة
        cart = [];
        saveCart();
        updateCartUI();
        
        // إخفاء الخانات
        document.getElementById('order-details-form').style.display = 'none';
        document.getElementById('confirm-order-btn').style.display = 'none';
        document.getElementById('show-form-btn').style.display = 'block';
        document.getElementById('cart-modal').close();
    }).catch(err => {
        alert("حدث خطأ أثناء الإرسال، حاول مرة أخرى.");
        console.error(err);
    });
}



function copyNumber(elementId) {
    let text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => alert("تم نسخ الرقم: " + text));
}

function showToast() {
    let toast = document.getElementById("toast");
    if(toast) {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }
}

window.onscroll = () => {
    let btn = document.getElementById("backToTop");
    if(btn) btn.style.display = (window.scrollY > 300) ? "block" : "none";
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// حفظ البيانات في LocalStorage
// --- وظيفة حفظ البيانات مع التحقق ---
function saveProfile() {
    let shop = document.getElementById('user-shop').value.trim();
    let phone = document.getElementById('user-phone').value.trim();
    let address = document.getElementById('user-address').value.trim();

    // التحقق: يبدأ بـ 01 ويليه 9 أرقام (11 رقم)
    if (!/^01[0-9]{9}$/.test(phone)) {
        alert("⚠️ رقم الهاتف غير صحيح! يجب أن يتكون من 11 رقماً ويبدأ بـ 01");
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

// تحميل البيانات عند فتح الصفحة
window.addEventListener('load', () => {
    let savedProfile = localStorage.getItem('customerProfile');
    if (savedProfile) {
        let profile = JSON.parse(savedProfile);
        document.getElementById('user-shop').value = profile.shop;
        document.getElementById('user-phone').value = profile.phone;
        document.getElementById('user-address').value = profile.address;
    }
});

// تعديل دالة الإرسال لتأخذ البيانات من الذاكرة تلقائياً
function sendOrder() {
    // 1. فحص السلة: إذا كانت فارغة، لا تفعل شيئاً
    if (cart.length === 0) {
        alert("⚠️ السلة فارغة! أضف منتجات أولاً.");
        return;
    }

    let profile = JSON.parse(localStorage.getItem('customerProfile'));
    
    // 2. فحص البيانات الشخصية
    if (!profile || !profile.shop || !profile.phone || !profile.address) {
        alert("يرجى تسجيل بياناتك أولاً!");
        document.getElementById('profile-modal').showModal();
        return;
    }

    // 3. منع الضغط المتكرر (Loading State)
    let sendBtn = document.getElementById('send-btn');
    if (sendBtn.disabled) return; // إذا كان الزر معطلاً بالفعل، لا تفعل شيئاً

    sendBtn.innerText = "جاري الإرسال...";
    sendBtn.disabled = true; 

    let cartDetails = cart.map((i, index) => 
        `${index + 1}. ${i.name} (الكمية: ${i.quantity})`
    ).join('\n');

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
        // إعادة الزر لحالته الأصلية
        sendBtn.innerText = "إرسال الطلب";
        sendBtn.disabled = false;
    });
}
// دالة تكبير الصورة عند الضغط عليها
function zoomImage(imgSrc) {
    let modal = document.getElementById('zoom-modal');
    let zoomedImg = document.getElementById('zoomed-img');
    
    zoomedImg.src = imgSrc; // وضع رابط الصورة
    modal.style.display = 'flex'; // إظهار النافذة
}


// تفعيل الـ Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}



function toggleMenu() {
    let menu = document.getElementById("side-menu");
    let overlay = document.getElementById("menu-overlay");
    
    if (menu.style.width === "250px") {
        menu.style.width = "0";
        overlay.style.display = "none";
    } else {
        menu.style.width = "250px";
        overlay.style.display = "block";
    }
}

// دالة التكبير المحدثة
function zoomImage(imgSrc) {
    let menu = document.getElementById("side-menu");
    
    // شرط ذكي: إذا كانت القائمة مفتوحة، لا تفعل شيئاً (توقف الدالة)
    if (menu.style.width === "250px") {
        return; 
    }

    let modal = document.getElementById('zoom-modal');
    let zoomedImg = document.getElementById('zoomed-img');
    
    zoomedImg.src = imgSrc;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
}
