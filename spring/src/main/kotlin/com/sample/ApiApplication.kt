package com.sample

import com.sample.config.OpaqueTokenIntrospectionProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan(basePackageClasses = [OpaqueTokenIntrospectionProperties::class])
class SpringApplication

fun main(args: Array<String>) {
    runApplication<SpringApplication>(*args)
}