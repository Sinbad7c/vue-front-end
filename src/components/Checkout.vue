<template>
  <div class="checkout-container">
    <!-- Cart Section -->
    <div class="cart-section">
      <h2>Cart Details</h2>


      <!-- Integrated lessons-grid -->
      <div class="lessons-grid">
        
        <div v-for="lesson in cartItems" :key="lesson.id" class="lesson-container">
          <div class="image-container">
          <img :src="lesson.imagePath" :alt="lesson.imageAlt" class="lesson-icon" />
          <div class="rating">
            <span v-for="n in lesson.rating" :key="'filled-' + n" class="star filled">★</span>
            <span v-for="n in 5 - lesson.rating" :key="'empty-' + n" class="star">☆</span>
          </div>
        </div>

         <!-- Lesson Info -->
         <div class="lesson-info">
           <h3>{{ lesson.subject }}</h3>
             <p>Location: {{ lesson.location }}</p>
             <p>Price: ${{ lesson.price }}</p>
             <p>Spaces: {{ lesson.spaces }}</p>
            <p>
             <span v-if="lesson.spaces > 5" class="status green">Buy Now</span>
             <span v-else-if="lesson.spaces > 0" class="status orange">Only {{ lesson.spaces }} left!</span>
             <span v-else class="status red">Sold Out</span>
            </p>
          </div>

         <!--  Action Buttons  -->
          <div class="lesson-actions">
           <button 
             id="add"
             @click="addToCart(lesson.id, 1)" 
             :disabled="lesson.spaces <= 0">
             +
            </button>
            <span class="quantity">{{ lesson.quantity }}</span>
           <button 
             id="minus" 
             v-if="cart.some(item => item.id === lesson.id)" 
             @click="removeFromCart(lesson.id)">
             -
            </button>
          </div>

          <!-- Lesson Total -->
          <div class="lesson-total">
            <p>Total: ${{ getLessonTotal(lesson) }}</p>
          </div>

        </div>
      </div>
    </div>



  </hr>

   <!--  Grand Total Section  -->
   <div class="grand-total-section">
      <h3>Grand Total: ${{ grandTotal }}</h3>
   </div>

  <hr>


    <h2>Checkout</h2>
    <form @submit.prevent="submitForm">
      <!-- First Name -->
      <div class="form-group">
        <label for="firstName">First Name:</label>
        <input
          id="firstName"
          type="text"
          v-model.trim="formData.firstName"
          @input="validateName('firstName')"
          :class="{ 'is-invalid': errors.firstName }"
          required
        />
        <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
      </div>

      <!--  Last Name  -->
      <div class="form-group">
        <label for="lastName">Last Name:</label>
        <input
          id="lastName"
          type="text"
          v-model.trim="formData.lastName"
          @input="validateName('lastName')"
          :class="{ 'is-invalid': errors.lastName }"
          required
        />
        <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
      </div>

      <!--  Address  -->
      <div class="form-group">
        <label for="address">Address:</label>
        <input
          id="address"
          type="text"
          v-model="formData.address"
          :class="{ 'is-invalid': errors.address }"
          required
        />
        <span v-if="errors.address" class="error">{{ errors.address }}</span>
      </div>

      <!-- City -->
      <div class="form-group">
        <label for="city">City:</label>
        <input
          id="city"
          type="text"
          v-model="formData.city"
          :class="{ 'is-invalid': errors.city }"
          required
        />
        <span v-if="errors.city" class="error">{{ errors.city }}</span>
      </div>

      <!-- State Dropdown -->
      <div class="form-group">
        <label for="state">State:</label>
        <select
          id="state"
          v-model="formData.state"
          :class="{ 'is-invalid': errors.state }"
          required
        >
          <option disabled value="">Select State</option>
          <option v-for="(name, code) in states" :key="code" :value="code">
            {{ name }}
          </option>
        </select>
        <span v-if="errors.state" class="error">{{ errors.state }}</span>
      </div>

      <!-- ZIP Code -->
      <div class="form-group">
        <label for="zip">ZIP Code:</label>
        <input
          id="zip"
          type="text"
          v-model.number="formData.zip"
          @input="validateZip"
          :class="{ 'is-invalid': errors.zip }"
          required
        />
        <span v-if="errors.zip" class="error">{{ errors.zip }}</span>
      </div>

      <!-- Checkbox -->
      <div class="form-group checkbox-group">
        <label for="shipAsGift">Ship as Gift</label>
        <input
          type="checkbox"
          id="shipAsGift"
          v-model="formData.shipAsGift"
          true-value="Send as a Gift"
          false-value="Do not Send as a Gift"
        />
      </div>

      <!-- Radio Buttons -->
      <div class="form-group radio-group">
        <label>Address Type:</label>
        <div>
          <label>
            <input
              type="radio"
              value="Home"
              v-model="formData.addressType"
            />
            Home
          </label>
          <label>
            <input
              type="radio"
              value="Work"
              v-model="formData.addressType"
            />
            Work
          </label>
        </div>
      </div>

      <!-- Place Order Button -->
      <button type="submit" class="submit-button">Place Order</button>
    </form>
  </div>

