package com.sample.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.AuthenticationException
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector
import org.springframework.security.web.AuthenticationEntryPoint
import java.io.IOException
import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
class SecurityConfig(private val introspectorToken: OpaqueTokenIntrospector) : WebSecurityConfigurerAdapter() {

    private fun ExpressionUrlAuthorizationConfigurer<HttpSecurity>.AuthorizedUrl.hasScope(scope: String): ExpressionUrlAuthorizationConfigurer<HttpSecurity>.ExpressionInterceptUrlRegistry {
        return this.hasAuthority("SCOPE_$scope")
    }

    private fun ExpressionUrlAuthorizationConfigurer<HttpSecurity>.AuthorizedUrl.hasAnyScope(vararg scopes: String): ExpressionUrlAuthorizationConfigurer<HttpSecurity>.ExpressionInterceptUrlRegistry {
        return this.hasAnyAuthority(
                *scopes.map {
                    "SCOPE_$it"
                }.toTypedArray()
        )
    }

    override fun configure(http: HttpSecurity) {
        http.sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.NEVER)
                .and()
                .authorizeRequests()
                .antMatchers("/login").permitAll()
                .antMatchers("/login-response").permitAll()
                .antMatchers(HttpMethod.POST, "/user").permitAll()
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
                                        .introspector(introspectorToken)
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