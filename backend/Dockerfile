# Stage 1: Build the Maven application
FROM maven:3.8-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Run the application jar
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/erp-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
