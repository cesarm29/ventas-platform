package com.ventas.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expiry;

    public JwtTokenProvider(
            @Value("${jwt.secret:defaultSecretKeyThatIsLongEnoughForHMACSHA256Algorithm123456}") String secret,
            @Value("${jwt.expiration:86400000}") long expiry) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiry = expiry;
    }

    public String generateToken(String email, String role) {
        Date now = new Date();
        return Jwts.builder()
            .subject(email)
            .claim("role", "ROLE_" + role)
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expiry))
            .signWith(key)
            .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public String getRoleFromToken(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
