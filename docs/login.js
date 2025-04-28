const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3UPc62uqGAglmajJz77JI5m1idzJ66-07BKyurL2P2tJzbqDzywhMGc2-HLwnMpbD3w/exec";

function logActionToSheet(name, email, action) {
  const data = {
    name: name,
    email: email,
    action: action,
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.result === "success") {
        console.log("データが正常にスプレッドシートに追加されました:", data);
      } else {
        console.error("エラーが発生しました:", data.message);
      }
    })
    .catch((error) => {
      console.error("リクエストエラー:", error);
    });
}

// 使用例
logActionToSheet("植田天", "g04045@ktc.ac.jp", "Login");
