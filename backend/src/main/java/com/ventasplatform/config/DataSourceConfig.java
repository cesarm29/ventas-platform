package com.ventasplatform.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        String url = System.getenv("DATABASE_URL");
        if (url == null || url.isBlank()) {
            url = System.getenv("SPRING_DATASOURCE_URL");
        }
        if (url == null || url.isBlank()) {
            url = "jdbc:postgresql://localhost:5432/ventas_db";
        }

        if (url.startsWith("postgres://")) {
            url = url.replaceFirst("postgres://", "jdbc:postgresql://");
        } else if (url.startsWith("postgresql://")) {
            url = url.replaceFirst("postgresql://", "jdbc:postgresql://");
        }

        String user = System.getenv("DB_USER");
        if (user == null || user.isBlank()) user = System.getenv("PGUSER");
        if (user == null || user.isBlank()) user = System.getenv("SPRING_DATASOURCE_USERNAME");
        if (user == null || user.isBlank()) user = "postgres";

        String password = System.getenv("DB_PASSWORD");
        if (password == null || password.isBlank()) password = System.getenv("PGPASSWORD");
        if (password == null || password.isBlank()) password = System.getenv("SPRING_DATASOURCE_PASSWORD");
        if (password == null || password.isBlank()) password = "postgres";

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(user);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        return new HikariDataSource(config);
    }
}
