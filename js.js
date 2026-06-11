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
    let searchBox = document.getElementById('search-in-cart'); // الخانة الجديدة
    let showFormBtn = document.getElementById('show-form-btn'); 
    
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px;">🛒 سلتك فارغة حالياً!</div>`;
        if (showFormBtn) showFormBtn.style.display = 'none';
        if (searchBox) searchBox.style.display = 'none'; // إخفاء البحث
        document.getElementById('cart-count').innerText = "0";
        return;
    }

    // إظهار خانة البحث إذا كانت السلة غير فارغة
    if (searchBox) searchBox.style.display = 'block';
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

function sendOrder() {
    // 1. فحص السلة
    if (cart.length === 0) {
        document.getElementById('alert-modal').showModal();
        return;
    }

    // 2. فحص البروفايل
    let profile = JSON.parse(localStorage.getItem('customerProfile'));
    if (!profile || !profile.shop || !profile.phone || !profile.address) {
        document.getElementById('profile-modal').showModal();
        return;
    }

    // 3. منع الضغط المتكرر
    let sendBtn = document.getElementById('send-btn');
    if (sendBtn.disabled) return; 

    sendBtn.innerText = "جاري الإرسال...";
    sendBtn.disabled = true; 

    let cartDetails = cart.map((i, index) => `${index + 1}. ${i.name} (الكمية: ${i.quantity})`).join('\n');

    // 4. الإرسال
    emailjs.send('service_n44lkxg', 'template_s3kgnc8', {
        shop_name: profile.shop,
        phone_number: profile.phone,
        address: profile.address,
        cart_details: cartDetails
    }).then(() => {
        // نستخدم setTimeout عشان نضمن إن التنفيذ ميبقاش "لحظي" ويسبب تداخل
        setTimeout(() => {
            document.getElementById('success-modal').showModal();
            cart = [];
            saveCart();
            updateCartUI();
            document.getElementById('cart-modal').close();
        }, 300);
    }).catch(err => {
        console.error(err);
        alert("حدث خطأ، حاول مرة أخرى.");
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

// // تفعيل الخدمة الخلفية (Service Worker)
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/service-worker.js');
// }


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


// function toggleTheme() {
//     const darkThemeLink = document.getElementById('dark-theme-link');
//     const iconPath = document.getElementById('icon-path');
//     const isDark = darkThemeLink.disabled === false;

//     if (isDark) {
//         darkThemeLink.disabled = true;
//         // تغيير الأيقونة لهلال
//         iconPath.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
//         localStorage.setItem('theme', 'light');
//     } else {
//         darkThemeLink.disabled = false;
//         // تغيير الأيقونة لشمس
//         iconPath.setAttribute('d', 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M17.66 6.34l1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z');
//         localStorage.setItem('theme', 'dark');
//     }
// }

window.addEventListener("load", function() {
    const loader = document.getElementById("loader");
    
    // استخدام setTimeout لإضافة تأخير (مثلاً 2000 تعني ثانيتين)
    setTimeout(function() {
        loader.classList.add("loader-hidden");
        
        loader.addEventListener("transitionend", function() {
            loader.remove();
        });
    }, 2000); // يمكنك تغيير الرقم 2000 إلى أي وقت تريده (بالملي ثانية)
});



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

// ضع مفاتيحك هنا
const SUPABASE_URL = 'sb_publishable_pqSLOPEiIZxB3z1bCv3BZQ_4Dcho2OQ ';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E';

// إنشاء الاتصال
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// تجربة بسيطة للتأكد من الربط
async function testConnection() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('خطأ في الاتصال:', error.message);
  } else {
    console.log('تم الاتصال بنجاح بقاعدة البيانات!');
  }
}

testConnection();



