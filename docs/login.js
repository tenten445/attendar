const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhLWwtfEnEFXSKFbMrAntr-acRfmPznMT9Ic2ZH9BFWWICbtPKcsQp9hje25idar6v_Q/exec"; // GASのウェブアプリURLをここに貼り付け

function logActionToSheet(name, email, action) {
  const data = {
    name: name,
    email: email,
    action: action,
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("ログが保存されました:", data);
    })
    .catch((error) => {
      console.error("エラーが発生しました:", error);
    });
}

// Googleログインのコールバック関数でログ記録
window.handleCredentialResponse = function (response) {
  const user = parseJwt(response.credential);
  logActionToSheet(user.name, user.email, "Login"); // ログイン情報をスプレッドシートに保存
  showCalendarForUser(user);
};

// ログアウト時にログ記録
document.getElementById("logout-btn").addEventListener("click", function () {
  const jwtToken = localStorage.getItem("jwtToken");
  if (jwtToken) {
    const user = parseJwt(jwtToken);
    logActionToSheet(user.name, user.email, "Logout"); // ログアウト情報をスプレッドシートに保存
  }
  localStorage.removeItem("jwtToken");
  document.getElementById("calendar-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";
});
