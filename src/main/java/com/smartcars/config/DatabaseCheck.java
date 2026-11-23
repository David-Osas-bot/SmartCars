package com.smartcars.config;

import javax.sql.DataSource;
import java.sql.Connection;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseCheck {

    @Bean
    CommandLineRunner verifyDatabase(DataSource dataSource) {
        return args -> {
            try (Connection c = dataSource.getConnection()) {
                System.out.println("DATABASE CONNECTED: "
                        + c.getMetaData().getURL()
                        + " | " + c.getMetaData().getDatabaseProductName()
                        + " " + c.getMetaData().getDatabaseProductVersion());
            }
        };
    }
}
