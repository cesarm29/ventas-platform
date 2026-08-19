package com.ventasplatform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        String url = System.getenv("DATABASE_URL");
        if (url == null || url.isBlank()) {
            url = System.getenv("POSTGRES_URL");
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
        if (user == null || user.isBlank()) user = System.getenv("POSTGRES_USER");
        if (user == null || user.isBlank()) user = "postgres";

        String password = System.getenv("DB_PASSWORD");
        if (password == null || password.isBlank()) password = System.getenv("PGPASSWORD");
        if (password == null || password.isBlank()) password = System.getenv("POSTGRES_PASSWORD");
        if (password == null || password.isBlank()) password = "postgres";

        return DataSourceBuilder.create()
            .url(url)
            .username(user)
            .password(password)
            .driverClassName("org.postgresql.Driver")
            .build();
    }
}
