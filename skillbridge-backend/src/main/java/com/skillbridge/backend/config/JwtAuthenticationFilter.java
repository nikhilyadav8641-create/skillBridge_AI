
package com.skillbridge.backend.config;

import com.skillbridge.backend.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        return path.equals("/api/auth/login")
                || path.equals("/api/auth/register");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No bearer token: let Spring Security decide whether
        // the requested endpoint requires authentication.
        if (authHeader == null || authHeader.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Do not accept malformed Authorization headers.
        if (!authHeader.startsWith("Bearer ")) {
            writeUnauthorized(response,
                    "Invalid Authorization header. Please login again.");
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isEmpty()) {
            writeUnauthorized(response,
                    "Authentication token is missing. Please login again.");
            return;
        }

        try {
            if (!jwtService.isTokenValid(token)) {
                SecurityContextHolder.clearContext();
                writeUnauthorized(response,
                        "Your session is invalid or expired. Please login again.");
                return;
            }

            Long userId = jwtService.extractUserId(token);

            if (userId == null) {
                SecurityContextHolder.clearContext();
                writeUnauthorized(response,
                        "The authentication token is invalid. Please login again.");
                return;
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            String.valueOf(userId),
                            null,
                            Collections.emptyList()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            filterChain.doFilter(request, response);

        } catch (JwtException | IllegalArgumentException exception) {
            SecurityContextHolder.clearContext();

            if (!response.isCommitted()) {
                writeUnauthorized(response,
                        "Your session is invalid or expired. Please login again.");
            }
        }
    }

    private void writeUnauthorized(
            HttpServletResponse response,
            String message
    ) throws IOException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // Escape characters before writing JSON.
        String safeMessage = message
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");

        response.getWriter().write(
                "{\"message\":\"" + safeMessage + "\"}"
        );
    }
}
