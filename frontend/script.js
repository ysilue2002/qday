// LOGIN SANS COMPTE
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const pseudo = document.getElementById("pseudo").value.trim();
    const error = document.getElementById("loginError");

    if (!pseudo) {
      error.textContent = t('required_field'); // Traduction
      return;
    }

    // Stocker le pseudo localement
    localStorage.setItem("pseudo", pseudo);

    // Rediriger directement vers la page question
    window.location.href = "question.html";
  });
}
