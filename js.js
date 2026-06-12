// ==========================================================================
// 1. المتغيرات الأساسية
// ==========================================================================
let cart = []; 
let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || []; 


window.addEventListener("load",()=>{

    setTimeout(()=>{

        document.getElementById("loader").style.opacity="0";

        setTimeout(()=>{
            document.getElementById("loader").remove();
        },500);

    },3000);

});


// ==========================================================================
// 2. دوال السلة (إضافة، تحديث، حذف، حفظ)
// ==========================================================================
// ضعه في بداية ملف js.js
const addToCartSound = new Audio('add-to-cart.mp3');

// ثم استخدمه داخل دالة addToCart هكذا:
function addToCart(name, price) {
    // ... الكود ...
    addToCartSound.currentTime = 0; // لإعادة الصوت من البداية لو ضغط العميل بسرعة
    addToCartSound.play();
    // ... الكود ...
}
// حفظ السلة في LocalStorage
function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cart));
}

// دالة إضافة منتج للسلة
function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);
    let audio = new Audio('click.mp3'); 
    audio.play();

    if (existingItem) {
        existingItem.quantity += 1; // زيادة الكمية إذا كان موجوداً
    } else {
        cart.push({ name: name, price: price, quantity: 1 }); // إضافة كعنصر جديد
    }

    saveCart();
    updateCartUI();
    showToast("تمت إضافة " + name + " للسلة! 🛒");
}

