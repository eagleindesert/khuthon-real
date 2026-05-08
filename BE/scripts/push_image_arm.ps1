# scripts/push_image_arm.ps1

# 변수 설정
$DOCKER_HUB_ID = "eagleindesert"      # Docker Hub 사용자 ID
$IMAGE_NAME = "khuthon-be"            # 이미지 이름
$TAG = "latest-arm64"                 # ARM64용 구분을 위한 태그

Write-Host "--- ARM64 멀티 플랫폼 빌드 및 푸시 시작 ---" -ForegroundColor Cyan

# 1. buildx 빌더 확인 및 생성 (없을 경우 생성)
# 멀티 플랫폼 빌드를 위해서는 전용 빌더가 필요합니다.
$builderName = "khuthon-builder"
if (-not (docker buildx ls | Select-String $builderName)) {
    Write-Host "새로운 buildx 빌더($builderName) 생성 중..."
    docker buildx create --name $builderName --use
} else {
    docker buildx use $builderName
}

# 2. ARM64 빌드 및 푸시
# buildx build: 멀티 아키텍처 빌드를 수행합니다.
# --platform linux/arm64: 빌드 타겟 아키텍처를 ARM 64비트로 지정합니다.
# -t: 이미지의 이름과 태그를 지정합니다.
# --push: 빌드가 완료되면 결과물을 즉시 Docker Hub에 업로드합니다.
# .: 현재 디렉토리의 Dockerfile을 참조합니다.
Write-Host "빌드 및 푸시를 수행합니다 (시간이 다소 소요될 수 있습니다)..."
docker buildx build --platform linux/arm64 -t "${DOCKER_HUB_ID}/${IMAGE_NAME}:${TAG}" --push .

Write-Host "--- ARM64 이미지 업로드 완료! ---" -ForegroundColor Green
