#!/bin/sh
set -e

# If DATABASE_URL is set, convert it to Spring Boot properties
if [ -n "$DATABASE_URL" ]; then
    URL="$DATABASE_URL"

    # Strip "DATABASE_URL = " prefix if present (user might set it wrong in Render)
    case "$URL" in
        DATABASE_URL\ =\ *)
            URL=$(echo "$URL" | sed 's/^DATABASE_URL = //')
            ;;
        DATABASE_URL=*)
            URL=$(echo "$URL" | sed 's/^DATABASE_URL=//')
            ;;
    esac

    # Convert postgres:// or postgresql:// to jdbc:postgresql://
    case "$URL" in
        postgres://*)
            URL="jdbc:postgresql://${URL#postgres://}"
            ;;
        postgresql://*)
            URL="jdbc:postgresql://${URL#postgresql://}"
            ;;
        jdbc:*)
            # already fine
            ;;
    esac

    # Extract user:password from URL and set separately
    # URL format: jdbc:postgresql://user:password@host/database?params
    WITHOUT_PREFIX="${URL#jdbc:postgresql://}"
    BEFORE_AT="${WITHOUT_PREFIX%@*}"
    AFTER_AT="${WITHOUT_PREFIX#*@}"

    DB_USER_PART=$(echo "$BEFORE_AT" | cut -d: -f1)
    DB_PASS_PART=$(echo "$BEFORE_AT" | cut -d: -f2-)

    JDBC_URL="jdbc:postgresql://${AFTER_AT}"

    export SPRING_DATASOURCE_URL="$JDBC_URL"
    export SPRING_DATASOURCE_USERNAME="$DB_USER_PART"
    export SPRING_DATASOURCE_PASSWORD="$DB_PASS_PART"

    echo "=== DB Config ==="
    echo "URL: $JDBC_URL"
    echo "User: $DB_USER_PART"
    echo "================="
fi

exec java -jar app.jar
