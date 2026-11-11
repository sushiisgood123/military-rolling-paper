# 🎖️ 군사실무 디지털 롤링페이퍼 (Digital Rolling Paper)

누구나 접속하여 따뜻한 롤링페이퍼 메모를 남길 수 있는 공개 웹 애플리케이션입니다.

## ✨ 주요 기능
- 💌 **누구나 자유롭게 작성**: 방문자 누구나 이름, 소속, 메시지를 남길 수 있습니다.
- 🎨 **개성 있는 포스트잇**: 6가지 파스텔 컬러와 스티커(이모지) 선택 가능
- ⚡ **실시간 데이터 저장**: Supabase (PostgreSQL) 데이터베이스 연동
- 🔍 **검색 기능**: 작성자나 메시지 내용으로 원하는 메모 즉시 검색
- 📱 **모바일 최적화**: 스마트폰, 태블릿, PC 모든 기기에서 완벽하게 동작
- 🎉 **축하 효과**: 메모 등록 시 폭죽 애니메이션 효과 (Canvas-confetti)

## 🛠️ 기술 스택
- **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla ES6+)
- **Database / Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 빠른 시작 방법
1. Supabase 대시보드에서 `messages` 테이블 생성 (`supabase_setup.sql` 참고)
2. `app.js` 파일에 본인의 `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 입력
3. GitHub에 코드 업로드 후 Vercel 연동

