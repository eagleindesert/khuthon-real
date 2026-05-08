package com.khuthon.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                     // REST API이므로 CSRF 비활성화
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()        // /api/** 경로는 인증 없이 허용
                .anyRequest().authenticated()                  // 나머지는 인증 필요
            );
        return http.build();
    }
}
