//Variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItem = document.querySelector('.cart-item');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');
//badg number
const cartItems = document.querySelector('.cart-items');
const wrappCartItem = document.querySelector('.wrapp-cart-item');
//Cart
let cart = [];
let buttonsDomArry = [];

// getting  products from json file
//=================================================
//===============UI Products==================================
//=================================================
class Products {

  async getProducts() {

    let result = await fetch('products.json');
    let data = await result.json();
    let products = data.items;

    products = products.map(item => {

      const {
        title,
        price
      } = item.fields;
      //
      const {
        id
      } = item.sys;
      //
      const image = item.fields.image.fields.file.url;
      //
      return {
        title,
        price,
        id,
        image
      }

    })
    return products;
  }

}
//=================================================
//===============UI Class==================================
//=================================================
class UI {

  displayProducts(products) {
    let productsHtml = '';

    products.forEach(product => {
      productsHtml += `
          <article class="product">
          <div class="img-container">
            <img src="${product.image}" alt="" class="product-img">

            <button class="bag-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              Add to Cart
            </button>

          </div>
          <h3 class="section-title">${product.title}</h3>
          <h4>${product.price}$</h4>
        </article>
   `
    });
    productsDom.innerHTML = productsHtml;
  }


  static getBagBtns() {
    //All Cart Buttons
    const buttons = Array.from(document.querySelectorAll('.bag-btn'));

    buttonsDomArry = buttons;
    //من الاخر هيشوف اذااي من الازرار رقمه داخل العربة علشان يعمل بعض التأثيرات عليه
    //check if its inside cart array or not by find()
    buttons.forEach(function (button) {

      let id = button.dataset.id;
      //if id matched it will add to cart array
      let inCart = cart.find((item) => item.id === id);

      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      } else {
        button.addEventListener('click', (e) => {
          e.target.innerText = 'In Cart';
          e.target.disabled = true;
          //1-get products from product list //convert to object
          let cartItem = {
            ...Storage.getProduct(id),
            amount: 1
          };
          //2-add product to cart
          cart = [...cart, cartItem]
          //3-save cart in local storage
          Storage.saveCart(cart);
          //4-set cart values//set cart item number
          UI.setCartValues(cart);

          //5-display side cart popup
          UI.addCartItems(cart);
          //6-show cart//IIFE       
          (() => {
            cartOverlay.classList.add('transparentCart');
            cartDom.classList.add('showCart');

          })()
        })
      }
    })


  }
  // numeric values only
  static setCartValues(cart) {
    let tempTotal = 0;
    let ItemsTotal = 0;
    cart.map(item => {
      //total of all products
      tempTotal += item.price * item.amount;
      ItemsTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = ItemsTotal;
  }
  //to add productSSS to cart dom element
  static addCartItems(cart) {
    let cartProductsHTHML = '';

    cart.forEach(singleItem => {
      cartProductsHTHML += `
       <div class="cart-item">
      <img src=${singleItem.image}>
      <div>
        <h4>${singleItem.title}</h4>
        <h5>${singleItem.price}$</h5>
        <span data-id="${singleItem.id}" class="remove-item">
          <i class="fas fa-trash" style="color:rgb(219, 45, 45)"></i>
          remove
        </span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id="${singleItem.id}" ></i>
        <p class="item-amount">${singleItem.amount}</p>
        <i class="fas fa-chevron-down" data-id="${singleItem.id}" ></i>
      </div>
    </div>`;

    });
    wrappCartItem.innerHTML = cartProductsHTHML;
  }

  //for show side cart
  showCart() {
    cartOverlay.classList.add('transparentCart');
    cartDom.classList.add('showCart');
  }

  closeCart() {
    cartOverlay.classList.remove('transparentCart');
    cartDom.classList.remove('showCart');
  }

  setupApp() {
    cart = Storage.getCartFromLS();
    UI.setCartValues(cart);
    UI.addCartItems(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.closeCart);
  }

  cartLogic() {
    //Clear btn
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    //remove product btn
    wrappCartItem.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-item')) {
        UI.removeProductFunc(e);
      } else if (e.target.classList.contains('fa-chevron-up')) {
        UI.incProductFunc(e.target)
      } else if (e.target.classList.contains('fa-chevron-down')) {
        UI.decProductFunc(e.target)
      }

    });

  }
  // cartLogic
  static removeProductFunc(e) {

    let productId = e.target.dataset.id;
    //in localStoreage class
    // Storage.removeProduct(productId);
    UI.removeProductDOM(e.target);
    // to retreve add to cart btn to default value
    UI.getBagBtns;
  }
  // cartLogic
  static incProductFunc(upBtn) {

    let id = upBtn.dataset.id;
    let tempItem = cart.find(item => item.id == id);
    tempItem.amount++;
    Storage.saveCart(cart);
    UI.setCartValues(cart);
    console.log(upBtn.nextElementSibling)
    upBtn.nextElementSibling.innerText = tempItem.amount;
  }

  // cartLogic
  static decProductFunc(downBtn) {

    let id = downBtn.dataset.id;
    let tempItem = cart.find(item => item.id == id);

    tempItem.amount--;
    // zero validation
    if (tempItem.amount > 0) {
      Storage.saveCart(cart);
      UI.setCartValues(cart);
      downBtn.previousElementSibling.innerText = tempItem.amount;
    } else {
      Storage.saveCart(cart);
      UI.setCartValues(cart);
      // wrappCartItem.removeChild(downBtn.closest('.cart-item'));
      UI.removeProductDOM(downBtn);

    }

  }
  // cartLogic
  clearCart() {
    Storage.clearCartContent();
    this.removeAllChildren(wrappCartItem);
    cart = [];
    UI.setCartValues(cart);
  }

  removeAllChildren(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  }

  static removeProductDOM(button) {
    //remove product dom 
    wrappCartItem.removeChild(button.closest('.cart-item'));
    //remove from cart local storage
    Storage.removeProduct(button.dataset.id);

  }

}
//=================================================
//===============Storage Class==================================
//=================================================
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  //=======get single products from local storage=======
  static getProduct(id) {
    let allProducts = JSON.parse(localStorage.getItem('products'));
    // return allProducts.find((product) => product.id == id);

    return allProducts.find(function (product) {

      return product.id === id;
    });
  }

  //===========save Cart in local storage========
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart))
  }

  static getCartFromLS() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  }

  //===========Clear all cart content========
  static clearCartContent() {
    localStorage.getItem('cart') ? localStorage.removeItem('cart') : alert('Cart is empty');
  }
  static removeProduct(productId) {
    // Save all products 'Except' this product
    cart = cart.filter(item => item.id !== productId);
    console.log(cart);
    UI.setCartValues(cart);
    this.saveCart(cart);
    UI.getBagBtns
  }
}

//=================================================
//===============DOMContentLoaded==================================
//=================================================
document.addEventListener("DOMContentLoaded", function () {
  const ui = new UI();
  const product = new Products();

  //setUp Application 
  ui.setupApp();
  //(then)make promise until finsh works
  //first parameter is "onFulfilled" second "onRejected" ;
  product.getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      UI.getBagBtns();
      ui.cartLogic();
    })

});