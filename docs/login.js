// 必要な設定
const SHEET_ID = 'あなたのスプレッドシートID'; // 例: 1ABCdEfGhIJK...
const SHEET_NAME = '出席表'; // シート名（タブの名前）

// OAuthクライアントID（Google Cloud Console から取得）
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
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
    } catch (error) {
        console.error('書き込みエラー:', error);
    }
}
