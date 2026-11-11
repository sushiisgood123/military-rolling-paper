// ========================================================
// 💌 디지털 롤링페이퍼 - 프론트엔드 & Supabase 연동 로직
// ========================================================

/**
 * 🔑 [필수 설정] 본인의 Supabase 프로젝트 정보를 입력하세요!
 * 1. Supabase 대시보드 (https://supabase.com/dashboard) 접속
 * 2. 내 프로젝트 선택 -> 좌측 톱니바퀴 (Project Settings) -> API 클릭
 * 3. Project URL 과 anon public API Key 를 아래 따옴표 안에 복사해 넣으세요.
 */
const DEFAULT_SUPABASE_URL = "https://xupfuqmojeopfvhfgimb.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_l3A2z3SsHV6_gMvfzjFF1Q_GMCm3aoD";

// 로컬스토리지에 임시 저장된 키가 있다면 우선 적용 (웹에서 즉시 테스트용)
const SUPABASE_URL = localStorage.getItem("supabase_url") || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = localStorage.getItem("supabase_anon_key") || DEFAULT_SUPABASE_ANON_KEY;

// 상태 관리
let supabaseClient = null;
let allMessages = [];

// DOM 요소 참조
const messagesGrid = document.getElementById("messages-grid");
const loadingSpinner = document.getElementById("loading-spinner");
const emptyState = document.getElementById("empty-state");
const messageCountSpan = document.getElementById("message-count");
const searchInput = document.getElementById("search-input");
const btnRefresh = document.getElementById("btn-refresh");

// 모달 요소
const writeModal = document.getElementById("write-modal");
const btnOpenModal = document.getElementById("btn-open-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const writeForm = document.getElementById("write-form");
const btnSubmit = document.getElementById("btn-submit");
const inputContent = document.getElementById("input-content");
const charCount = document.getElementById("char-count");
const inputColor = document.getElementById("input-color");
const inputEmoji = document.getElementById("input-emoji");
const configBanner = document.getElementById("config-banner");

// ========================================================
// 1. 초기화 및 Supabase 클라이언트 연결
// ========================================================
function initSupabase() {
  const isConfigured =
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("YOUR_SUPABASE_URL") &&
    !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");

  if (!isConfigured) {
    // 키가 설정되지 않은 경우 안내 배너 표시
    configBanner.classList.remove("hidden");
    loadingSpinner.classList.add("hidden");
    emptyState.classList.remove("hidden");
    emptyState.innerHTML = `
      <div class="text-5xl mb-4">⚙️</div>
      <h3 class="text-lg font-bold text-slate-800 mb-2">Supabase 연결이 필요합니다</h3>
      <p class="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
        아직 Supabase 프로젝트 URL과 API Key가 입력되지 않았습니다.<br/>
        상단의 <strong>[연결 설정하기]</strong> 버튼을 누르거나<br/>
        <code class="bg-slate-100 text-amber-700 px-1 py-0.5 rounded font-mono text-xs">app.js</code> 파일을 열어 키를 입력해주세요!
      </p>
      <button onclick="openConfigModal()" class="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow">
        지금 바로 연결하기
      </button>
    `;
    return false;
  }

  try {
    const cleanUrl = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, "");
    supabaseClient = window.supabase.createClient(cleanUrl, SUPABASE_ANON_KEY.trim());
    return true;
  } catch (err) {
    console.error("Supabase 초기화 오류:", err);
    alert("Supabase 초기화에 실패했습니다. URL과 Key를 다시 확인해주세요.");
    return false;
  }
}

