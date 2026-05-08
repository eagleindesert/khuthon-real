# scripts/push_image.ps1

# 1. Docker Hub 로그인 확인 (필요시 주석 해제)
# Write-Host "--- Docker Hub 로그인 확인 중... ---" -ForegroundColor Cyan
# docker login

# 2. docker-compose를 이용한 이미지 푸시
# docker-compose.yml에 정의된 image 이름을 기준으로 Docker Hub에 업로드합니다.
# push: 이미지를 레지스트리에 전송합니다.
Write-Host "--- docker-compose를 통해 이미지 푸시 중... ---" -ForegroundColor Cyan
docker compose push app

Write-Host "--- 완료! ---" -ForegroundColor Green
