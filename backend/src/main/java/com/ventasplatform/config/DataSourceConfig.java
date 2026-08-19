package com.ventasplatform.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL:jdbc:postgresql://localhost:5432/ventas_db}")
    private String databaseUrl;

    @Value("${DB_USER:postgres}")
    private String dbUser;

    @Value("${DB_PASSWORD:postgres}")
    private String dbPassword;

    @Bean
    public DataSource dataSource() {
        String url = databaseUrl;
        if (url.startsWith("postgres://")) {
            url = url.replaceFirst("postgres://", "jdbc:postgresql://");
        } else if (url.startsWith("postgresql://")) {
            url = url.replaceFirst("postgresql://", "jdbc:postgresql://");
        }
        return DataSourceBuilder.create()
            .url(url)
            .username(dbUser)
            .password(dbPassword)
            .driverClassName("org.postgresql.Driver")
            .build();
    }
}
