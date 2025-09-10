/**
 * 加賀市議会議員選挙2025 特設サイト
 * メインJavaScriptファイル
 */

// グローバル変数
let candidatesData = [];
let filteredCandidates = [];

// Googleスプレッドシートの公開URL（後で設定）
const SPREADSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/17ticqNQf202Qww_0YdprDHnHdXvLDYCEM-rzh2iuBQc/export?format=csv&gid=1238380915';

// DOM要素の取得
const elements = {
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    candidateGrid: document.getElementById('candidate-grid'),
    candidateTotal: document.getElementById('candidate-total'),
    statusFilter: document.getElementById('status-filter'),
    sortSelect: document.getElementById('sort-select'),
    lastUpdated: document.getElementById('last-updated'),
    navLinks: document.querySelectorAll('.nav-link')
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

/**
 * アプリケーションの初期化
 */
function initializeApp() {
    console.log('加賀市議会選挙サイトを初期化中...');
    
    // データソース設定状況の確認
    checkDataSource();
    
    // ナビゲーションの初期化
    initializeNavigation();
    
    // データの読み込み
    loadCandidateData();
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // フィルターとソートのイベントリスナー
    elements.statusFilter.addEventListener('change', filterAndSortCandidates);
    elements.sortSelect.addEventListener('change', filterAndSortCandidates);
    
    // ナビゲーションのイベントリスナー
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // スムーズスクロールの設定
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * ナビゲーションの初期化
 */
function initializeNavigation() {
    // アクティブなナビゲーションリンクの管理
    const sections = ['candidates', 'policy-comparison', 'voting-info'];
    
    // スクロール位置に基づいてアクティブなセクションを更新
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop - 100;
                if (window.pageYOffset >= sectionTop) {
                    current = sectionId;
                }
            }
        });
        
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * ナビゲーションクリックの処理
 */
function handleNavigation(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // アクティブ状態の更新
        elements.navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    }
}

/**
 * 候補者データの読み込み
 */
async function loadCandidateData() {
    try {
        showLoading(true);
        
        // Googleスプレッドシートからデータを取得
        if (SPREADSHEET_CSV_URL && SPREADSHEET_CSV_URL !== 'YOUR_SPREADSHEET_CSV_URL_HERE') {
            const data = await fetchSpreadsheetData();
            if (data && data.length > 0) {
                candidatesData = data;
            } else {
                // データが取得できない場合はダミーデータを使用
                candidatesData = generateDummyData();
            }
        } else {
            // URLが設定されていない場合はダミーデータを使用
            console.log('スプレッドシートURLが設定されていません。ダミーデータを使用します。');
            candidatesData = generateDummyData();
        }
        
        // データの表示
        filteredCandidates = [...candidatesData];
        displayCandidates();
        updateCandidateCount();
        updateLastUpdated();
        
        showLoading(false);
        
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        // エラーが発生した場合もダミーデータで表示を継続
        candidatesData = generateDummyData();
        filteredCandidates = [...candidatesData];
        displayCandidates();
        updateCandidateCount();
        updateLastUpdated();
        showLoading(false);
    }
}

/**
 * データ読み込みのシミュレーション（開発用）
 */
function simulateDataLoading() {
    return new Promise(resolve => {
        setTimeout(resolve, 1500); // 1.5秒の遅延
    });
}

/**
 * ダミーデータの生成（テスト用）
 */
