// Buy Now Buttons
let buttons = document.querySelectorAll(".card button");
let count = 0;

buttons.forEach(function (button) {

    button.addEventListener("click", function () {

        count++;

        document.getElementById("cartCount").innerHTML = count;

        alert("Product Added Successfully!");

    });

});


// Search Box
let search = document.querySelector("header input");

search.addEventListener("keyup", function () {
    let value = search.value.toLowerCase();
    let cards = document.querySelectorAll(".card");

    cards.forEach(function (card) {
        let name = card.querySelector("h3").textContent.toLowerCase();

        if (name.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

// Dark Mode
function darkMode() {

    document.body.classList.toggle("dark");


}
// Contact Form
let form = document.querySelector("#contact form");

form.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Message Sent Successfully!");
    form.reset();
});
