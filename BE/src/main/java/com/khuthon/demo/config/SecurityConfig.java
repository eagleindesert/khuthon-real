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
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/h2-console/**")  // H2 콘솔은 CSRF 예외
                .disable()
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.disable())     // H2 콘솔이 iframe 사용하므로 허용
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()      // API 경로 인증 없이 허용
                .requestMatchers("/h2-console/**").permitAll() // H2 콘솔 인증 없이 허용
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
