FROM eclipse-temurin:20-jdk-alpine AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
RUN apk add --no-cache maven && mvn -f /app/pom.xml clean package -DskipTests

FROM eclipse-temurin:20-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'if [ -n "$DATABASE_URL" ]; then' >> /app/start.sh && \
    echo '  URL="$DATABASE_URL"' >> /app/start.sh && \
    echo '  case "$URL" in DATABASE_URL*) URL=$(echo "$URL" | sed "s/^DATABASE_URL = //") ;; esac' >> /app/start.sh && \
    echo '  case "$URL" in postgresql://*) URL="jdbc:postgresql://${URL#postgresql://}" ;; esac' >> /app/start.sh && \
    echo '  case "$URL" in postgres://*) URL="jdbc:postgresql://${URL#postgres://}" ;; esac' >> /app/start.sh && \
    echo '  case "$URL" in jdbc:*) ;; *) URL="jdbc:postgresql://$URL" ;; esac' >> /app/start.sh && \
    echo '  export SPRING_DATASOURCE_URL="$URL"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'if [ -n "$PGUSER" ] && [ -z "$SPRING_DATASOURCE_USERNAME" ]; then export SPRING_DATASOURCE_USERNAME="$PGUSER"; fi' >> /app/start.sh && \
    echo 'if [ -n "$PGPASSWORD" ] && [ -z "$SPRING_DATASOURCE_PASSWORD" ]; then export SPRING_DATASOURCE_PASSWORD="$PGPASSWORD"; fi' >> /app/start.sh && \
    echo 'exec java -jar app.jar' >> /app/start.sh && \
    chmod +x /app/start.sh
EXPOSE 10000
ENTRYPOINT ["/app/start.sh"]