function generateDummyData() {
    const dummyData = [
        {
            name: '山田 太郎',
            furigana: 'やまだ たろう',
            age: '50代',
            photo: 'https://placehold.co/300x300/EFEFEF/AAAAAA?text=山田太郎',
            occupation: '元市役所職員',
            district: '大聖寺地区',
            party: '無所属',
            status: '現職',
            catchphrase: '市民の声が、次の未来を創る。',
            website: '',
            email: '',
            policies: {
                childcare: 2,
                industry: 1,
                welfare: 2,
                disaster: 1,
                finance: 3,
                digital: 2,
                environment: 2,
                youth: 1
            },
            mainPolicy: '子育て支援の充実と教育環境の整備に最も力を入れたいと考えています。',
            challenges: '人口減少と高齢化が最大の課題です。',
            message: '市民の皆様と共に、住みやすい加賀市を作ります。'
        },
        {
            name: '鈴木 花子',
            furigana: 'すずき はなこ',
            age: '40代',
            photo: 'https://placehold.co/300x300/EFEFEF/AAAAAA?text=鈴木花子',
            occupation: '会社員',
            district: '山中地区',
            party: '無所属',
            status: '新人',
            catchphrase: '子育て世代の声を市政へ！',
            website: '',
            email: '',
            policies: {
                childcare: 1,
                industry: 2,
                welfare: 1,
                disaster: 2,
                finance: 2,
                digital: 1,
                environment: 1,
                youth: 1
            },
            mainPolicy: '働く親への支援と保育環境の充実を最優先に取り組みます。',
            challenges: '子育て支援の不足が深刻な問題だと考えています。',
            message: '子育て世代の代表として、皆様の声を届けます。'
        }
    ];
    
    return dummyData;
}

/**
 * 候補者の表示
 */
function displayCandidates() {
    if (!elements.candidateGrid) return;
    
    elements.candidateGrid.innerHTML = '';
    
    filteredCandidates.forEach((candidate, index) => {
        const candidateCard = createCandidateCard(candidate, index);
        elements.candidateGrid.appendChild(candidateCard);
    });
}

/**
 * 候補者カードの作成
 */
function createCandidateCard(candidate, index) {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const statusClass = candidate.status === '現職' ? 'incumbent' : 'newcomer';
    
    card.innerHTML = `
        <div class="card-image-wrapper">
            <img src="${candidate.photo}" alt="${candidate.name}の顔写真" class="candidate-photo" 
                 onerror="this.src='https://placehold.co/300x300/EFEFEF/AAAAAA?text=候補者'">
        </div>
        <div class="candidate-info">
            <span class="tag ${statusClass}">${candidate.status}</span>
            <h3 class="candidate-name">${candidate.name}</h3>
            <div class="candidate-details">
                ${candidate.age} | ${candidate.occupation}<br>
                ${candidate.district} | ${candidate.party}
            </div>
            <p class="candidate-catchphrase">${candidate.catchphrase}</p>
        </div>
    `;
    
    // クリックイベントの追加
    card.addEventListener('click', () => {
        showCandidateDetail(candidate);
    });
    
    return card;
}

/**
 * 候補者詳細の表示（モーダルまたは別ページ）
 */
function showCandidateDetail(candidate) {
    // TODO: 候補者詳細表示機能の実装
    console.log('候補者詳細:', candidate);
    alert(`${candidate.name}の詳細情報\n\n${candidate.mainPolicy}`);
}

/**
 * フィルターとソートの適用
 */
function filterAndSortCandidates() {
    const statusFilter = elements.statusFilter.value;
    const sortBy = elements.sortSelect.value;
    
    // フィルタリング
    filteredCandidates = candidatesData.filter(candidate => {
        if (statusFilter === 'all') return true;
        return candidate.status === statusFilter;
    });
    
    // ソート
    filteredCandidates.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.furigana.localeCompare(b.furigana, 'ja');
            case 'status':
                if (a.status !== b.status) {
                    return a.status === '現職' ? -1 : 1;
                }
                return a.furigana.localeCompare(b.furigana, 'ja');
            case 'age':
                const ageOrder = ['20代', '30代', '40代', '50代', '60代', '70代以上'];
                return ageOrder.indexOf(a.age) - ageOrder.indexOf(b.age);
            default:
                return 0;
        }
    });
    
    displayCandidates();
    updateCandidateCount();
}

/**
 * 候補者数の更新
 */
function updateCandidateCount() {
    if (elements.candidateTotal) {
        elements.candidateTotal.textContent = filteredCandidates.length;
    }
}

