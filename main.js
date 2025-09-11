/**
 * 加賀市議会議員選挙2025 特設サイト
 * メインJavaScriptファイル
 */

// グローバル変数
let candidatesData = [];
let filteredCandidates = [];

// Googleスプレッドシートの公開URL（変更可能）
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('加賀市議会選挙サイトを初期化中...');
    initializeApp();
    setupEventListeners();
});

/**
 * アプリケーションの初期化
 */
function initializeApp() {
    console.log(`
データソース設定状況:
- スプレッドシートURL: 設定済み
- URL: ${SPREADSHEET_CSV_URL}
- 状態: 接続試行中...
        `);
    
    loadCandidateData();
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // フィルターとソートのイベント
    elements.statusFilter.addEventListener('change', filterAndSortCandidates);
    elements.sortSelect.addEventListener('change', filterAndSortCandidates);
    
    // 再読み込みボタン
    const reloadButton = document.getElementById('reload-button');
    if (reloadButton) {
        reloadButton.addEventListener('click', loadCandidateData);
    }
    
    // ナビゲーションのスムーズスクロール
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * 候補者データの読み込み
 */
async function loadCandidateData() {
    try {
        showLoading();
        hideError();
        
        // 実際のGoogle Sheetsからデータを取得
        console.log('Google Sheetsからデータを読み込み中...');
        const candidates = await fetchSpreadsheetData();
        
        if (candidates && candidates.length > 0) {
            console.log(`${candidates.length}名の候補者データを読み込みました`);
            candidatesData = candidates;
            filteredCandidates = [...candidates];
            displayCandidates();
            updateCandidateCount(candidates.length);
            hideLoading();
            updateLastUpdated();
            generatePolicyComparisonTable();
        } else {
            console.log('Google Sheetsからデータが取得できませんでした。ダミーデータを使用します。');
            // フォールバックとしてダミーデータを使用
            const dummyData = getDummyData();
            candidatesData = dummyData;
            filteredCandidates = [...dummyData];
            displayCandidates();
            updateCandidateCount(dummyData.length);
            hideLoading();
            updateLastUpdated();
            generatePolicyComparisonTable();
        }
    } catch (error) {
        console.error('候補者データの読み込みエラー:', error);
        console.log('エラーが発生しました。ダミーデータを使用します。');
        
        // エラー時はダミーデータを使用
        const dummyData = getDummyData();
        candidatesData = dummyData;
        filteredCandidates = [...dummyData];
        displayCandidates();
        updateCandidateCount(dummyData.length);
        hideLoading();
        updateLastUpdated();
        generatePolicyComparisonTable();
    }
}

/**
 * テスト用ダミーデータ
 */
function getDummyData() {
    return [
        {
            name: '田中 太郎',
            age: '40代',
            status: '現職',
            occupation: '元市役所職員、NPO法人代表',
            district: '加賀温泉駅周辺',
            party: '無所属',
            catchphrase: '市民の声を市政に',
            photo: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=田中太郎',
            policies: {
                '子育て支援の充実': '積極的に推進',
                '高齢者福祉の向上': '賛成',
                '観光振興': '積極的に推進',
                '教育環境の整備': '賛成',
                '防災対策の強化': '積極的に推進'
            }
        },
        {
            name: '佐藤 花子',
            age: '30代',
            status: '新人',
            occupation: '弁護士、市民活動家',
            district: '山中温泉地区',
            party: '無所属',
            catchphrase: '若い力で加賀を変える',
            photo: 'https://placehold.co/300x300/E94B3C/FFFFFF?text=佐藤花子',
            policies: {
                '子育て支援の充実': '積極的に推進',
                '高齢者福祉の向上': '賛成',
                '観光振興': '賛成',
                '教育環境の整備': '積極的に推進',
                '防災対策の強化': '賛成'
            }
        },
        {
            name: '山田 次郎',
            age: '50代',
            status: '現職',
            occupation: '農業従事者、JA理事',
            district: '大聖寺地区',
            party: '無所属',
            catchphrase: '農業と観光の両立',
            photo: 'https://placehold.co/300x300/50C878/FFFFFF?text=山田次郎',
            policies: {
                '子育て支援の充実': '賛成',
                '高齢者福祉の向上': '積極的に推進',
                '観光振興': '積極的に推進',
                '教育環境の整備': '賛成',
                '防災対策の強化': '積極的に推進'
            }
        },
        {
            name: '鈴木 美咲',
            age: '20代',
            status: '新人',
            occupation: '小学校教諭、教育コンサルタント',
            district: '片山津温泉地区',
            party: '無所属',
            catchphrase: '教育で未来を創る',
            photo: 'https://placehold.co/300x300/9B59B6/FFFFFF?text=鈴木美咲',
            policies: {
                '子育て支援の充実': '積極的に推進',
                '高齢者福祉の向上': '賛成',
                '観光振興': '賛成',
                '教育環境の整備': '積極的に推進',
                '防災対策の強化': '賛成'
            }
        },
        {
            name: '高橋 健一',
            age: '60代',
            status: '現職',
            occupation: '建設会社経営、商工会議所会頭',
            district: '加賀市中央',
            party: '無所属',
            catchphrase: '経験と実績で安心の市政',
            photo: 'https://placehold.co/300x300/F39C12/FFFFFF?text=高橋健一',
            policies: {
                '子育て支援の充実': '賛成',
                '高齢者福祉の向上': '積極的に推進',
                '観光振興': '積極的に推進',
                '教育環境の整備': '賛成',
                '防災対策の強化': '積極的に推進'
            }
        },
        {
            name: '伊藤 恵子',
            age: '40代',
            status: '新人',
            occupation: 'デザイナー、文化活動推進',
            district: '動橋地区',
            party: '無所属',
            catchphrase: '文化と芸術で豊かな街づくり',
            photo: 'https://placehold.co/300x300/1ABC9C/FFFFFF?text=伊藤恵子',
            policies: {
                '子育て支援の充実': '積極的に推進',
                '高齢者福祉の向上': '賛成',
                '観光振興': '積極的に推進',
                '教育環境の整備': '積極的に推進',
                '防災対策の強化': '賛成'
            }
        }
    ];
}

/**
 * スプレッドシートからデータを取得
 */
async function fetchSpreadsheetData() {
    console.log('スプレッドシートからデータを取得中...');
    console.log('取得URL:', SPREADSHEET_CSV_URL);
    
    try {
        const response = await fetch(SPREADSHEET_CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSVデータを取得しました:', csvText.substring(0, 200) + '...');
        
        const candidates = parseCSVData(csvText);
        console.log(`${candidates.length}名の候補者データを正常に取得しました`);
        
        return candidates;
    } catch (error) {
        console.error('スプレッドシートデータ取得エラー:', error);
        throw error;
    }
}

/**
 * CSVデータの解析
 */
function parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSVデータが不正です');
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('CSVヘッダー:', headers);
    
    const candidates = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length - 1) {
            const candidate = createCandidateObject(headers, values);
            if (candidate.name && candidate.name.trim()) {
                candidates.push(candidate);
            }
        }
    }
    
    console.log(`${candidates.length}名の候補者データを解析しました`);
    return candidates;
}

