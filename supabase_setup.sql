-- ==========================================
-- 💌 디지털 롤링페이퍼 테이블 생성 SQL
-- ==========================================
-- Supabase의 좌측 메뉴 'SQL Editor' -> 'New query'에 
-- 아래 내용을 전부 복사해서 붙여넣고 'Run' 버튼을 누르세요.

-- 1. 롤링페이퍼 메시지 저장용 테이블 생성
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    author VARCHAR(50) NOT NULL,          -- 작성자 이름
    affiliation VARCHAR(50) DEFAULT '',    -- 소속/계급/역할 (선택)
    content TEXT NOT NULL,                 -- 남길 메시지
    color VARCHAR(20) DEFAULT 'yellow',    -- 포스트잇 색상
    emoji VARCHAR(10) DEFAULT '💌'          -- 선택한 스티커/이모지
);

-- 2. 보안 정책(RLS: Row Level Security) 활성화
-- 누구나 안전하게 읽고 쓸 수 있도록 규칙을 설정합니다.
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. 누구나 메모를 읽을 수 있도록 허용 (SELECT 정책)
CREATE POLICY "누구나 롤링페이퍼를 볼 수 있음" 
ON messages FOR SELECT 
TO anon 
USING (true);

-- 4. 누구나 새 메모를 작성할 수 있도록 허용 (INSERT 정책)
CREATE POLICY "누구나 롤링페이퍼에 메모를 쓸 수 있음" 
ON messages FOR INSERT 
TO anon 
WITH CHECK (true);

-- 5. 실시간 동기화(Realtime) 활성화 (다른 사람이 글을 쓰면 새로고침 없이 화면에 즉시 표시됨)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ==========================================
-- 완료! 이제 테이블 준비가 끝났습니다.
-- ==========================================