</template>



<script>
export default {
  name: "Checkout",
  props: {
    cart: Array, // Cart is passed as a prop from App.vue
    updateCart: Function, // Shared method to update the cart
  },

  data() {
    return {
      formData: {
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        shipAsGift: false,
        addressType: "Home",
      },
      errors: {},
      states: {
        AL: "Atlanta",
        AR: "Arizona",
        NJ: "New Jersey",
        OH: "Ohio",
        TX: "Texas",
      },
      lessons: [], // Fetch lessons directly from backend for mapping cart data
    };
  },

  computed: {
    // Map cart items with lesson details fetched from the backend
    cartItems() {
      return this.cart
        .map((cartItem) => {
          const lesson = this.lessons.find((lesson) => lesson.id === cartItem.id);
          if (lesson) {
            return { ...lesson, quantity: cartItem.quantity };
          }
          return null; // Filter out invalid cart items
        })
        .filter(Boolean); // Remove any null values
    },

    // Calculate grand total for all lessons in the cart
    grandTotal() {
      return this.cartItems.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );
    },
  },

  methods: {
    // Fetch lessons from the backend using lessonIds
    async fetchLessons() {
      try {
        const lessonIds = this.cart.map((item) => item.id); // Extract lesson IDs from cart
        const response = await fetch("http://localhost:3000/lessons/cart/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonIds }),
        });
        const data = await response.json();
        this.lessons = data;
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    },

    // Validate name fields
    validateName(field) {
      const value = this.formData[field];
      const regex = /^[a-zA-Z\s]*$/;
      if (!regex.test(value)) {
        this.errors[field] = `${field.replace(/^\w/, (c) =>
          c.toUpperCase()
        )} must contain only alphabetic characters.`;
      } else {
        delete this.errors[field];
      }
    },

    // Validate ZIP code
    validateZip() {
      const value = this.formData.zip;
      const regex = /^[0-9]*$/;
      if (!regex.test(value)) {
        this.errors.zip = "ZIP Code must contain only numeric characters.";
      } else {
        delete this.errors.zip;
      }
    },

    // Validate the entire form
    validateForm() {
      this.errors = {};
      if (!this.formData.firstName) {
        this.errors.firstName = "First name is required.";
      }
      if (!this.formData.lastName) {
        this.errors.lastName = "Last name is required.";
      }
      if (!this.formData.address) {
        this.errors.address = "Address is required.";
      }
      if (!this.formData.city) {
        this.errors.city = "City is required.";
      }
      if (!this.formData.state) {
        this.errors.state = "State is required.";
      }
      if (!this.formData.zip || isNaN(this.formData.zip)) {
        this.errors.zip = "Valid ZIP Code is required.";
      }
      return Object.keys(this.errors).length === 0;
    },

    // Submit the order
    async submitForm() {
      if (this.validateForm()) {
        try {
          const response = await fetch("http://localhost:3000/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: this.formData.firstName,
              lastName: this.formData.lastName,
              address: this.formData.address,
              city: this.formData.city,
              state: this.formData.state,
              zip: this.formData.zip,
              shipAsGift: Boolean(this.formData.shipAsGift),
              addressType: this.formData.addressType,
              lessonItems: this.cart.map((item) => ({
                id: item.id,
                spaces: item.quantity,
              })),
              totalSpent: this.grandTotal, 
            }),
          });

          const data = await response.json();

          if (data.error) {
            console.error(data.error);
            alert("Failed to place order.");
          } else {
            alert("Order placed successfully!");
            console.log(data);

            // Clear the cart and reset the form
            this.cart.length = 0;
            this.formData = {
              firstName: "",
              lastName: "",
              address: "",
              city: "",
              state: "",
              zip: "",
              shipAsGift: false,
              addressType: "Home",
            };
            this.errors = {};
          }
        } catch (error) {
          console.error("Error submitting order:", error);
        }
      }
    },

    // Add to cart via backend
    async addToCart(lessonId, quantity) {
      try {
        const response = await fetch("http://localhost:3000/lessons/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, quantity }),
        });
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        // Sync spaces with backend
        const updatedLesson = this.lessons.find((lesson) => lesson.id === lessonId);
        if (updatedLesson) {
          updatedLesson.spaces = data.lesson.spaces;
        }

        this.updateCart(lessonId, quantity); // Update cart in parent
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },

    // Remove from cart via backend
    async removeFromCart(lessonId) {
      try {
        const response = await fetch("http://localhost:3000/lessons/cart/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, quantity: 1 }),
        });
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        // Sync spaces with backend
        const updatedLesson = this.lessons.find((lesson) => lesson.id === lessonId);
        if (updatedLesson) {
          updatedLesson.spaces = data.lesson.spaces;
        }

        this.updateCart(lessonId, -1); // Update cart in parent
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    },

    // Calculate total for each lesson
    getLessonTotal(lesson) {
      return lesson.quantity * lesson.price;
    },
  },

  async mounted() {
    // Fetch lessons when the component is mounted
    await this.fetchLessons();
  },
};
</script>