/**
 * CSV行の解析（カンマ区切り、引用符対応）
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
 * 候補者オブジェクトの作成
 */
function createCandidateObject(headers, values) {
    const candidate = {};
    
    // 基本情報のマッピング
    const fieldMapping = {
        'Timestamp': 'timestamp',
        '氏名': 'name',
        'ふりがな': 'furigana',
        '年代': 'age',
        '顔写真について': 'photo',
        '職業・経歴': 'occupation',
        '居住地区': 'district',
        '所属政党・会派': 'party',
        '立候補区分': 'status',
        'キャッチフレーズ・スローガン': 'catchphrase',
        '公式サイト・SNSのURL': 'website',
        '連絡先メールアドレス': 'email',
        '最も重視する政策・公約': 'mainPolicy',
        '加賀市政への想い・ビジョン': 'vision',
        '有権者へのメッセージ': 'message'
    };
    
    // 基本フィールドの設定
    headers.forEach((header, index) => {
        const field = fieldMapping[header];
        if (field && values[index]) {
            candidate[field] = values[index];
        }
    });
    
    // 政策スタンスの設定
    candidate.policies = {};
    
    // 政策項目のマッピング（実際のフォームの項目名に対応）
    const policyMapping = {
        '政策1: 子育て支援・教育予算の拡充について': '子育て支援の充実',
        '政策2: 地域産業（伝統工芸・観光業）の振興について': '観光振興',
        '政策3: 高齢者福祉・医療制度の充実について': '高齢者福祉の向上',
        '政策4: 防災・減災対策の強化について': '防災対策の強化',
        '政策5: 市の財政健全化について': '財政健全化',
        '政策6: デジタル化・DX推進について': 'デジタル化推進',
        '政策7: 環境保護・脱炭素社会の実現について': '環境保護',
        '政策8: 若者の定住促進・人口減少対策について': '人口減少対策'
    };
    
    // 政策スタンスの値のマッピング
    const stanceMapping = {
        '積極的に推進すべき': '積極的に推進',
        'ある程度推進すべき': '賛成',
        '現状維持が適切': '中立',
        '慎重に検討すべき': '慎重',
        '優先度は低い': '反対'
    };
    
    headers.forEach((header, index) => {
        const mappedPolicy = policyMapping[header];
        if (mappedPolicy && values[index]) {
            const mappedStance = stanceMapping[values[index]] || values[index];
            candidate.policies[mappedPolicy] = mappedStance;
        }
    });
    
    // サイトで使用する政策項目のデフォルト値を設定
    const defaultPolicies = {
        '子育て支援の充実': '未回答',
        '教育環境の整備': '未回答',
        '観光振興': '未回答',
        '防災対策の強化': '未回答',
        '高齢者福祉の向上': '未回答'
    };
    
    // デフォルト政策項目を設定（回答がない場合）
    Object.keys(defaultPolicies).forEach(policy => {
        if (!candidate.policies[policy]) {
            candidate.policies[policy] = defaultPolicies[policy];
        }
    });
    
    // デフォルト値の設定
    candidate.name = candidate.name || '名前未設定';
    candidate.age = candidate.age || '年代未設定';
    candidate.occupation = candidate.occupation || '職業未設定';
    candidate.district = candidate.district || '地区未設定';
    candidate.party = candidate.party || '政党未設定';
    candidate.status = candidate.status || '新人';
    candidate.catchphrase = candidate.catchphrase || '';
    candidate.photo = 'https://placehold.co/300x300/EFEFEF/AAAAAA?text=候補者';
    
    return candidate;
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
 * 候補者詳細の表示
 */
function showCandidateDetail(candidate) {
    const modal = document.getElementById('candidate-modal');
    if (!modal) {
        createCandidateModal();
        return showCandidateDetail(candidate);
    }
    
    // モーダル内容の更新
    updateModalContent(candidate);
    
    // モーダルを表示
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * 候補者詳細モーダルの作成
 */
function createCandidateModal() {
    const modal = document.createElement('div');
    modal.id = 'candidate-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modal-candidate-name"></h2>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="modal-candidate-info">
                    <div class="modal-photo-section">
                        <img id="modal-candidate-photo" alt="候補者写真">
                        <div class="modal-basic-info">
                            <span id="modal-candidate-tag" class="tag"></span>
                            <p id="modal-candidate-details"></p>
                        </div>
                    </div>
                    <div class="modal-details-section">
                        <div class="modal-section">
                            <h3>アピール情報</h3>
                            <p><strong>キャッチフレーズ:</strong> <span id="modal-catchphrase"></span></p>
                            <p><strong>公式サイト:</strong> <a id="modal-website" href="#" target="_blank"></a></p>
                            <p><strong>連絡先:</strong> <a id="modal-email" href="#"></a></p>
                        </div>
                        <div class="modal-section">
                            <h3>政策スタンス</h3>
                            <div id="modal-policies" class="policy-grid"></div>
                        </div>
                        <div class="modal-section">
                            <h3>重点政策・ビジョン</h3>
                            <p><strong>重点政策:</strong> <span id="modal-main-policy"></span></p>
                            <p><strong>ビジョン:</strong> <span id="modal-vision"></span></p>
                            <p><strong>有権者へのメッセージ:</strong> <span id="modal-message"></span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // イベントリスナーの追加
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', closeCandidateModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCandidateModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeCandidateModal();
        }
    });
}

