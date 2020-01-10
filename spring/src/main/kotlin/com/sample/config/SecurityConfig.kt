package com.sample.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import java.io.IOException
import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
class SecurityConfig(private val opaqueTokenIntrospectionProperties: OpaqueTokenIntrospectionProperties) : WebSecurityConfigurerAdapter() {

    override fun configure(http: HttpSecurity) {
        http.sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.NEVER)
                .and()
                .authorizeRequests()
                .antMatchers("/login").permitAll()
                .antMatchers("/login-response").permitAll()
                .antMatchers("/user").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin().disable()
                .logout().disable()
                .httpBasic().disable()
                .cors().disable()
                .csrf().disable()
                .exceptionHandling().authenticationEntryPoint(securityException401EntryPoint())
                .and()
                .oauth2ResourceServer { oauth2ResourceServer ->
                    oauth2ResourceServer
                            .opaqueToken { opaqueToken ->
                                opaqueToken
                                        .introspectionUri(opaqueTokenIntrospectionProperties.introspectionUri)
                                        .introspectionClientCredentials(opaqueTokenIntrospectionProperties.clientId, opaqueTokenIntrospectionProperties.clientSecret)
                            }
                }
    }

    @Bean
    fun securityException401EntryPoint(): Http401AuthenticationEntryPoint? {
        return Http401AuthenticationEntryPoint("Bearer realm=\"webrealm\"")
    }
}

class Http401AuthenticationEntryPoint(private val headerValue: String) : AuthenticationEntryPoint {
    @Throws(IOException::class, ServletException::class)
    override fun commence(request: HttpServletRequest?, response: HttpServletResponse,
                          authException: AuthenticationException) {
        response.setHeader("WWW-Authenticate", headerValue)
        response.status = HttpServletResponse.SC_UNAUTHORIZED
    }
}