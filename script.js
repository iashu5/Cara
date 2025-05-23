// ===== Navigation Bar =====
const bar = document.getElementById("bar");
const close = document.getElementById("close");
const nav = document.getElementById("navbar");

if (bar) {
  bar.addEventListener("click", () => {
    nav.classList.add("active");
  });
}

if (close) {
  close.addEventListener("click", () => {
    nav.classList.remove("active");
  });
}

// ===== Cart Notification =====
function showCartNotification(product) {
  const notification = document.getElementById('cart-notification');
  const notificationImage = document.getElementById('notification-image');
  const notificationTitle = document.getElementById('notification-title');
  const notificationMessage = document.getElementById('notification-message');

  // Update notification content
  notificationImage.src = product.img;
  notificationTitle.textContent = 'Added to Cart!';
  notificationMessage.textContent = product.name;

  // Show notification
  notification.classList.add('show');

  // Add bounce effect to cart icon
  const cartIcon = document.querySelector('#lg-bag i, .fa-shopping-cart');
  if (cartIcon) {
    cartIcon.classList.add('cart-bounce');
    setTimeout(() => {
      cartIcon.classList.remove('cart-bounce');
    }, 500);
  }

  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// ===== Cart Functionality =====
document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart if it doesn't exist
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
  }

  // Add to cart functionality for all cart buttons
  const cartButtons = document.querySelectorAll('.cart');
  cartButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      addProductToCart(this);
    });
  });

  // Load cart if on cart page
  if (window.location.pathname.includes('cart.html')) {
    loadCart();
    setupCartEventListeners();
  }

  // Update cart count
  updateCartCount();

  // Prevent product click when clicking cart
  document.querySelectorAll('.pro').forEach(product => {
    product.addEventListener('click', function (e) {
      if (e.target.closest('.cart')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });

  // ===== Product Details Page: Add to Cart Button =====
  const addToCartBtn = document.getElementById("add-to-cart");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const productId = getProductIdFromURL();
      const product = products[productId];

      if (!product) return;

      const quantity = parseInt(document.querySelector("input[type='number']").value) || 1;

      const productToAdd = {
        id: productId,
        name: product.name,
        price: product.price,
        img: product.img,
        quantity: quantity,
      };

      addToCart(productToAdd);
      showCartNotification(productToAdd);
    });
  }
});

// Add product to cart
function addProductToCart(button) {
  const productElement = button.closest('.pro');
  const productId = productElement.dataset.id || Math.random().toString(36).substr(2, 9);
  const productName = productElement.querySelector('h5').textContent;
  const productPrice = parseFloat(productElement.querySelector('h4').textContent.replace('$', ''));
  const productImg = productElement.querySelector('img').src;

  const product = {
    id: productId,
    name: productName,
    price: productPrice,
    img: productImg,
    quantity: 1
  };

  addToCart(product);
  showCartNotification(product);
}

// Add item to cart storage
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart'));
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Load cart items
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsContainer = document.getElementById('cart-items');
  const subtotalElement = document.getElementById('cart-subtotal');
  const totalElement = document.getElementById('cart-total');
  let subtotal = 0;

  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<tr><td colspan="6">Your cart is empty</td></tr>';
    subtotalElement.textContent = '$0.00';
    totalElement.textContent = '$0.00';
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><i class="far fa-times-circle remove-item" data-id="${item.id}"></i></td>
      <td><img src="${item.img}" alt="${item.name}" width="50"></td>
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}"></td>
      <td>$${itemTotal.toFixed(2)}</td>
    `;
    cartItemsContainer.appendChild(row);
  });

  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  totalElement.textContent = `$${subtotal.toFixed(2)}`;
}

// Setup cart event listeners
function setupCartEventListeners() {
  // Remove item
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-item')) {
      const itemId = e.target.dataset.id;
      removeItem(itemId);
    }
  });

  // Update quantity
  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('quantity-input')) {
      const itemId = e.target.dataset.id;
      const newQuantity = parseInt(e.target.value);
      updateQuantity(itemId, newQuantity);
    }
  });

  // Apply coupon
  const couponBtn = document.getElementById('apply-coupon');
  if (couponBtn) {
    couponBtn.addEventListener('click', applyCoupon);
  }
}

// Remove item from cart
function removeItem(itemId) {
  let cart = JSON.parse(localStorage.getItem('cart'));
  cart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

// Update item quantity
function updateQuantity(itemId, quantity) {
  if (quantity < 1) return;

  let cart = JSON.parse(localStorage.getItem('cart'));
  const item = cart.find(item => item.id === itemId);

  if (item) {
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
  }
}

// Apply coupon
function applyCoupon() {
  const couponCode = document.getElementById('coupon-code').value.trim();
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Example coupon logic
  let discount = 0;
  if (couponCode === 'DISCOUNT10') {
    discount = subtotal * 0.1;
    showCouponAlert('10% discount applied!', 'success');
  } else if (couponCode) {
    showCouponAlert('Invalid coupon code', 'error');
  }

  document.getElementById('cart-total').textContent = `$${(subtotal - discount).toFixed(2)}`;
}

// Show coupon alert
function showCouponAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `coupon-alert ${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Update cart count in header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartIcon = document.querySelector('#lg-bag');

  let countBadge = cartIcon.querySelector('.cart-count');
  if (!countBadge) {
    countBadge = document.createElement('span');
    countBadge.className = 'cart-count';
    cartIcon.appendChild(countBadge);
  }
  countBadge.textContent = cartCount;
}

// Get product ID from URL for product details page
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}