/**
 * モーダル内容の更新
 */
function updateModalContent(candidate) {
    document.getElementById('modal-candidate-name').textContent = candidate.name;
    document.getElementById('modal-candidate-photo').src = candidate.photo;
    document.getElementById('modal-candidate-photo').alt = `${candidate.name}の顔写真`;
    
    const tag = document.getElementById('modal-candidate-tag');
    tag.textContent = candidate.status;
    tag.className = `tag ${candidate.status === '現職' ? 'incumbent' : 'newcomer'}`;
    
    document.getElementById('modal-candidate-details').innerHTML = `
        ${candidate.age} | ${candidate.occupation}<br>
        ${candidate.district} | ${candidate.party}
    `;
    
    document.getElementById('modal-catchphrase').textContent = candidate.catchphrase || 'なし';
    
    const websiteLink = document.getElementById('modal-website');
    if (candidate.website && candidate.website !== 'テスト') {
        websiteLink.href = candidate.website;
        websiteLink.textContent = candidate.website;
        websiteLink.style.display = 'inline';
    } else {
        websiteLink.style.display = 'none';
    }
    
    const emailLink = document.getElementById('modal-email');
    if (candidate.email && candidate.email !== 'test@test.co.jp') {
        emailLink.href = `mailto:${candidate.email}`;
        emailLink.textContent = candidate.email;
        emailLink.style.display = 'inline';
    } else {
        emailLink.style.display = 'none';
    }
    
    // 政策スタンスの表示
    const policiesContainer = document.getElementById('modal-policies');
    policiesContainer.innerHTML = '';
    
    if (candidate.policies && Object.keys(candidate.policies).length > 0) {
        Object.entries(candidate.policies).forEach(([policy, stance]) => {
            const policyItem = document.createElement('div');
            policyItem.className = 'policy-item';
            
            let stanceClass = 'neutral';
            if (stance.includes('積極的に推進')) stanceClass = 'support';
            else if (stance.includes('反対')) stanceClass = 'oppose';
            
            policyItem.innerHTML = `
                <span class="policy-name">${policy}</span>
                <span class="policy-stance ${stanceClass}">${stance}</span>
            `;
            
            policiesContainer.appendChild(policyItem);
        });
    } else {
        policiesContainer.innerHTML = '<p>政策スタンス情報がありません</p>';
    }
    
    document.getElementById('modal-main-policy').textContent = candidate.mainPolicy || 'なし';
    document.getElementById('modal-vision').textContent = candidate.vision || 'なし';
    document.getElementById('modal-message').textContent = candidate.message || 'なし';
}

