document.addEventListener("DOMContentLoaded", () => {
  // Saare testimonial cards ko select kiya
  const testimonialCards = document.querySelectorAll('.dochaki-t-card');

  // Har ek card ke liye alag se slider logic chalega
  testimonialCards.forEach((card) => {
    const prevBtn = card.querySelector('.dochaki-btn-prev');
    const nextBtn = card.querySelector('.dochaki-btn-next');
    const dots = card.querySelectorAll('.dochaki-dot');
    const img = card.querySelector('.dochaki-t-img');

    // Dummy bike images carousel effect ke liye (Aap yahan apni image URLs daal sakte ho)
    const images = [
      img.src, // Pehli image vahi rahegi jo HTML me h
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80"
    ];

    let currentIndex = 0;

    // Function: UI update karne ke liye (Image + Dots)
    function updateCarousel(index) {
      // Index bound check
      if (index >= images.length) currentIndex = 0;
      else if (index < 0) currentIndex = images.length - 1;
      else currentIndex = index;

      // Image source update
      img.src = images[currentIndex];

      // Active dot state update
      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Next Button Click
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        updateCarousel(currentIndex + 1);
      });
    }

    // Prev Button Click
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        updateCarousel(currentIndex - 1);
      });
    }

    // Dots Click functionality
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        updateCarousel(index);
      });
    });
  });
});



// REFINED DMOTECH LIGHTBOX CONTROLLER
function motoLaunchVideo(id) {
    const box = document.getElementById("motoVideoModal");
    const frame = document.getElementById("motoModalIframe");
    
    if (box && frame) {
        frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
        box.classList.add("active-view");
        document.body.style.overflow = "hidden"; // Multi-scroll freeze
    }
}

function motoDismissVideo() {
    const box = document.getElementById("motoVideoModal");
    const frame = document.getElementById("motoModalIframe");
    
    if (box && frame) {
        box.classList.remove("active-view");
        frame.src = ""; 
        document.body.style.overflow = "auto"; // Restore window flow
    }
}

// Piyush@1235223