// دالة تحديث السلة وإخفاء عداد الأرقام الخارجي تماماً
function updateCartUI() {
    let container = document.getElementById('cart-items');
    let cartCount = document.getElementById('cart-count'); 
    
    if (!container) return; // حماية ضد الأخطاء إذا لم تكن الحاوية موجودة
    
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px;">🛒 سلتك فارغة حالياً!</div>`;
        if (cartCount) {
            cartCount.style.display = "none"; // إخفاء العداد تماماً عندما تكون السلة فارغة
        }
        return;
    }

    cart.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <span class="item-name">${item.name}</span>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQty(${index}, this.value)">
                <button class="remove-btn" onclick="removeItem(${index})">حذف</button>
            </div>
        `;
    });

    // --------------------------------------------------------
    // التعديل هنا: إخفاء العداد تماماً ومنع ظهوره
    // --------------------------------------------------------
    if (cartCount) {
        cartCount.style.display = "none"; // هذا السطر يخفي الدائرة الحمراء أو رقم العداد تماماً من الموقع
    }
}

// تحديث الكمية داخل السلة
function updateQty(index, newQty) {
    if (newQty < 1) newQty = 1; // منع الكمية من أن تكون أقل من 1
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
    if (cartModal) {
        cartModal.showModal();
        let searchInput = document.getElementById('search-in-cart');
        if (searchInput) searchInput.blur(); // منع التحديد التلقائي
    }
}

// ==========================================================================
// 3. دوال إتمام الطلب وبيانات العميل
// ==========================================================================

function showForm() {
    let form = document.getElementById('order-details-form');
    let confirmBtn = document.getElementById('confirm-order-btn');
    let showBtn = document.getElementById('show-form-btn');
    
    if (form) form.style.display = 'block';
    if (confirmBtn) confirmBtn.style.display = 'block';
    if (showBtn) showBtn.style.display = 'none';
}
async function sendOrder(btn) {

    // التحقق من السلة
    if (cart.length === 0) {
        let alertModal = document.getElementById('alert-modal');

        if (alertModal) {
            alertModal.showModal();
        } else {
            alert("⚠️ سلتك فارغة حالياً!");
        }

        return;
    }

    // التحقق من البروفايل
    let profile = JSON.parse(localStorage.getItem('customerProfile'));

    if (!profile) {
        let profileModal = document.getElementById('profile-modal');

        if (profileModal) {
            profileModal.showModal();
        }

        return;
    }

    let confirmBtn = btn || document.getElementById('confirm-order-btn');
    let originalText = "تأكيد الطلب";

    if (confirmBtn) {
        originalText = confirmBtn.innerText;

        confirmBtn.innerText = "...جاري الإرسال";
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.7";
        confirmBtn.style.cursor = "wait";
    }

    try {

        // تفاصيل المنتجات
        let cartDetails = cart.map((item, index) =>
            `${index + 1}. ${item.name} (${item.quantity})`
        ).join('\n');

        // =====================================
        // حفظ الطلب في Supabase
        // =====================================

        const { data, error } = await supabaseClient
            .from('orders')
            .insert([
                {
                    shop_name: profile.shop,
                    phone_number: profile.phone,
                    cart_details: cartDetails,
                    address: profile.address,
                }
            ]);

        if (error) {
            throw error;
        }

        console.log("Supabase Success:", data);

        // =====================================
        // إرسال EmailJS
        // =====================================

        await emailjs.send(
            'service_n44lkxg',
            'template_s3kgnc8',
            {
                shop_name: profile.shop,
                phone_number: profile.phone,
                address: profile.address,
                cart_details: cartDetails
            }
        );

        // =====================================
        // نجاح العملية
        // =====================================

        cart = [];
        saveCart();
        updateCartUI();

        let cartModal = document.getElementById('cart-modal');
        if (cartModal) cartModal.close();

        let successModal = document.getElementById('success-modal');
        if (successModal) successModal.showModal();

    } catch (err) {

        console.error("ORDER ERROR:", err);

        alert(
            "حدث خطأ أثناء إرسال الطلب:\n" +
            (err.message || "خطأ غير معروف")
        );

    } finally {

        if (confirmBtn) {
            confirmBtn.innerText = originalText;
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = "1";
            confirmBtn.style.cursor = "pointer";
        }

    }
}
async function saveProfile() {

    const shop = document.getElementById('user-shop').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const address = document.getElementById('user-address').value.trim();

    // التحقق من رقم الهاتف
    if (!/^01[0-9]{9}$/.test(phone)) {
        alert("⚠️ رقم الهاتف غير صحيح!");
        return;
    }

    // التحقق من البيانات
    if (!shop || !address) {
        alert("⚠️ أكمل جميع البيانات");
        return;
    }

    const profileData = {
        shop,
        phone,
        address
    };

    // حفظ محلي
    localStorage.setItem(
        "customerProfile",
        JSON.stringify(profileData)
    );

    localStorage.setItem("userShop", shop);
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("userAddress", address);

    try {

        // حفظ في Supabase
        const { error } = await supabaseClient
            .from("profiles")
            .insert([
                {
                    shop_name: shop,
                    phone_number: phone,
                    address: address
                }
            ]);

        if (error) {
            console.error(error);
            alert("خطأ أثناء الحفظ في قاعدة البيانات");
            return;
        }

        showToast("تم حفظ البيانات بنجاح ✅");
        document.getElementById("profile-modal").close();

    } catch (err) {

        console.error(err);
        alert("حدث خطأ غير متوقع");

    }
}

// ==========================================================================
// 4. دوال واجهة المستخدم (بحث، قوائم، تكبير صور، تنبيهات)
// ==========================================================================

function showToast(message) {
    let toast = document.getElementById("toast");
    if(toast) {
        toast.innerText = message || "تمت العملية بنجاح";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }
}

function zoomImage(imgSrc) {
    let sideMenu = document.getElementById("side-menu");
    if (sideMenu && sideMenu.style.width === "250px") return;
    
    let modal = document.getElementById('zoom-modal');
    let zoomedImg = document.getElementById('zoomed-img');
    if (modal && zoomedImg) {
        zoomedImg.src = imgSrc;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    }
}

function closeZoom() {
    let modal = document.getElementById('zoom-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; 
    }
}

function toggleMenu() {
    let menu = document.getElementById("side-menu");
    let overlay = document.getElementById("menu-overlay");
    if (!menu || !overlay) return;
    
    let isOpen = menu.style.width === "250px";
    menu.style.width = isOpen ? "0" : "250px";
    overlay.style.display = isOpen ? "none" : "block";
}

function searchProducts() {
    let inputEl = document.getElementById('searchInput');
    if (!inputEl) return;
    
    let input = inputEl.value.toLowerCase();
    
    document.querySelectorAll('.section-box').forEach(section => {
        let items = section.getElementsByClassName('a1');
        let hasMatch = false;
        
        for (let i = 0; i < items.length; i++) {
            let pTags = items[i].getElementsByTagName('p');
            // التأكد من وجود نص داخل الكارت لمنع الأخطاء
            let name = pTags.length > 0 ? pTags[0].innerText.toLowerCase() : "";
            
            if (name.includes(input)) {
                items[i].style.display = "";
                hasMatch = true;
            } else {
                items[i].style.display = "none";
            }
        }
        section.style.display = hasMatch ? "" : "none";
    });
}

function copyNumber(elementId) {
    let el = document.getElementById(elementId);
    if (el) {
        let text = el.innerText;
        navigator.clipboard.writeText(text).then(() => showToast("تم نسخ الرقم: " + text));
    }
}

function openFilterModal() {
    let modal = document.getElementById('filter-modal');
    if (modal) modal.showModal();
}

function filterByCategory(category) {
    let sections = document.querySelectorAll('.section-box');
    sections.forEach(section => {
        if (category === 'all' || section.getAttribute('data-category') === category) {
            section.style.display = "block";
        } else {
            section.style.display = "none";
        }
    });
    let modal = document.getElementById('filter-modal');
    if (modal) modal.close(); 
}

window.onscroll = () => {
    let btn = document.getElementById("backToTop");
    if(btn) btn.style.display = (window.scrollY > 300) ? "block" : "none";
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 5. أحداث التحميل والمراقبة (تحدث مرة واحدة عند فتح الصفحة)
// ==========================================================================

window.addEventListener('load', () => {
    // 1. تحميل بيانات السلة
    let savedCart = localStorage.getItem('myCart');
    if (savedCart) {
        try { cart = JSON.parse(savedCart); } catch(e) { cart = []; }
    }
    updateCartUI(); 

    // 2. تحميل بيانات العميل
    let savedProfile = localStorage.getItem('customerProfile');
    if (savedProfile) {
        try {
            let profile = JSON.parse(savedProfile);
            if(document.getElementById('user-shop')) document.getElementById('user-shop').value = profile.shop || "";
            if(document.getElementById('user-phone')) document.getElementById('user-phone').value = profile.phone || "";
            if(document.getElementById('user-address')) document.getElementById('user-address').value = profile.address || "";
        } catch(e) { console.error("Error loading profile"); }
    }

    // 3. تأثير ظهور الكروت عند التمرير (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });
    document.querySelectorAll('.a1').forEach(card => observer.observe(card));
});

// إغلاق النوافذ المنبثقة (Dialogs) عند الضغط خارجها
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



// ==========================================
// الإضافات الاحترافية (تقييمات + تحميل صور + PWA)
// ==========================================

// window.addEventListener('load', () => {
    
//     // 1. تشغيل التحميل المتأخر للصور (Skeleton)
//     const images = document.querySelectorAll('.a1 img');
//     images.forEach(img => {
//         img.classList.add('skeleton'); // إضافة الوميض
        
//         // أول ما الصورة تخلص تحميل، نشيل الوميض
//         if (img.complete) {
//             img.classList.remove('skeleton');
//         } else {
//             img.addEventListener('load', () => img.classList.remove('skeleton'));
//         }
//     });

    // // 2. إضافة التقييمات الوهمية الذكية تحت اسم كل منتج
    // const cards = document.querySelectorAll('.a1');
    // cards.forEach(card => {
    //     let pTag = card.querySelector('p'); // البحث عن اسم المنتج
    //     if (pTag && !card.querySelector('.stars-container')) {
    //         // توليد رقم عشوائي بين 4.3 و 5.0
    //         let rating = (Math.random() * (5.0 - 4.3) + 4.3).toFixed(1); 
    //         // توليد عدد أشخاص قيموا المنتج (من 30 لـ 250 شخص)
    //         let reviewsCount = Math.floor(Math.random() * 220) + 30; 
            
    //         let starsHTML = `
    //             <div class="stars-container">
    //                 ⭐⭐⭐⭐⭐ <span class="stars-text">(${rating} - ${reviewsCount} تقييم)</span>
    //             </div>
    //         `;
    //         // زرع التقييم تحت اسم المنتج مباشرة
    //         pTag.insertAdjacentHTML('afterend', starsHTML);
    //     }
    // });

    // 3. تسجيل تطبيق الويب (PWA) عشان ينزل على الموبايل
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("تم تفعيل التطبيق بنجاح!"))
        .catch(err => console.log("خطأ في تفعيل التطبيق: ", err));
    }
