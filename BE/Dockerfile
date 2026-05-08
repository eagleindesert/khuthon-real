# ── Stage 1: Build ──────────────────────────────────────────────
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# gradlew 실행 권한 부여를 위해 Wrapper 파일 먼저 복사
COPY gradlew ./
COPY gradle ./gradle
RUN chmod +x gradlew

# 의존성 캐시 레이어: build 스크립트만 먼저 복사해 소스 변경 시 재다운로드 방지
COPY build.gradle settings.gradle ./

# 소스 전체 복사 후 빌드 (테스트 제외, 실행 가능한 JAR 생성)
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# ── Stage 2: Runtime ─────────────────────────────────────────────
# ARM64를 완벽하게 지원하는 Ubuntu 기반 JRE 이미지 사용
FROM eclipse-temurin:17-jre

WORKDIR /app

# 빌드 결과물만 복사
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
