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
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("ログが保存されました:", data);
    })
    .catch((error) => {
      console.error("エラーが発生しました:", error);
    });
}

// 使用例
logActionToSheet("ユーザー名", "user@example.com", "Login");