// // نقوم بسحب دالة createClient مباشرة من المكتبة المحملة
// const { createClient } = supabase;


async function showMyOrders() {

    const profile =
        JSON.parse(localStorage.getItem("customerProfile"));

    if (!profile) {
        alert("يرجى حفظ بياناتك أولاً");
        return;
    }

    const modal =
        document.getElementById("orders-modal");

    const list =
        document.getElementById("orders-list");

    list.innerHTML = "جاري تحميل الطلبات...";

    modal.showModal();

    const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("phone_number", profile.phone)
        .order("id", { ascending: false });

    if (error) {

        list.innerHTML =
            "حدث خطأ أثناء تحميل الطلبات";

        console.error(error);

        return;
    }

    if (!data.length) {

        list.innerHTML =
            "لا توجد طلبات سابقة";

        return;
    }

list.innerHTML = data.map(order => `
    <div class="order-card">

        <div class="order-header">
            <span class="order-id">طلب #${order.id}</span>

            <span class="order-status">
                ${order.status || "جديد"}
            </span>
        </div>

        <div class="order-items">
            ${order.cart_details.replace(/\n/g,'<br>')}
        </div>

    </div>
`).join("");
}


// const SUPABASE_URL = 'https://zqqpknqexsnskowhiwfj.supabase.co';
// const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E';

// // إنشاء العميل
// const supabaseClient = createClient('https://zqqpknqexsnskowhiwfj.supabase.co',  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E');

const SUPABASE_URL = "https://zqqpknqexsnskowhiwfj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E";

const supabaseClient = supabase.createClient(
    'https://zqqpknqexsnskowhiwfj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E'
);