/**
 * モーダルを閉じる
 */
function closeCandidateModal() {
    const modal = document.getElementById('candidate-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
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
        if (statusFilter === 'incumbent') return candidate.status === '現職';
        if (statusFilter === 'newcomer') return candidate.status === '新人';
        return true;
    });
    
    // ソート
    filteredCandidates.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name, 'ja');
            case 'status':
                if (a.status !== b.status) {
                    return a.status === '現職' ? -1 : 1;
                }
                return a.name.localeCompare(b.name, 'ja');
            case 'age':
                const ageOrder = ['20代', '30代', '40代', '50代', '60代', '70代以上'];
                const aIndex = ageOrder.indexOf(a.age);
                const bIndex = ageOrder.indexOf(b.age);
                return aIndex - bIndex;
            default:
                return 0;
        }
    });
    
    displayCandidates();
    updateCandidateCount(filteredCandidates.length);
}

/**
 * 候補者数の更新
 */
function updateCandidateCount(count) {
    if (elements.candidateTotal) {
        elements.candidateTotal.textContent = `${count}名の候補者が登録されています`;
    }
}

/**
 * 最終更新日時の更新
 */
function updateLastUpdated() {
    if (elements.lastUpdated) {
        const now = new Date();
        const formatted = now.toLocaleString('ja-JP');
        elements.lastUpdated.textContent = `最終更新: ${formatted}`;
    }
}

/**
 * ローディング表示
 */
function showLoading() {
    if (elements.loading) {
        elements.loading.style.display = 'block';
    }
}

/**
 * ローディング非表示
 */
function hideLoading() {
    if (elements.loading) {
        elements.loading.style.display = 'none';
    }
}

/**
 * エラー表示
 */
function showError(message) {
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'block';
    }
    hideLoading();
}

/**
 * エラー非表示
 */
function hideError() {
    if (elements.errorMessage) {
        elements.errorMessage.style.display = 'none';
    }
}



/**
 * 政策比較の新しいカード形式での生成
 */
