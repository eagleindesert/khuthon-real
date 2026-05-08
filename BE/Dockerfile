# ── Stage 1: Build ──────────────────────────────────────────────
# Gradle 이미지 대신 JDK만 있는 이미지를 사용하고,
# 프로젝트의 gradlew(Wrapper)로 빌드 → gradle-wrapper.properties의 버전(9.4.1) 자동 사용
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
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 빌드 결과물만 복사
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
