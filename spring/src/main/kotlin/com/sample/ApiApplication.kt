package com.sample

import com.sample.config.OpaqueTokenIntrospectionProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal
import org.springframework.security.oauth2.server.resource.introspection.NimbusOpaqueTokenIntrospector
import org.springframework.security.oauth2.server.resource.introspection.OAuth2IntrospectionClaimNames
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector
import java.util.stream.Collectors

@SpringBootApplication
@ConfigurationPropertiesScan(basePackageClasses = [OpaqueTokenIntrospectionProperties::class])
class SpringApplication

fun main(args: Array<String>) {
    runApplication<SpringApplication>(*args)
}

@Configuration
class Teste {

    @Bean
    fun introspector(opaqueTokenIntrospectionProperties: OpaqueTokenIntrospectionProperties): OpaqueTokenIntrospector {
        return CustomAuthoritiesOpaqueTokenIntrospector(opaqueTokenIntrospectionProperties)
    }

    class CustomAuthoritiesOpaqueTokenIntrospector(opaqueTokenIntrospectionProperties: OpaqueTokenIntrospectionProperties) : OpaqueTokenIntrospector {
        private val delegate: OpaqueTokenIntrospector = NimbusOpaqueTokenIntrospector(opaqueTokenIntrospectionProperties.introspectionUri, opaqueTokenIntrospectionProperties.clientId, opaqueTokenIntrospectionProperties.clientSecret)

        override fun introspect(token: String?): OAuth2AuthenticatedPrincipal {
            val principal: OAuth2AuthenticatedPrincipal = delegate.introspect(token)
            return DefaultOAuth2AuthenticatedPrincipal(
                    principal.name, principal.attributes, extractAuthorities(principal))
        }

        private fun extractAuthorities(principal: OAuth2AuthenticatedPrincipal): Collection<GrantedAuthority> {
            val scopes: List<String> = principal.getAttribute(OAuth2IntrospectionClaimNames.SCOPE) ?: listOf()

            return scopes.stream()
                    .map { SimpleGrantedAuthority("SCOPE_$it") }
                    .collect(Collectors.toList())
        }
    }
}