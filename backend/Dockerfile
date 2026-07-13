# --- Build stage (Java 21 + Maven) ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests clean package

# --- Runtime stage (slim JRE) ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/contact-service-1.0.0.jar app.jar
EXPOSE 8080
# Uses the DEFAULT profile (PostgreSQL + Flyway + email). Override via env vars.
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
