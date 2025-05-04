// 必要な設定
const SHEET_ID = '1W61LsGM7uS9RwKgI5KFJ4reulIC0s5aNvb2QLDOo4KA'; // 例: 1ABCdEfGhIJK...
const SHEET_NAME = 'シート1'; // シート名（タブの名前）

// OAuthクライアントID（Google Cloud Console から取得）
const CLIENT_ID = '775352245980-g6dm3nv0pcpn9q1ga0s0c03r755669gb.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;

// Google API 初期化
async function gapiInit() {
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: 'AIzaSyB_-I2BgPAhXK6Tv4UE4HkMvIV7u3XGK5U',
                discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            });

            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                callback: '', // 後で設定
            });

            resolve();
        });
    });
}


// 認証＆書き込み処理
async function writeToSheet(date, name, attendance) {
    // トークンがまだ取得されていなければログイン要求
    await gapiInit(); // ←追加
    if (!gapi.client.getToken()) {
        tokenClient.callback = async (tokenResponse) => {
            if (tokenResponse.error) {
                console.error('認証エラー:', tokenResponse);
                return;
            }
            console.log('認証成功');
            // DriveAppの操作は削除
            await writeToSheet(date, name, attendance); // 再実行
        };
    
        tokenClient.requestAccessToken();
        return;
    }
    const values = [[date, name, attendance]];

    const body = {
        values: values,
    };

    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A1`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: body,
        });

        console.log('スプレッドシートに書き込みました:', response);
        showCalendar(year, month);
        showAttendanceOnCalendar();
    } catch (error) {
        console.error('書き込みエラー:', error);
    }
}



async function fetchAttendanceData() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A:C`,
        });

        const rows = response.result.values;
        const attendanceMap = new Map();

        if (rows && rows.length > 0) {
            rows.slice(1).forEach(([date, name, status]) => {
                const paddedDate = formatDate(date);
                if (!attendanceMap.has(paddedDate)) {
                    attendanceMap.set(paddedDate, []);
                }
                attendanceMap.get(paddedDate).push({ name, status });
            });
        }
        console.log('スプレッドシートを読み込みました:', attendanceMap);
        return attendanceMap;
    } catch (error) {
        console.error('スプレッドシートからの読み込みに失敗しました:', error);
        return new Map();
    }
}

async function showAttendanceOnCalendar() {
    const attendanceData = await fetchAttendanceData();
    const allDateElements = document.querySelectorAll('[data-date]');

    for (const [date, entries] of attendanceData.entries()) {
        const dateElement = document.querySelector(`[data-date="${date}"]`);
        if (!dateElement) {
            console.warn(`⚠️ No matching dateElement for ${date}`);
            continue;
        }

        const statusCount = {
            参加: [],
            欠席: []
        };
        entries.forEach(entry => {
            const status = entry.status?.trim(); // 空白除去
            if (status === "参加") {
                statusCount.参加.push(entry.name);
                console.log(`日付 ${date} に ${status} を追加します`);
            } else if (status === "欠席") {
                statusCount.欠席.push(entry.name);
                console.log(`日付 ${date} に ${status} を追加します`);
            }
        });
        if (statusCount.参加.length > 0) {
            const redCircle = document.createElement("div");
            redCircle.classList.add("circle", "red");
            redCircle.textContent = `参加${statusCount.参加.length}`;
            redCircle.title = `参加者: ${statusCount.参加.join(', ')}`;
            dateElement.appendChild(redCircle);

        }

        if (statusCount.欠席.length > 0) {
            const blueCircle = document.createElement("div");
            blueCircle.classList.add("circle", "blue");
            blueCircle.textContent = `欠席${statusCount.欠席.length}`;
            blueCircle.title = `欠席者: ${statusCount.欠席.join(', ')}`;
            dateElement.appendChild(blueCircle);

        }
    }
    const selectedCell = document.querySelector(".calendar_td.selected");
if (selectedCell) {
    const clickedDateStr = selectedCell.getAttribute("data-date");
    const selectedAttendance = attendanceData.get(clickedDateStr) || [];

    const participants = selectedAttendance
        .filter(entry => entry.status === "参加")
        .map(entry => entry.name);
    const absentees = selectedAttendance
        .filter(entry => entry.status === "欠席")
        .map(entry => entry.name);

    document.getElementById("participants").textContent = participants.join(", ") || "なし";
    document.getElementById("absentees").textContent = absentees.join(", ") || "なし";
}
}

// function padDate(dateStr) {
//     const [year, month, day] = dateStr.split('/').map(Number);
//     if (!year || !month || !day) return null; // NaN防止
//     return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
// }

function formatDate(input) {
    const date = new Date(input);
    if (isNaN(date)) return input; // 無効な日付なら元のまま返す

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-indexed
    const day = date.getDate();

    return `${year}/${month}/${day}`; // ←ゼロ埋めなし
}