function generatePolicyComparisonTable() {
    const container = document.getElementById('policy-comparison-container');
    if (!container || candidatesData.length === 0) {
        console.log('政策比較コンテナまたは候補者データが見つかりません');
        return;
    }
    
    // 政策項目の抽出
    const policyItems = extractPolicyItems();
    console.log('抽出された政策項目:', policyItems);
    
    if (policyItems.length === 0) {
        container.innerHTML = '<div class="policy-loading"><p>政策比較データがありません</p></div>';
        return;
    }
    
    // コンテナをクリア
    container.innerHTML = '';
    
    // 各政策項目ごとにブロックを生成
    policyItems.forEach((policyItem, index) => {
        console.log(`政策項目 ${index + 1}: ${policyItem}`);
        
        const questionBlock = document.createElement('div');
        questionBlock.className = 'policy-question-block';
        
        // 質問ヘッダー
        const questionHeader = document.createElement('div');
        questionHeader.className = 'policy-question-header';
        questionHeader.textContent = policyItem;
        
        // 回答コンテナ
        const answersContainer = document.createElement('div');
        answersContainer.className = 'policy-answers-container';
        
        // スクロール可能な回答エリア
        const answersScroll = document.createElement('div');
        answersScroll.className = 'policy-answers-scroll';
        
        // 各候補者の回答カードを生成
        candidatesData.forEach((candidate, candidateIndex) => {
            console.log(`候補者 ${candidateIndex + 1}: ${candidate.name}`);
            
            const answerCard = document.createElement('div');
            answerCard.className = 'candidate-answer-card';
            
            const stance = candidate.policies[policyItem] || '未回答';
            const stanceClass = getStanceClass(stance);
            const stanceText = getStanceDisplayText(stance);
            
            console.log(`${candidate.name}の${policyItem}に対するスタンス: ${stance}`);
            
            answerCard.innerHTML = `
                <div class="answer-card-header">
                    <img src="${candidate.photo || 'https://placehold.co/40x40/EFEFEF/AAAAAA?text=?'}" alt="${candidate.name}" class="answer-card-photo">
                    <div class="answer-card-info">
                        <div class="answer-card-name">${candidate.name}</div>
                        <span class="answer-card-tag ${candidate.status === '現職' ? 'incumbent' : 'newcomer'}">
                            ${candidate.status}
                        </span>
                    </div>
                </div>
                <div class="answer-card-stance">
                    <span class="answer-stance-badge ${stanceClass}">${stanceText}</span>
                </div>
            `;
            
            answersScroll.appendChild(answerCard);
        });
        
        // スクロールインジケーター
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.textContent = '左右にスワイプして他の候補者を確認';
        
        answersContainer.appendChild(answersScroll);
        answersContainer.appendChild(scrollIndicator);
        
        questionBlock.appendChild(questionHeader);
        questionBlock.appendChild(answersContainer);
        
        container.appendChild(questionBlock);
    });
    
    console.log('政策比較テーブルの生成が完了しました');
}
/**
 * 政策項目の抽出
 */
function extractPolicyItems() {
    const policySet = new Set();
    
    candidatesData.forEach(candidate => {
        if (candidate.policies) {
            Object.keys(candidate.policies).forEach(policy => {
                if (policy && policy.trim()) {
                    policySet.add(policy.trim());
                }
            });
        }
    });
    
    return Array.from(policySet).sort();
}






/**
 * スタンスのクラス名を取得
 */
function getStanceClass(stance) {
    if (!stance || stance === '未回答') return 'no-response';
    
    const lowerStance = stance.toLowerCase();
    if (lowerStance.includes('積極的に推進') || lowerStance.includes('賛成') || lowerStance.includes('支持')) {
        return 'support';
    } else if (lowerStance.includes('反対') || lowerStance.includes('慎重')) {
        return 'oppose';
    } else {
        return 'neutral';
    }
}

/**
 * スタンスの表示テキストを取得
 */
function getStanceDisplayText(stance) {
    if (!stance || stance === '未回答') return '未回答';
    
    // 長いテキストを短縮
    if (stance.length > 15) {
        if (stance.includes('積極的に推進')) return '積極推進';
        if (stance.includes('反対')) return '反対';
        if (stance.includes('慎重')) return '慎重';
        return stance.substring(0, 12) + '...';
    }
    
    return stance;
}

/**
 * displayCandidates関数を拡張して政策比較も更新
 */
const originalDisplayCandidates = displayCandidates;
displayCandidates = function() {
    originalDisplayCandidates.call(this);
    
    // 政策比較テーブルも更新
    setTimeout(() => {
        generatePolicyComparisonTable();
    }, 100);
};



// ===== 管理者機能 =====

/**
 * 管理者認証
 */
function authenticateAdmin() {
    const password = prompt('管理者パスワードを入力してください:');
    if (password === 'kaga2025admin') {
        showAdminSection();
        return true;
    } else if (password !== null) {
        alert('パスワードが正しくありません。');
    }
    return false;
}

