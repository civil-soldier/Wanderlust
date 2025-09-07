let taxSwitch = document.getElementById('switchCheckDefault');

taxSwitch.addEventListener("click", () => {
  let priceElements = document.querySelectorAll(".price");

  if (taxSwitch.checked) {
    // Show GST prices
    priceElements.forEach((el) => {
      let basePrice = parseFloat(el.getAttribute("data-base"));
      let finalPrice = basePrice * 1.18; // add 18%
      el.innerHTML = "₹" + finalPrice.toLocaleString("en-IN");
    });
  } else {
    // Show base prices again
    priceElements.forEach((el) => {
      let basePrice = parseFloat(el.getAttribute("data-base"));
      el.innerHTML = "₹" + basePrice.toLocaleString("en-IN");
    });
  }
});
