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
        
        const candidates = await fetchSpreadsheetData();
        if (candidates && candidates.length > 0) {
            candidatesData = candidates;
            filteredCandidates = [...candidates];
            displayCandidates();
            updateCandidateCount(candidates.length);
            hideLoading();
            updateLastUpdated();
        } else {
            showError('候補者データが見つかりませんでした。');
        }
    } catch (error) {
        console.error('候補者データの読み込みエラー:', error);
        showError('候補者データの読み込み中にエラーが発生しました。');
    }
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
    headers.forEach((header, index) => {
        if (header.startsWith('政策') && values[index]) {
            const policyKey = header.replace(/政策\d+:\s*/, '');
            candidate.policies[policyKey] = values[index];
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
 * 政策比較テーブルの生成
 */
function generatePolicyComparisonTable() {
    const container = document.getElementById('policy-comparison-container');
    if (!container || candidatesData.length === 0) return;
    
    // 政策項目の抽出
    const policyItems = extractPolicyItems();
    if (policyItems.length === 0) {
        container.innerHTML = '<div class="policy-loading"><p>政策比較データがありません</p></div>';
        return;
    }
    
    // テーブルの生成
    const table = document.createElement('table');
    table.className = 'policy-table';
    
    // ヘッダー行の生成
    const headerRow = document.createElement('tr');
    
    // 政策項目列のヘッダー
    const policyHeader = document.createElement('th');
    policyHeader.textContent = '政策項目';
    headerRow.appendChild(policyHeader);
    
    // 候補者列のヘッダー
    candidatesData.forEach(candidate => {
        const candidateHeader = document.createElement('th');
        candidateHeader.innerHTML = `
            <div class="candidate-header">
                <div class="candidate-name-small">${candidate.name}</div>
                <span class="candidate-tag-small ${candidate.status === '現職' ? 'incumbent' : 'newcomer'}">
                    ${candidate.status}
                </span>
            </div>
        `;
        headerRow.appendChild(candidateHeader);
    });
    
    table.appendChild(headerRow);
    
    // 政策項目行の生成
    policyItems.forEach(policyItem => {
        const row = document.createElement('tr');
        
        // 政策項目名
        const policyCell = document.createElement('td');
        policyCell.textContent = policyItem;
        row.appendChild(policyCell);
        
        // 各候補者のスタンス
        candidatesData.forEach(candidate => {
            const stanceCell = document.createElement('td');
            stanceCell.className = 'policy-stance-cell';
            
            const stance = candidate.policies[policyItem] || '未回答';
            const stanceClass = getStanceClass(stance);
            const stanceText = getStanceDisplayText(stance);
            
            stanceCell.innerHTML = `
                <span class="policy-stance-badge ${stanceClass}">${stanceText}</span>
            `;
            
            row.appendChild(stanceCell);
        });
        
        table.appendChild(row);
    });
    
    container.innerHTML = '';
    container.appendChild(table);
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