/**
 * 最終更新日時の更新
 */
function updateLastUpdated() {
    if (elements.lastUpdated) {
        const now = new Date();
        const formatted = now.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        elements.lastUpdated.textContent = formatted;
    }
}

/**
 * ローディング表示の制御
 */
function showLoading(show) {
    if (elements.loading) {
        elements.loading.style.display = show ? 'flex' : 'none';
    }
    if (elements.candidateGrid) {
        elements.candidateGrid.style.display = show ? 'none' : 'grid';
    }
}

/**
 * エラー表示
 */
function showError() {
    showLoading(false);
    if (elements.errorMessage) {
        elements.errorMessage.style.display = 'flex';
    }
    if (elements.candidateGrid) {
        elements.candidateGrid.style.display = 'none';
    }
}

/**
 * CSVデータの解析
 */
function parseCSVData(csvText) {
    try {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            console.warn('CSVデータが不正です');
            return [];
        }
        
        // ヘッダー行を取得
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        console.log('CSVヘッダー:', headers);
        
        const candidates = [];
        
        // データ行を処理
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length < headers.length) continue;
            
            const candidate = {};
            headers.forEach((header, index) => {
                candidate[header] = values[index] || '';
            });
            
            // データの正規化と変換
            const normalizedCandidate = normalizeCandidateData(candidate);
            if (normalizedCandidate.name) {
                candidates.push(normalizedCandidate);
            }
        }
        
        console.log(`${candidates.length}名の候補者データを解析しました`);
        return candidates;
        
    } catch (error) {
        console.error('CSV解析エラー:', error);
        return [];
    }
}

/**
 * CSV行の解析（カンマ区切り、クォート対応）
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

/**
 * 候補者データの正規化
 */
function normalizeCandidateData(rawData) {
    // Googleフォームの回答列名に基づいてデータをマッピング
    const candidate = {
        name: rawData['氏名'] || rawData['お名前をご記入ください'] || '',
        furigana: rawData['ふりがな'] || rawData['お名前のふりがなをご記入ください'] || '',
        age: rawData['年齢'] || rawData['年齢をお選びください'] || '',
        photo: rawData['顔写真'] || rawData['顔写真をアップロードしてください'] || 'https://placehold.co/300x300/EFEFEF/AAAAAA?text=候補者',
        occupation: rawData['職業・経歴'] || rawData['現在の職業・主な経歴をご記入ください（100文字以内）'] || '',
        district: rawData['居住地区'] || rawData['お住まいの地区をお選びください'] || '',
        party: rawData['所属政党'] || rawData['所属政党をご記入ください（無所属の場合は「無所属」とご記入ください）'] || '無所属',
        status: rawData['現職/新人'] || rawData['現職・新人の別をお選びください'] || '新人',
        catchphrase: rawData['キャッチフレーズ'] || rawData['キャッチフレーズをご記入ください（50文字以内）'] || '',
        website: rawData['公式サイト・SNSのURL'] || rawData['公式サイトやSNSのURLがございましたらご記入ください'] || '',
        email: rawData['連絡先メールアドレス'] || rawData['連絡先メールアドレス（任意）'] || '',
        
        // 政策スタンス（5段階評価を数値に変換）
        policies: {
            childcare: convertPolicyStance(rawData['子育て支援・教育予算の拡充について、どのようにお考えですか？']),
            industry: convertPolicyStance(rawData['地域産業（伝統工芸・観光業）の振興について、どのようにお考えですか？']),
            welfare: convertPolicyStance(rawData['高齢者福祉・医療制度の充実について、どのようにお考えですか？']),
            disaster: convertPolicyStance(rawData['防災・減災対策の強化について、どのようにお考えですか？']),
            finance: convertPolicyStance(rawData['市の財政健全化について、どのようにお考えですか？']),
            digital: convertPolicyStance(rawData['デジタル化・DX推進について、どのようにお考えですか？']),
            environment: convertPolicyStance(rawData['環境保護・脱炭素社会の実現について、どのようにお考えですか？']),
            youth: convertPolicyStance(rawData['若者の定住促進・人口減少対策について、どのようにお考えですか？'])
        },
        
        // 自由記述
        mainPolicy: rawData['最も力を入れたい政策とその理由を教えてください（500文字以内）'] || '',
        challenges: rawData['加賀市が抱える最も重要な課題は何だと考えますか？その解決策も含めてお聞かせください（500文字以内）'] || '',
        message: rawData['有権者の皆様に伝えたいメッセージをお聞かせください（300文字以内）'] || ''
    };
    
    return candidate;
}

