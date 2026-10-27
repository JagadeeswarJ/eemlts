package com.employee.gateway.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private static final String SECRET = "employeeManagementSystemSecretKey2026SecureEnterpriseKeyMustBeAtLeast256BitsLong!";
    private JwtUtil jwtUtil;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET);
        key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void testValidToken() {
        String token = Jwts.builder()
                .subject("test@company.com")
                .claims(Map.of(
                        "userId", 101L,
                        "employeeId", 201L,
                        "role", "ADMIN"
                ))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals("test@company.com", jwtUtil.extractEmail(token));
        assertEquals(101L, jwtUtil.extractUserId(token));
        assertEquals(201L, jwtUtil.extractEmployeeId(token));
        assertEquals("ADMIN", jwtUtil.extractRole(token));
    }

    @Test
    void testExpiredToken() {
        String token = Jwts.builder()
                .subject("test@company.com")
                .claims(Map.of("userId", 101L, "role", "EMPLOYEE"))
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(key)
                .compact();

        assertFalse(jwtUtil.isTokenValid(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtUtil.isTokenValid("invalid.jwt.token"));
    }
}
