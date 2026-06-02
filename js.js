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

// إرسال الطلب (تأكد من استدعاء هذه الدالة في HTML)
function sendOrder() {
    let shopName = document.getElementById('shop-name').value;
    if (shopName === "") {
        alert("من فضلك اكتب اسم المحل!");
        return;
    }
    
    let cartDetails = cart.map(i => `• ${i.name} (العدد: ${i.quantity})`).join('\n');
    
    emailjs.init("3xKGgYOdYgVChJOsh");
    emailjs.send('service_n44lkxg', 'template_s3kgnc8', {
        shop_name: shopName,
        cart_details: cartDetails
    }).then(function() {
        alert("تم إرسال الطلب بنجاح!");
        cart = [];
        saveCart();
        updateCartUI();
        closeCart();
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

// رسالة Toast
function showToast() {
    let toast = document.getElementById("toast");
    if (toast) {
        toast.classList.add("show");
        setTimeout(() => { toast.classList.remove("show"); }, 3000);
    }
}