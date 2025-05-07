function onEdit(e) {
  const sheet = e.source.getActiveSheet(); // 現在編集されているシート
  const range = e.range; // 編集された範囲
  const oldValue = e.oldValue; // 編集前の値
  const newValue = e.value; // 編集後の値
  const originalSheetName = "シート1"; // 元のシート名をここに入力
  const allowedEmail = "g04045@ktc.ac.jp"; // 自分のメールアドレスを指定
  const editorEmail = Session.getActiveUser().getEmail(); // 現在の編集者のメールアドレス

  
  // 手動編集された場合のみ元に戻す
  // if (newValue !== oldValue) {
  //   SpreadsheetApp.getActiveSpreadsheet().toast("手動で編集されたため、元の値に戻します。", "注意", 5);
  //   range.setValue(oldValue); // 元の値に戻す
  // }

  // 自分以外が編集した場合、元の値に戻す
  if (editorEmail !== allowedEmail) {
    SpreadsheetApp.getActiveSpreadsheet().toast("このセルは編集できません。元の値に戻します。", "警告", 5);
    range.setValue(oldValue); // 元の値に戻す
  }
  // シート名が変更された場合、元に戻す
  if (sheet.getName() !== originalSheetName) {
    sheet.setName(originalSheetName);
    SpreadsheetApp.getActiveSpreadsheet().toast("シート名を変更することはできません！", "注意", 5);
  }
}


function protectFileName() {
  const file = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId());
  file.setName("部活_ログインログ"); // 固定したいファイル名を指定
}

function cleanUpAttendance() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート1");
  const data = sheet.getDataRange().getValues();
  
  const header = data[0];
  const rows = data.slice(1); // ヘッダーを除く
  const recordMap = new Map();

  // 最後に出てきたデータを残すようにMapを上書き
  rows.forEach((row, index) => {
    const [date, name, status] = row.map(v => String(v).trim());
    const key = `${date}__${name}`; // 日付＋名前だけで比較
    const fullKey = `${date}__${name}__${status}`; // 完全一致チェック用

    // 最新データとして記録（rowNumはデータ上の行番号）
    recordMap.set(key, { rowNum: index + 2, date, name, status }); // +2はスプレッドシート上の行番号（1ベース）
  });

  // 完全重複排除用にもう1つセット
  const uniqueFullKeys = new Set();
  const finalRowsToKeep = new Map();

  // 再度走査し、最新かつ重複でないものを残す
  [...recordMap.values()].reverse().forEach(record => {
    const fullKey = `${record.date}__${record.name}__${record.status}`;
    if (!uniqueFullKeys.has(fullKey)) {
      uniqueFullKeys.add(fullKey);
      finalRowsToKeep.set(record.rowNum, true);
    }
  });

  // 削除対象行を収集
  const rowsToDelete = [];
  for (let i = 1; i <= rows.length; i++) {
    const rowNum = i + 1; // 実際の行番号
    if (!finalRowsToKeep.has(rowNum)) {
      rowsToDelete.push(rowNum);
    }
  }

  // 下から順に削除
  rowsToDelete.reverse().forEach(rowNum => {
    sheet.deleteRow(rowNum);
  });

  Logger.log(`${rowsToDelete.length} 行を削除しました。`);
}



