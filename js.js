// تعريف السلة
let cart = [];

// 1. استرجاع البيانات عند فتح الصفحة
window.onload = function() {
    let savedCart = localStorage.getItem('myCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
};

// 2. دالة حفظ السلة في ذاكرة المتصفح
function saveCart() {
    if (cart.length === 0) {
        localStorage.removeItem('myCart');
    } else {
        localStorage.setItem('myCart', JSON.stringify(cart));
    }
}

// إضافة صنف للسلة
function addToCart(name, price) {
    showToast();
    let clickSound = new Audio('click.mp3');
    clickSound.play();
    
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
}

// تحديث الكمية
function updateQty(index, newQty) {
    cart[index].quantity = parseInt(newQty);
    saveCart();
    updateCartUI();
}

// حذف صنف
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

// تفريغ السلة بالكامل
function clearCart() {
    if (confirm("هل أنت متأكد أنك تريد مسح السلة بالكامل؟")) {
        cart = [];
        saveCart();
        updateCartUI();
    }
}

// فتح وإغلاق السلة (مع التحكم في التمرير)
function openCart() {
    document.getElementById('cart-modal').showModal();
    updateCartUI();
}

function closeCart() {
    document.getElementById('cart-modal').close();
}

// تحديث واجهة السلة
function updateCartUI() {
    let container = document.getElementById('cart-items');
    container.innerHTML = "";

    cart.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <span class="item-name">${item.name}</span>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                       onchange="updateQty(${index}, this.value)">
                <button class="remove-btn" onclick="removeItem(${index})">حذف</button>
            </div>
        `;
    });

    let countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function sendOrder() {
    let shopName = document.getElementById('shop-name').value;
    
    // التحقق من اسم المحل
    if (shopName.trim() === "") {
        alert("من فضلك اكتب اسم المحل!");
        return;
    }
    
    // تحضير البيانات
    let cartDetails = cart.map(i => `• ${i.name} (العدد: ${i.quantity})`).join('\n');
    
    // تهيئة وإرسال الطلب مباشرة بدون إظهار شاشة تحميل
    emailjs.init("3xKGgYOdYgVChJOsh");
    emailjs.send('service_n44lkxg', 'template_s3kgnc8', {
        shop_name: shopName,
        cart_details: cartDetails
    }).then(function() {
        // تشغيل صوت النجاح
        let successSound = new Audio('click.mp3');
        successSound.play();
        
        alert("تم إرسال الطلب بنجاح!");
        
        // تفريغ السلة وتحديث الواجهة
        cart = [];
        saveCart();
        updateCartUI();
        document.getElementById('cart-modal').close();
    }, function(error) {
        alert("فشل الإرسال، تأكد من الاتصال بالإنترنت.");
    });
}

// زر العودة للأعلى
window.onscroll = function() {
    let btn = document.getElementById("backToTop");
    if (btn) {
        btn.style.display = (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) ? "block" : "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// تأثير الماوس
document.addEventListener("mousemove", (e) => {
    const cards = document.querySelectorAll('.a1');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
});

// رسالة تم الا ضافة الي السلة بنجاح
function showToast() {
    let toast = document.getElementById("toast");
    if (toast) {
        toast.classList.add("show");
        setTimeout(() => { toast.classList.remove("show"); }, 3000);
    }
}
// نسخ الرقم إلى الحافظة
function copyNumber(elementId) {
    let text = document.getElementById(elementId).innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        // رسالة تأكيد بسيطة
        alert("تم نسخ الرقم: " + text);
    }).catch(err => {
        console.error('فشل النسخ: ', err);
    });
}
// نسخ الطلب إلى الحافظة
function copyOrder() {
    let shopName = document.getElementById('shop-name').value;
    
    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }

    // تجميع نص الطلب
    let orderText = "🛒 *طلب جديد من متجر الشرقاوي*\n";
    orderText += "--------------------------\n";
    orderText += "اسم المحل: " + (shopName || "غير محدد") + "\n\n";
    orderText += "الأصناف:\n";
    
    cart.forEach(item => {
        orderText += `• ${item.name} (العدد: ${item.quantity})\n`;
    });
    
    orderText += "\n--------------------------\nتم نسخ الطلب بواسطة المتجر.";

    // عملية النسخ
    navigator.clipboard.writeText(orderText).then(() => {
        alert("تم نسخ الطلب بنجاح! ✅\nيمكنك الآن لصقه في الواتساب.");
    }).catch(err => {
        alert("فشل النسخ، يرجى المحاولة يدوياً.");
    });
}
