/**
 * VILLA SERENITY BALI - HOTEL LANDING PAGE
 * JavaScript untuk Workshop Day 1
 */

// ============================================
// NAVIGATION
// ============================================
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Smooth scroll untuk navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            document.querySelector('.nav-menu').classList.remove('active');
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// ============================================
// BOOKING FORM
// ============================================
const bookingForm = document.getElementById('bookingForm');
const checkinInput = document.getElementById('checkin');
const checkoutInput = document.getElementById('checkout');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
checkinInput.min = today;
checkoutInput.min = today;

// Update checkout min date when checkin changes
checkinInput.addEventListener('change', () => {
    checkoutInput.min = checkinInput.value;
    if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        // Set checkout to day after checkin
        const checkinDate = new Date(checkinInput.value);
        checkinDate.setDate(checkinDate.getDate() + 1);
        checkoutInput.value = checkinDate.toISOString().split('T')[0];
    }
    calculateTotal();
});

checkoutInput.addEventListener('change', calculateTotal);

// Form submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        checkin: checkinInput.value,
        checkout: checkoutInput.value,
        adults: document.getElementById('adults').value,
        children: document.getElementById('children').value
    };

    // Validasi tanggal
    if (formData.checkin >= formData.checkout) {
        showToast('Check-out harus setelah check-in!', 'error');
        return;
    }

    // Simulasi pengecekan ketersediaan
    showToast('Mengecek ketersediaan kamar...', 'info');
    
    setTimeout(() => {
        showToast(`Kamar tersedia! ${formData.adults} dewasa, ${formData.children} anak`, 'success');
        
        // Scroll ke bagian kamar
        document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
    }, 1500);
});

// ============================================
// ROOM SELECTION
// ============================================
const roomPrices = {
    'deluxe': 1500000,
    'suite': 2800000,
    'villa': 5500000
};

let selectedRoom = null;

function selectRoom(roomType) {
    selectedRoom = roomType;
    const roomNames = {
        'deluxe': 'Deluxe Room',
        'suite': 'Executive Suite',
        'villa': 'Private Villa'
    };
    
    showToast(`Anda memilih ${roomNames[roomType]}`, 'success');
    calculateTotal();
    
    // Highlight selected room card
    document.querySelectorAll('.room-card').forEach(card => {
        card.style.border = 'none';
    });
    
    event.target.closest('.room-card').style.border = '3px solid #E76F51';
}

function calculateTotal() {
    if (!selectedRoom || !checkinInput.value || !checkoutInput.value) return;
    
    const checkin = new Date(checkinInput.value);
    const checkout = new Date(checkoutInput.value);
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    
    if (nights > 0) {
        const total = roomPrices[selectedRoom] * nights;
        console.log(`Total: Rp ${total.toLocaleString('id-ID')} untuk ${nights} malam`);
    }
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const colors = {
        'success': '#2A6F6F',
        'error': '#E76F51',
        'info': '#264653'
    };
    
    toast.textContent = message;
    toast.style.background = colors[type] || colors['info'];
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// TESTIMONIAL SLIDER (Simple version)
// ============================================
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');

function showTestimonial(index) {
    testimonials.forEach((t, i) => {
        t.style.display = i === index ? 'block' : 'none';
    });
}

// Auto-rotate testimonials on mobile
if (window.innerWidth < 768) {
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);
}

// ============================================
// ANIMATIONS ON SCROLL
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.room-card, .amenity-item, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// COUNTER ANIMATION (untuk statistik jika ada)
// ============================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// ============================================
// LAZY LOADING IMAGES
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img').forEach(img => imageObserver.observe(img));
}

// ============================================
// PERFORMANCE MONITORING
// ============================================
window.addEventListener('load', () => {
    // Log page load time
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`⏱️ Page loaded in ${pageLoadTime}ms`);
});

// ============================================
// CONSOLE EASTER EGG 🎉
// ============================================
console.log('%c🏨 Villa Serenity Bali', 'font-size: 24px; font-weight: bold; color: #2A6F6F;');
console.log('%cWorkshop Web Development untuk Industri Perhotelan', 'font-size: 14px; color: #E76F51;');
console.log('%cSelamat belajar! 🚀', 'font-size: 12px; color: #264653;');
