package com.sample.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties(prefix = "authserver")
data class OpaqueTokenIntrospectionProperties(
        val clientId: String,
        val clientSecret: String,
        val introspectionUri: String
)