<template>
  <div>
    <header class="app-header">
      <h1>After School Club</h1>
      <nav>
        <router-link to="/" class="button">Home</router-link>
        <router-link to="/checkout" class="button">
          Checkout
          <img src="@/assets/icons/cart-icon.png" alt="Cart Icon" class="cart-icon" />
          <span>{{ totalItems }}</span>
        </router-link>
      </nav>
    </header>
    <router-view :cart="cart" :update-cart="updateCart" />
  </div>
</template>

<script>
import { reactive, computed } from 'vue';

export default {
  setup() {
    const cart = reactive([]);

    const updateCart = (lessonId, quantity) => {
      const item = cart.find((item) => item.id === lessonId);
      if (item) {
        item.quantity += quantity;
        if (item.quantity <= 0) {
          cart.splice(cart.indexOf(item), 1);
        }
      } else if (quantity > 0) {
        cart.push({ id: lessonId, quantity });
      }
    };

    const totalItems = computed(() => cart.reduce((sum, item) => sum + item.quantity, 0));

    return {
      cart,
      updateCart,
      totalItems,
    };
  },
};
</script>


<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
  color: black;
}

.nav-cart-container {
  display: flex; /* Align items horizontally */
  align-items: center;
  gap: 15px; /* Space between buttons */
}

.button {
  display: inline-flex; /* Align icon and text inline */
  align-items: center; /* Vertically center icon and text */
  padding: 10px 15px;
  background-color: #37f037; 
  color: rgb(255, 255, 255); 
  border: none; 
  border-radius: 5px; /* Rounded corners */
  text-decoration: none; /* Remove link underline */
  cursor: pointer; 
}

.button:hover {
  background-color: #048f27; 
}

.cart-icon {
  width: 20px; /* Icon size */
  height: 20px;
  margin-left: 5px; /* Space between counter and  cart icon */
  margin-right: 5px;
}

</style>