<style scoped>
.checkout-container {
  max-width: 900px; /* Use the more specific value */
  margin: 20px auto;
  padding: 20px 60px; /* Retain the detailed padding */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}



h2 {
  margin-bottom: 20px;
  text-align: center;
}

/* CSS for lesson container */
.lessons-grid {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Space between lessons */
}

.lesson-container {
  display: flex;
  align-items: center; /* Align items in the center vertically */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  gap: 20px; /* Space between image and info sections */
}

.lesson-icon {
  width: 180px; /* Fixed width for images */
  height: auto;
  border-radius: 4px;
  margin-left: 80px;
}

.lesson-info {
  flex: 1; /* Take up available space */
  display: flex;
  flex-direction: column;
  gap: 3px; /* Space between lesson details */
}

/* Wrap image and rating in a column layout */
.image-container {
  display: block; /* Ensure image and rating are block-level */
  text-align: center; /* Center-align the stars */
}

.rating {
  margin-top: 10px; /* Space above stars */
  display: flex;
  gap: 3px;
  color: gold;
  font-size: 1.8rem; /* Enlarge stars */
  margin-left: 80px;
}

/* Availability Messages */
.status {
  font-weight: bold; /* Shared style for all messages */
}

.status.green {
  color: green; /* Green for "Buy Now" */
}

.status.orange {
  color: orange; /* Orange for "Only X left" */
}

.status.red {
  color: red; /* Red for "Sold Out" */
}


#add {
  background-color: #37f037;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem; 
  font-weight: bold; 
}

#minus {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem; 
  font-weight: bold; 
}

#add:disabled {
  background-color: #cccccc; /* Gray background for disabled button */
  cursor: not-allowed; /* Change cursor for disabled */
}

#add:hover:not(:disabled) {
  background-color: #048f27; /* Darker green on hover */
}

.quantity {
  font-size: 1rem;
  font-weight: bold;
}

.lesson-actions {
  display: flex;
  align-items: center;
  gap: 16px; /* Gap between buttons */
}

/* End of css for lessons */

.lesson-total {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.grand-total-section {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 2px solid #ddd;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}


.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input.is-invalid,
select.is-invalid {
  border-color: red;
}

.error {
  color: red;
  font-size: 0.9rem;
}


.checkbox-group {
  display: flex; 
  align-items: center; 
  gap: 15px; /* Adjust spacing between the checkbox and label */
}

.checkbox-group label {
  white-space: nowrap; 
  margin: 0; 
  font-weight: bold; 
}

.checkbox-group input[type="checkbox"] {
  margin: 0; /* Remove extra margins */
  accent-color: #007bff; 
  width: 20px; 
  height: 15px; 
}

.radio-group {
  display: flex;
  align-items: center; /* Aligns the text and radio buttons vertically */
  gap: 10px; /* Adds space between "Address Type:" and radio options */
}

.radio-group label:first-child {
  margin-right: 10px; /* Adds space between "Address Type:" label and radio buttons */
  white-space: nowrap; /* Prevents wrapping of the "Address Type:" label */
}

.radio-group div {
  display: flex; /* Aligns radio options in a row */
  gap: 15px; /* Adds space between "Home" and "Work" radio buttons */
}

.radio-group input[type="radio"] {
  margin: 0; /* Removes extra spacing around radio buttons */
  accent-color: #007bff; /* Optional: Customizes the radio button color */
  width: 16px; /* Adjusts size */
  height: 16px; /* Ensures consistent size */
  vertical-align: middle; /* Aligns with text */
}


.checkout-layout {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}


.rating {
  margin-top: 5px;
  display: flex;
  gap: 3px;
}

.totals {
  flex: 1;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
}


.form-section {
  margin-top: 20px;
}

.submit-button {
  display: block;
  width: 50%; 
  padding: 10px;
  font-size: 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px; 
  cursor: pointer;
  margin: auto; 
}

.submit-button:hover {
  background: #0056b3;
}
</style>
