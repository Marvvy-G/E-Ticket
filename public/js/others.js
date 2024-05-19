document.querySelectorAll(".show-popup").forEach(function(button) {
    button.addEventListener("click", function() {
        this.nextElementSibling.classList.add("active");
    });
});

document.querySelectorAll(".popup .close-btn").forEach(function(button) {
    button.addEventListener("click", function() {
        this.parentElement.classList.remove("active");
    });
});