/**
 * 政策スタンスの文字列を数値に変換
 */
function convertPolicyStance(stanceText) {
    if (!stanceText) return 3; // デフォルトは中立
    
    const text = stanceText.toLowerCase();
    if (text.includes('大いに推進') || text.includes('1.')) return 1;
    if (text.includes('やや推進') || text.includes('2.')) return 2;
    if (text.includes('どちらとも') || text.includes('3.')) return 3;
    if (text.includes('あまり推進') || text.includes('4.')) return 4;
    if (text.includes('推進すべきではない') || text.includes('5.')) return 5;
    
    return 3; // デフォルトは中立
}

/**
 * Googleスプレッドシートからのデータ取得
 */
async function fetchSpreadsheetData() {
    try {
        console.log('スプレッドシートからデータを取得中...');
        
        // CORS対応のためのプロキシを使用する場合のURL変換
        let fetchUrl = SPREADSHEET_CSV_URL;
        
        // Googleスプレッドシートの公開URLの場合、CSV形式に変換
        if (fetchUrl.includes('docs.google.com/spreadsheets')) {
            // 既にCSV形式のURLかチェック
            if (!fetchUrl.includes('output=csv')) {
                // スプレッドシートIDを抽出してCSV形式のURLに変換
                const match = fetchUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                if (match) {
                    const spreadsheetId = match[1];
                    fetchUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
                }
            }
        }
        
        console.log('取得URL:', fetchUrl);
        
        // データを取得
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/csv,text/plain,*/*'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log('CSVデータを取得しました:', csvText.substring(0, 200) + '...');
        
        // CSVデータを解析
        const candidates = parseCSVData(csvText);
        
        if (candidates.length === 0) {
            console.warn('有効な候補者データが見つかりませんでした');
            return null;
        }
        
        console.log(`${candidates.length}名の候補者データを正常に取得しました`);
        return candidates;
        
    } catch (error) {
        console.error('スプレッドシートデータ取得エラー:', error);
        
        // CORS エラーの場合の対処法をコンソールに表示
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
            console.warn(`
CORS エラーが発生しました。以下の対処法をお試しください：

1. スプレッドシートが「ウェブに公開」されていることを確認
2. 公開設定で「カンマ区切り値(.csv)」形式を選択
3. 公開URLが正しく設定されていることを確認

現在のURL: ${SPREADSHEET_CSV_URL}
            `);
        }
        
        return null;
    }
}

/**
 * スプレッドシートURL設定のヘルパー関数
 */
function setSpreadsheetUrl(url) {
    // グローバル変数を更新（実際の運用では設定ファイルや環境変数を使用）
    window.SPREADSHEET_CSV_URL = url;
    console.log('スプレッドシートURLを更新しました:', url);
}

/**
 * データ取得状況の確認
 */
function checkDataSource() {
    if (SPREADSHEET_CSV_URL === 'YOUR_SPREADSHEET_CSV_URL_HERE') {
        console.log(`
データソース設定状況:
- スプレッドシートURL: 未設定（ダミーデータを使用中）
- 設定方法: js/main.js の SPREADSHEET_CSV_URL を更新してください

設定例:
const SPREADSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0';
        `);
    } else {
        console.log(`
データソース設定状況:
- スプレッドシートURL: 設定済み
- URL: ${SPREADSHEET_CSV_URL}
- 状態: 接続試行中...
        `);
    }
}

