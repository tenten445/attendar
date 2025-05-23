const weeks = ['日', '月', '火', '水', '木', '金', '土'];
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;

const config = {
    show: 1,
};

const holidays = new Map([
    ['2025/1/1', '元日'],
    ['2025/1/13', '成人の日'],
    ['2025/2/11', '建国記念の日'],
    ['2025/2/23', '天皇誕生日'],
    ['2025/3/20', '春分の日'],
    ['2025/4/29', '昭和の日2'],
    ['2025/5/3', '憲法記念日'],
    ['2025/5/4', 'みどりの日'],
    ['2025/5/5', 'こどもの日'],
    ['2025/7/21', '海の日'],
    ['2025/8/11', '山の日'],
    ['2025/9/15', '敬老の日'],
    ['2025/9/23', '秋分の日'],
    ['2025/10/13', 'スポーツの日'],
    ['2025/11/3', '文化の日'],
    ['2025/11/23', '勤労感謝の日'],
]);

function showCalendar(year, month) {
    const calendarContainer = document.querySelector('#calendar');
    calendarContainer.innerHTML = '';
    for (let i = 0; i < config.show; i++) {
        const calendarHtml = createCalendar(year, month);
        const sec = document.createElement('section');
        sec.innerHTML = calendarHtml;
        document.querySelector('#calendar').appendChild(sec);

        month++;
        if (month > 12) {
            year++;
            month = 1;
        }
    }
    highlightToday(); // カレンダー表示後に今日をハイライト
}

function highlightToday() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

    const todayCell = document.querySelector(`td[data-date="${todayStr}"]`);
    if (todayCell) {
        todayCell.classList.add('today', 'selected'); // 'selected' を追加
    }
}

function createCalendar(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const endDayCount = endDate.getDate();
    const startDay = startDate.getDay();
    const today = new Date();
    const todayStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

    let dayCount = 1;
    let calendarHtml = '';

    calendarHtml += `<h1>${year}年 ${month}月</h1>`;
    calendarHtml += '<table><thead><tr>';

    for (let w of weeks) {
        calendarHtml += `<th>${w}</th>`;
    }

    calendarHtml += '</tr></thead><tbody>';

    for (let w = 0; w < 6; w++) {
        calendarHtml += '<tr>';

        for (let d = 0; d < 7; d++) {
            if (w === 0 && d < startDay) {
                calendarHtml += '<td class="is-disabled"></td>';
            } else if (dayCount > endDayCount) {
                calendarHtml += '<td class="is-disabled"></td>';
            } else {
                const calendarDateStr = `${year}/${month}/${dayCount}`;  // 名前変更
                const isHoliday = holidays.has(calendarDateStr);
                const holidayName = holidays.get(calendarDateStr);
                let classes = "calendar_td";

                if (isHoliday) classes += " holiday";
                if (calendarDateStr === todayStr) classes += " today";

                calendarHtml += `<td class="${classes}" data-date="${calendarDateStr}">
                    <div class="day-number">${dayCount}</div>
                    ${holidayName ? `<small>${holidayName}</small>` : ""}
                </td>`;
                dayCount++;
            }
        }

        calendarHtml += '</tr>';
    }

    calendarHtml += '</tbody></table>';

    // ラジオボタン（初期状態は未回答にチェック）
    calendarHtml += `
    <div class="attendance-check">
      <label><input type="radio" name="attendance" value="参加">参加</label>
      <label><input type="radio" name="attendance" value="欠席">欠席</label>
      <label><input type="radio" name="attendance" value="未回答" checked>未回答</label>
    </div>
    `;

    return calendarHtml;
}

function moveCalendar(e) {
    document.querySelector('#calendar').innerHTML = '';

    if (e.target.id === 'prev') {
        month--;
        if (month < 1) {
            year--;
            month = 12;
        }
    }

    if (e.target.id === 'next') {
        month++;
        if (month > 12) {
            year++;
            month = 1;
        }
    }

    showCalendar(year, month);
    showAttendanceOnCalendar();
}

// 前月・次月ボタンのイベント
document.querySelector('#prev').addEventListener('click', moveCalendar);
document.querySelector('#next').addEventListener('click', moveCalendar);

// 日付クリックで「選択」できるように
document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("calendar_td")) {

        const clickedDateStr = e.target.getAttribute('data-date');  // 名前変更
        const attendanceData = await fetchAttendanceData();
        
        const selectedAttendance = attendanceData.get(clickedDateStr) || [];

        const filtered = Array.from(attendanceData.values()).flat().filter(entry => entry.date === clickedDateStr);
        const participants = selectedAttendance
        .filter(entry => entry.status === "参加")
        .map(entry => entry.name);
    const absentees = selectedAttendance
        .filter(entry => entry.status === "欠席")
        .map(entry => entry.name);
        
        document.getElementById("participants").textContent = participants.join(", ") || "なし";
        document.getElementById("absentees").textContent = absentees.join(", ") || "なし";
        // すべてのセルから 'selected' を削除
        document.querySelectorAll(".calendar_td").forEach(td => {
            td.classList.remove("selected");
        });

        // クリックされたセルに 'selected' を追加
        e.target.classList.add("selected");
        // 出欠取得
        //const selectedAttendance = document.querySelector('input[name="attendance"]:checked')?.value;
        
        // ユーザー名取得（ログイン時に localStorage に保存してあると仮定）
        // const userName = localStorage.getItem('userName');
        // if (!userName) {
        //     alert("ログインしていません。");
        //     return;
        // }

        // 書き込み処理を呼び出し
        // if (selectedAttendance !== "未回答") {
        //     writeToSheet(clickedDateStr, userName, selectedAttendance);
        // }

        // ラジオボタンの状態を更新
        const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
        if (e.target.classList.contains("attendance-participate")) {
            // 参加が設定されている場合
            attendanceRadios.forEach(radio => {
                radio.checked = radio.value === "参加";
            });
        } else if (e.target.classList.contains("attendance-absent")) {
            // 欠席が設定されている場合
            attendanceRadios.forEach(radio => {
                radio.checked = radio.value === "欠席";
            });
        } else {
            // どちらでもない場合は未回答にリセット
            attendanceRadios.forEach(radio => {
                radio.checked = radio.value === "未回答";
            });
        }
    }
    if (e.target.name === "attendance") {
        const selectedCell = document.querySelector(".calendar_td.selected");

        if (selectedCell) {
            // 既存のクラスを削除
            selectedCell.classList.remove("attendance-participate", "attendance-absent");


            const statusCount = {
                参加: [],
                欠席: []
            };


            // ラジオボタンの値に応じてクラスを追加
            // if (e.target.value === "参加") {
            // } else if (e.target.value === "欠席") {

            // }


            const clickedDateStr = selectedCell.getAttribute("data-date");
            const selectedAttendance = e.target.value;
            const userName = localStorage.getItem("userName");

            if (!userName) {
                alert("ログインしていません。");
                return;
            }
            if (selectedAttendance !== "未回答") {
                writeToSheet(clickedDateStr, userName, selectedAttendance);
                
            }
        }
    }
});

// 最初に表示

document.addEventListener("DOMContentLoaded", async function () {
    await gapiInit(); // ← Sheets API の初期化

    showCalendar(year, month);
    await showAttendanceOnCalendar();

    //showCalendar(year, month);
});

