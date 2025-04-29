// 必要な設定
const SHEET_ID = '1W61LsGM7uS9RwKgI5KFJ4reulIC0s5aNvb2QLDOo4KA'; // スプレッドシートID
const SHEET_NAME = 'シート1'; // シート名（タブの名前）

// OAuthクライアントID（Google Cloud Console から取得）
const CLIENT_ID = '775352245980-g6dm3nv0pcpn9q1ga0s0c03r755669gb.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;

// Google API 初期化
function gapiInit() {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: '', // APIキーは必要ない場合あり
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        });

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
                if (tokenResponse.error) {
                    console.error(tokenResponse);
                    return;
                }
                console.log('認証成功');
            },
        });
    });
}

// 認証＆書き込み処理
async function writeToSheet(date, name, attendance) {
    // トークンがまだ取得されていなければログイン要求
    if (!gapi.client.getToken()) {
        tokenClient.callback = async (tokenResponse) => {
            if (tokenResponse.error) {
                console.error('認証エラー:', tokenResponse);
                return;
            }
            console.log('認証成功');
            await writeToSheet(date, name, attendance); // 再実行
        };
        tokenClient.requestAccessToken();  // 認証要求
        return;
    }

    const values = [[date, name, attendance]]; // 出欠情報を準備

    const body = {
        values: values,
    };

    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A1`, // A1から書き込む
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: body,
        });

        console.log('スプレッドシートに書き込みました:', response);
    } catch (error) {
        console.error('書き込みエラー:', error);
    }
}
