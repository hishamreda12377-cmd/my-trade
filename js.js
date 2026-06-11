let cart = []; 
let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || []; 

// 1. استخدام حدث التحميل بشكل صحيح ومرة واحدة فقط
window.addEventListener('load', () => {
    let savedCart = localStorage.getItem('myCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI(); 
});

// 2. دالة تحديث السلة المحمية من الأخطاء
function updateCartUI() {
    let container = document.getElementById('cart-items');
    let cartCount = document.getElementById('cart-count'); 
    
    if (!container) return; // إذا لم توجد الحاوية، لا تفعل شيئاً
    
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px;">🛒 سلتك فارغة حالياً!</div>`;
        if (cartCount) cartCount.innerText = "0"; // تحديث آمن للعداد
        return;
    }

    cart.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <span class="item-name">${item.name}</span>
                <input type="number" value="${item.quantity}" min="1" onchange="updateQty(${index}, this.value)">
                <button onclick="removeItem(${index})">حذف</button>
            </div>
        `;
    });

    // تحديث العداد فقط إذا كان العنصر موجوداً في HTML
    if (cartCount) {
        cartCount.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// ... اترك باقي الدوال (saveCart, addToCart, إلخ) كما هي في الأسفل ...

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
    let cartModal = document.getElementById('cart-modal');
    cartModal.showModal(); // أو أياً كانت طريقة فتح المودال عندك

    // هذا السطر يمنع التحديد التلقائي بمجرد فتح المودال
    document.getElementById('search-in-cart').blur();
}

// --- وظائف إتمام الطلب (Form & EmailJS) ---

// إظهار نموذج بيانات العميل
function showForm() {
    document.getElementById('order-details-form').style.display = 'block';
    document.getElementById('confirm-order-btn').style.display = 'block';
    document.getElementById('show-form-btn').style.display = 'none';
}

// إرسال الطلب (بدون Supabase)
async function sendOrder() {
    let profile = JSON.parse(localStorage.getItem('customerProfile'));
    if (!profile) { document.getElementById('profile-modal').showModal(); return; }
    
    let cartDetails = cart.map((i, index) => `${index + 1}. ${i.name} (${i.quantity})`).join('\n');
    
    emailjs.send('service_n44lkxg', 'template_s3kgnc8', {
        shop_name: profile.shop,
        phone_number: profile.phone,
        address: profile.address,
        cart_details: cartDetails
    }).then(() => {
        document.getElementById('success-modal').showModal();
        cart = [];
        saveCart();
        updateCartUI();
        document.getElementById('cart-modal').close();
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


function openFilterModal() {
    document.getElementById('filter-modal').showModal();
}

function filterByCategory(category) {
    let sections = document.querySelectorAll('.section-box');
    
    sections.forEach(section => {
        if (category === 'all' || section.getAttribute('data-category') === category) {
            section.style.display = "block"; // إظهار القسم
        } else {
            section.style.display = "none"; // إخفاء القسم
        }
    });
    
    document.getElementById('filter-modal').close(); // إغلاق النافذة بعد الاختيار
}






// تاثير ظهور الكروت عند التمرير (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});
// تفعيل المراقبة على كل كارت منتج
document.querySelectorAll('.a1').forEach(card => {
    observer.observe(card);
});


document.querySelectorAll('dialog').forEach(modal => {
    modal.addEventListener('click', (e) => {
        const dialogDimensions = modal.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            modal.close();
        }
    });
});
