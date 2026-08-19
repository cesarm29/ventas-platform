package com.ventasplatform.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean
    public DataSource dataSource() {
        String rawUrl = resolveEnv("DATABASE_URL", "SPRING_DATASOURCE_URL");
        String user = resolveEnv("DB_USER", "PGUSER", "SPRING_DATASOURCE_USERNAME", "PGUSER");
        String password = resolveEnv("DB_PASSWORD", "PGPASSWORD", "SPRING_DATASOURCE_PASSWORD", "PGPASSWORD");

        log.info("Resolved DATABASE_URL: {}", rawUrl != null ? rawUrl.replaceAll("://.*@", "://***@") : "null");

        String url = convertToJdbcUrl(rawUrl);
        if (url == null) {
            url = "jdbc:postgresql://localhost:5432/ventas_db";
            user = user != null ? user : "postgres";
            password = password != null ? password : "postgres";
        }
        if (user == null || user.isBlank()) user = "postgres";
        if (password == null || password.isBlank()) password = "postgres";

        log.info("Using JDBC URL: {}", url.replaceAll("://.*@", "://***@"));

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(user);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        return new HikariDataSource(config);
    }

    private String convertToJdbcUrl(String url) {
        if (url == null || url.isBlank()) return null;

        url = url.trim();

        if (url.startsWith("DATABASE_URL")) {
            int eqIndex = url.indexOf('=');
            if (eqIndex >= 0) {
                url = url.substring(eqIndex + 1).trim();
            }
        }

        if (url.startsWith("jdbc:")) return url;
        if (url.startsWith("postgres://")) return url.replaceFirst("postgres://", "jdbc:postgresql://");
        if (url.startsWith("postgresql://")) return url.replaceFirst("postgresql://", "jdbc:postgresql://");

        return url;
    }

    private String resolveEnv(String... keys) {
        for (String key : keys) {
            String value = System.getenv(key);
            if (value != null && !value.isBlank()) return value.trim();
        }
        return null;
    }
}
