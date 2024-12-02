<template>
  <div class="home">
    
    <!-- Sorting Controls -->
    <div class="sorting-controls">
      <label for="sort-by">Sort By:</label>
      <select id="sort-by" v-model="sortBy" @change="sortLessons">
        <option value="price">Price</option>
        <option value="location">Location</option>
        <option value="subject">Lesson</option>
        <option value="spaces">Spaces</option>
      </select>
      <label for="order">Order:</label>
      <select id="order" v-model="sortOrder" @change="sortLessons">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      🔍
      <input
        type="text"
        id="search"
        v-model="searchQuery"
        placeholder="Search lessons..."
        @input="searchLessons"
      />
    </div>

    <!-- Lessons Grid -->
    <div class="lessons-grid">
      <div v-for="lesson in filteredLessons" :key="lesson.id" class="lesson-container">
        <img :src="lesson.imagePath.startsWith('http://localhost:3000') ? lesson.imagePath : `http://localhost:3000${lesson.imagePath}`"
         :alt="lesson.imageAlt"
          class="lesson-icon" />
        <h3>{{ lesson.subject }}</h3>
        <p>{{ lesson.location }}</p>
        <p>${{ lesson.price }}</p>
        <p>
          <span v-if="lesson.spaces > 5" class="status green">Buy Now</span>
          <span v-else-if="lesson.spaces > 0" class="status orange">Only {{ lesson.spaces }} left!</span>
          <span v-else class="status red">Sold Out</span>
        </p>
        <p>Available Spaces: {{ lesson.spaces }}</p>


        <button 
          id="add"
          @click="addToCart(lesson.id, 1)" 
          :disabled="lesson.spaces <= 0"
        >
          Add to Cart
        </button>

        <button 
         id="minus" 
         v-if="cart.some(item => item.id === lesson.id)" 
         @click="removeFromCart(lesson.id)">
         -
        </button>


        <!-- 5-Star Rating System -->
        <div class="rating">
           <span v-for="n in lesson.rating" :key="'filled-' + n" class="star filled">★</span>
           <span v-for="n in 5 - lesson.rating" :key="'empty-' + n" class="star">☆</span>
       </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'Home',
  props: {
    cart: Array,
    updateCart: Function,
  },
  setup(props) {
    const lessons = ref([]);
    const filteredLessons = ref([]);
    const searchQuery = ref('');
    const sortBy = ref('price');
    const sortOrder = ref('asc');

    // Fetch lessons on mount
  onMounted(async () => {
   try {
    const response = await fetch('http://localhost:3000/lessons');
    const data = await response.json();
    lessons.value = data;

    // Adjust available spaces based on the cart
    props.cart.forEach((cartItem) => {
      const lesson = lessons.value.find((lesson) => lesson.id === cartItem.id);
      if (lesson) {
        lesson.spaces -= cartItem.quantity; // Subtract cart quantities from available spaces
      }
    });

    filteredLessons.value = lessons.value; // Update filtered lessons
    } catch (error) {
    console.error('Error fetching lessons:', error);
    }
   });


    // Sort lessons
    const sortLessons = () => {
      filteredLessons.value = [...filteredLessons.value].sort((a, b) => {
        const fieldA = a[sortBy.value];
        const fieldB = b[sortBy.value];

        if (sortOrder.value === 'asc') {
          return fieldA > fieldB ? 1 : -1;
        } else {
          return fieldA < fieldB ? 1 : -1;
        }
      });
    };

    // Search lessons
    const searchLessons = async () => {
    try {
    const response = await fetch(`http://localhost:3000/lessons/search?query=${searchQuery.value}`);
    const data = await response.json();
    data.forEach((lesson) => {
      console.log("Final ImagePath:", lesson.imagePath); // Debugging
    });
    filteredLessons.value = data; // Update lessons with the correct imagePath
    sortLessons(); // Reapply sorting to search results
    } catch (error) {
    console.error('Error searching lessons:', error);
    }
   };


    // Local addToCart method
    const addToCart = async (lessonId, quantity) => {
      try {
        const response = await fetch('http://localhost:3000/lessons/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, quantity }),
        });
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        const updatedLesson = lessons.value.find((lesson) => lesson.id === lessonId);
        if (updatedLesson) {
          updatedLesson.spaces = data.lesson.spaces; // Sync spaces with backend
        }

        filteredLessons.value = [...lessons.value]; // Update filtered list reactively
        props.updateCart(lessonId, quantity); // Update cart in parent
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    };

    // Local removeFromCart method
    const removeFromCart = async (lessonId) => {
      try {
        const response = await fetch('http://localhost:3000/lessons/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, quantity: 1 }), // Increment spaces by 1
        });
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        const updatedLesson = lessons.value.find((lesson) => lesson.id === lessonId);
        if (updatedLesson) {
          updatedLesson.spaces = data.lesson.spaces; // Sync spaces with backend
        }

        filteredLessons.value = [...lessons.value]; // Update filtered list reactively
        props.updateCart(lessonId, -1); // Update cart in parent
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    };

    return {
      lessons,
      filteredLessons,
      searchQuery,
      sortBy,
      sortOrder,
      sortLessons,
      searchLessons,
      addToCart,
      removeFromCart, // Ensure this is exposed
    };
  },
};
</script>







<style scoped>
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
  display: inline-flex;
  align-items: center;
  padding: 10px 5px;
  background-color: #37f037; /* Light green */
  color: rgb(255, 255, 255); /* White text */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem; /* Readable font size */
}

#add:disabled {
  background-color: #cccccc; /* Gray background for disabled button */
  cursor: not-allowed; /* Change cursor for disabled */
}

#add:hover:not(:disabled) {
  background-color: #048f27; /* Darker green on hover */
}

#minus { 
  display: inline-flex;
  align-items: center;
  padding: 3px 10px 5px;
  background-color: #ff3333; /* Red */
  color: rgb(0, 0, 0); /* Black text */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem; /* Readable font size */
  margin-left: 10px;
}

#minus:hover {
  background-color: #cc0000; /* Darker red on hover */
}

/* Star Rating System Styling */
.rating {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px; /* Adds spacing between stars */
}

.star {
  font-size: 1.5rem; /* Ensures consistent star size */
  line-height: 1;
}

.star.filled {
  color: #ffc107; /* Gold color for filled stars */
}

.star:not(.filled) {
  color: #574c4cd5; /* Grey color for empty stars */
}

</style>