/**
 * 管理者セクションを表示
 */
function showAdminSection() {
    document.querySelector('.admin-link').style.display = 'block';
    document.getElementById('admin').style.display = 'block';
    populateCandidateSelector();
    updateDataStatus();
}

/**
 * 候補者セレクターを更新
 */
function populateCandidateSelector() {
    const select = document.getElementById('candidate-select');
    select.innerHTML = '<option value="">候補者を選択してください</option>';
    
    candidatesData.forEach((candidate, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = candidate.name;
        select.appendChild(option);
    });
}

/**
 * データステータスを更新
 */
function updateDataStatus() {
    document.getElementById('data-last-updated').textContent = new Date().toLocaleString('ja-JP');
    document.getElementById('data-candidate-count').textContent = candidatesData.length;
}

/**
 * 管理者タブ切り替え
 */
function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // タブの状態を更新
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // コンテンツの表示を更新
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
}

/**
 * 写真アップロード機能の初期化
 */
function setupPhotoUpload() {
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('photo-input');
    const preview = document.getElementById('photo-preview');
    const previewImage = document.getElementById('preview-image');
    
    // ドラッグ&ドロップ
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    // ファイル選択
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    // クリックでファイル選択
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });
}

/**
 * ファイル選択処理
 */
function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        showUploadStatus('画像ファイルを選択してください。', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB制限
        showUploadStatus('ファイルサイズが大きすぎます（10MB以下）。', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('preview-image').src = e.target.result;
        document.getElementById('upload-dropzone').style.display = 'none';
        document.getElementById('photo-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

/**
 * 写真プレビューをクリア
 */
function clearPhotoPreview() {
    document.getElementById('upload-dropzone').style.display = 'block';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('photo-input').value = '';
    hideUploadStatus();
}

/**
 * 写真アップロード実行
 */
function uploadPhoto() {
    const candidateIndex = document.getElementById('candidate-select').value;
    const fileInput = document.getElementById('photo-input');
    
    if (!candidateIndex) {
        showUploadStatus('候補者を選択してください。', 'error');
        return;
    }
    
    if (!fileInput.files[0]) {
        showUploadStatus('写真を選択してください。', 'error');
        return;
    }
    
    showUploadStatus('アップロード中...', 'loading');
    
    // 実際のアップロード処理（デモ版）
    setTimeout(() => {
        const candidate = candidatesData[candidateIndex];
        const file = fileInput.files[0];
        
        // 画像をBase64に変換してローカルストレージに保存（デモ用）
        const reader = new FileReader();
        reader.onload = (e) => {
            candidate.photo = e.target.result;
            
            // 候補者カードを更新
            displayCandidates();
            
            showUploadStatus(`${candidate.name}の写真をアップロードしました。`, 'success');
            
            // プレビューをクリア
            setTimeout(() => {
                clearPhotoPreview();
            }, 2000);
        };
        reader.readAsDataURL(file);
    }, 1500);
}

/**
 * アップロードステータス表示
 */
function showUploadStatus(message, type) {
    const status = document.getElementById('upload-status');
    status.textContent = message;
    status.className = `upload-status ${type}`;
    status.style.display = 'block';
}

/**
 * アップロードステータス非表示
 */
function hideUploadStatus() {
    document.getElementById('upload-status').style.display = 'none';
}

/**
 * データ再読み込み
 */
function refreshData() {
    showUploadStatus('データを再読み込み中...', 'loading');
    
    setTimeout(() => {
        loadCandidateData();
        populateCandidateSelector();
        updateDataStatus();
        showUploadStatus('データを再読み込みしました。', 'success');
        
        setTimeout(() => {
            hideUploadStatus();
        }, 2000);
    }, 1000);
}

/**
 * データエクスポート
 */
function exportData() {
    const dataStr = JSON.stringify(candidatesData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `candidates_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showUploadStatus('データをエクスポートしました。', 'success');
    setTimeout(() => {
        hideUploadStatus();
    }, 2000);
}

/**
 * 管理者機能の初期化
 */
function initializeAdminFeatures() {
    setupAdminTabs();
    setupPhotoUpload();
    
    // 管理者リンクのクリックイベント
    document.querySelector('.admin-link').addEventListener('click', (e) => {
        e.preventDefault();
        if (document.getElementById('admin').style.display === 'none') {
            authenticateAdmin();
        } else {
            document.getElementById('admin').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// 管理者機能の初期化を追加
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminFeatures();
});

