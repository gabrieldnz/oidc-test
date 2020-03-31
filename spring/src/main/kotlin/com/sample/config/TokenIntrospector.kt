package com.sample.config

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal
import org.springframework.security.oauth2.server.resource.introspection.NimbusOpaqueTokenIntrospector
import org.springframework.security.oauth2.server.resource.introspection.OAuth2IntrospectionClaimNames
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector
import org.springframework.stereotype.Component

@Component
class TokenIntrospector(
        opaqueTokenIntrospectionProperties: OpaqueTokenIntrospectionProperties
) : OpaqueTokenIntrospector {
    private val delegate: OpaqueTokenIntrospector = NimbusOpaqueTokenIntrospector(opaqueTokenIntrospectionProperties.introspectionUri, opaqueTokenIntrospectionProperties.clientId, opaqueTokenIntrospectionProperties.clientSecret)

    override fun introspect(token: String?): OAuth2AuthenticatedPrincipal {
        val principal: OAuth2AuthenticatedPrincipal = delegate.introspect(token)
        return DefaultOAuth2AuthenticatedPrincipal(
                principal.name, principal.attributes, extractAuthorities(principal))
    }

    private fun extractAuthorities(principal: OAuth2AuthenticatedPrincipal): Collection<GrantedAuthority> {
        val scopes: List<String> = principal.getAttribute(OAuth2IntrospectionClaimNames.SCOPE) ?: listOf()

        val firstScope = scopes.firstOrNull() ?: return listOf()

        if (scopes.size == 1 && firstScope == "full") {
            return clients[principal.attributes["client_id"]]?.map { scope ->
                SimpleGrantedAuthority("SCOPE_$scope")
            } ?: listOf() // FIXME na verdade, o certo é revogar o token aqui
        }

        return scopes.map { scope ->
            SimpleGrantedAuthority("SCOPE_$scope")
        }
    }
}

private val clients = mapOf(
        "api" to listOf(
                "scope1",
                "scope2",
                "scope3"
        ),
        "postman" to listOf(
                "scope1",
                "scope2",
                "scope3",
                "scope4",
                "scope5",
                "scope6"
        )
)