// ========================================================
// 2. 메시지 목록 불러오기 (Read)
// ========================================================
async function fetchMessages() {
  if (!supabaseClient) return;

  loadingSpinner.classList.remove("hidden");
  emptyState.classList.add("hidden");

  try {
    const { data, error } = await supabaseClient
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    allMessages = data || [];
    renderMessages(allMessages);
  } catch (err) {
    console.error("데이터 조회 실패:", err);
    messagesGrid.innerHTML = `
      <div class="col-span-full text-center py-12 text-red-500 bg-red-50 rounded-2xl p-6 border border-red-200">
        <i class="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
        <p class="font-bold">메시지를 불러오지 못했습니다.</p>
        <p class="text-xs text-red-400 mt-1">${escapeHtml(err.message || "테이블이 생성되었는지 확인해주세요.")}</p>
      </div>
    `;
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

// ========================================================
// 3. 메시지 렌더링 함수
// ========================================================
function renderMessages(messages) {
  messageCountSpan.textContent = `${messages.length}개`;

  if (messages.length === 0) {
    emptyState.classList.remove("hidden");
    messagesGrid.innerHTML = "";
    return;
  }

  emptyState.classList.add("hidden");

  messagesGrid.innerHTML = messages.map(msg => {
    const colorClass = `note-${msg.color || "yellow"}`;
    const formattedDate = formatDate(msg.created_at);
    const affiliationBadge = msg.affiliation
      ? `<span class="bg-black/10 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">${escapeHtml(msg.affiliation)}</span>`
      : "";

    return `
      <article class="note-card ${colorClass} relative p-5 rounded-2xl border shadow-sm flex flex-col justify-between">
        <div class="tape-effect"></div>
        
        <div>
          <!-- 상단 이모지 & 소속 & 작성일 -->
          <div class="flex items-center justify-between gap-2 mb-3 mt-1">
            <div class="flex items-center gap-1.5">
              <span class="text-xl select-none">${msg.emoji || "💌"}</span>
              ${affiliationBadge}
            </div>
            <time class="text-[11px] text-slate-500 font-mono">${formattedDate}</time>
          </div>

          <!-- 메시지 본문 -->
          <p class="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words font-normal mb-4">
            ${escapeHtml(msg.content)}
          </p>
        </div>

        <!-- 하단 작성자 정보 -->
        <div class="pt-3 border-t border-black/10 flex items-center justify-between text-xs">
          <span class="text-slate-500 text-[11px]">From.</span>
          <span class="font-bold text-slate-900 truncate max-w-[150px]">${escapeHtml(msg.author)}</span>
        </div>
      </article>
    `;
  }).join("");
}

// ========================================================
// 4. 새 메시지 등록 (Create)
// ========================================================
writeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!supabaseClient) {
    alert("Supabase 설정이 완료되지 않았습니다.");
    return;
  }

  const author = document.getElementById("input-author").value.trim();
  const affiliation = document.getElementById("input-affiliation").value.trim();
  const content = inputContent.value.trim();
  const color = inputColor.value;
  const emoji = inputEmoji.value;

  if (!author || !content) {
    alert("작성자 이름과 메시지를 모두 입력해주세요!");
    return;
  }

  // 제출 버튼 비활성화 (중복 제출 방지)
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>등록 중...</span>`;

  try {
    const { data, error } = await supabaseClient
      .from("messages")
      .insert([
        {
          author: author,
          affiliation: affiliation,
          content: content,
          color: color,
          emoji: emoji
        }
      ])
      .select();

    if (error) throw error;

    // 축하 폭죽 애니메이션 발사! 🎉
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // 모달 닫기 및 폼 초기화
    closeModal();
    writeForm.reset();
    charCount.textContent = "0 / 500자";
    resetColorAndEmojiSelection();

    // 새 목록 다시 불러오기
    await fetchMessages();

  } catch (err) {
    console.error("메모 등록 실패:", err);
    alert(`메모 등록에 실패했습니다: ${err.message || "오류가 발생했습니다."}`);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `<span>마음 붙이기 (등록)</span><i class="fa-solid fa-paper-plane text-xs text-amber-400"></i>`;
  }
});

// ========================================================
// 5. 모달 및 UI 인터랙션 제어
// ========================================================
function openModal() {
  writeModal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // 배경 스크롤 방지
  setTimeout(() => document.getElementById("input-author").focus(), 100);
}

function closeModal() {
  writeModal.classList.add("hidden");
  document.body.style.overflow = "";
}

btnOpenModal.addEventListener("click", openModal);
btnCloseModal.addEventListener("click", closeModal);

// 모달 바깥 배경 클릭 시 닫기
writeModal.addEventListener("click", (e) => {
  if (e.target === writeModal) closeModal();
});

// ESC 키 입력 시 모달 닫기
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeConfigModal();
  }
});

// 글자 수 실시간 카운트
inputContent.addEventListener("input", () => {
  const len = inputContent.value.length;
  charCount.textContent = `${len} / 500자`;
});

// 새로고침 버튼
btnRefresh.addEventListener("click", () => {
  fetchMessages();
});

// 실시간 검색 기능 (작성자 또는 본문 검색)
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderMessages(allMessages);
    return;
  }
  const filtered = allMessages.filter(msg =>
    (msg.author && msg.author.toLowerCase().includes(query)) ||
    (msg.affiliation && msg.affiliation.toLowerCase().includes(query)) ||
    (msg.content && msg.content.toLowerCase().includes(query))
  );
  renderMessages(filtered);
});

// 색상 선택 버튼 인터랙션
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("ring-2", "ring-offset-2"));
    btn.classList.add("ring-2", "ring-offset-2");
    inputColor.value = btn.dataset.color;
  });
});

// 이모지 선택 버튼 인터랙션
document.querySelectorAll(".emoji-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("ring-2", "ring-slate-400"));
    btn.classList.add("ring-2", "ring-slate-400");
    inputEmoji.value = btn.dataset.emoji;
  });
});

function resetColorAndEmojiSelection() {
  inputColor.value = "yellow";
  inputEmoji.value = "🎖️";
  document.querySelectorAll(".color-btn").forEach((b, i) => {
    b.classList.toggle("ring-2", i === 0);
  });
  document.querySelectorAll(".emoji-btn").forEach((b, i) => {
    b.classList.toggle("ring-2", i === 0);
  });
}

// ========================================================
// 6. 설정 도우미 모달 (웹에서 직접 Supabase Key 입력)
// ========================================================
function openConfigModal() {
  document.getElementById("config-modal").classList.remove("hidden");
  document.getElementById("cfg-url").value = localStorage.getItem("supabase_url") || "";
  document.getElementById("cfg-key").value = localStorage.getItem("supabase_anon_key") || "";
}

function closeConfigModal() {
  document.getElementById("config-modal").classList.add("hidden");
}

document.getElementById("config-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const url = document.getElementById("cfg-url").value.trim();
  const key = document.getElementById("cfg-key").value.trim();
  if (url && key) {
    localStorage.setItem("supabase_url", url);
    localStorage.setItem("supabase_anon_key", key);
    alert("Supabase 설정이 브라우저에 저장되었습니다! 페이지를 새로고침합니다.");
    window.location.reload();
  }
});

// ========================================================
// 7. 실시간 동기화 (Supabase Realtime)
// ========================================================
function subscribeRealtime() {
  if (!supabaseClient) return;
  try {
    supabaseClient
      .channel("public-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg && !allMessages.some(m => m.id === newMsg.id)) {
            allMessages.unshift(newMsg);
            renderMessages(allMessages);
          }
        }
      )
      .subscribe();
  } catch (e) {
    console.warn("Realtime 구독 설정 건너뜀:", e);
  }
}

// ========================================================
// 8. 공유 및 QR 코드 모달
// ========================================================
function openShareModal() {
  const shareModal = document.getElementById("share-modal");
  const shareUrlInput = document.getElementById("share-url-input");
  const qrCanvas = document.getElementById("qr-canvas");

  const currentUrl = window.location.href;
  shareUrlInput.value = currentUrl;
  shareModal.classList.remove("hidden");

  if (window.QRCode && qrCanvas) {
    window.QRCode.toCanvas(qrCanvas, currentUrl, { width: 180, margin: 1 }, (error) => {
      if (error) console.error("QR 생성 실패:", error);
    });
  }
}

function closeShareModal() {
  const shareModal = document.getElementById("share-modal");
  if (shareModal) shareModal.classList.add("hidden");
}

function copyCurrentUrl() {
  const shareUrlInput = document.getElementById("share-url-input");
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrlInput.value).then(() => {
      alert("웹사이트 주소가 복사되었습니다! 카카오톡이나 메시지로 공유하세요.");
    });
  } else {
    shareUrlInput.select();
    document.execCommand("copy");
    alert("웹사이트 주소가 복사되었습니다!");
  }
}

// ========================================================
// 9. 유틸리티 함수들 (XSS 방지 및 날짜 포맷)
// ========================================================
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    return `${month}.${day} ${hours}:${mins}`;
  } catch (e) {
    return "";
  }
}

// 실행 시작
if (initSupabase()) {
  fetchMessages();
  subscribeRealtime();
}

