FROM eclipse-temurin:20-jdk-alpine AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
RUN apk add --no-cache maven && mvn -f /app/pom.xml clean package -DskipTests

FROM eclipse-temurin:20-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
EXPOSE 10000
ENTRYPOINT ["/app/start.sh"]
