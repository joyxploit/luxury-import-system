
// Cart functionality
let cart = [];
let cartCount = 0;

// Get all "Add to Cart" buttons
const addToCartButtons = document.querySelectorAll('.btn-add-cart');

addToCartButtons.forEach(button => {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Get product details from the card
    const productCard = this.closest('.product-card');
    const productName = productCard.querySelector('.product-name').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    
    // Add to cart
    cart.push({
      name: productName,
      price: productPrice
    });
    
    // Update cart count
    cartCount++;
    document.querySelector('.cart-count').textContent = cartCount;
    
    // Change button text temporarily
    this.textContent = 'Added!';
    this.style.background = '#4CAF50';
    
    setTimeout(() => {
      this.textContent = 'Add to Cart';
      this.style.background = '';
    }, 1500);
    
    console.log('Cart:', cart);
  });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Product card hover effect
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

