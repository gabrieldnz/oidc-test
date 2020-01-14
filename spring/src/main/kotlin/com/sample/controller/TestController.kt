package com.sample.controller

import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.RestTemplate
import java.net.URI
import java.util.UUID


@RestController
class TestController {

    private val users = mapOf(
            "user" to User(username = "user", password = "pass"),
            "name" to User(username = "name", password = "word")
    )

    @PostMapping("/user")
    fun getUserByUsernameAndPassword(@RequestBody request: UserRequest): HttpEntity<out Any> {
        val user = users[request.username] ?: return ResponseEntity.badRequest().body(mapOf(
                "message" to "invalid password or username"
        ))

        if (user.password != request.password) {
            return ResponseEntity.badRequest().body(mapOf(
                    "message" to "invalid password or username"
            ))
        }

        return ResponseEntity.ok(user)
    }

    @GetMapping("/teste")
    fun teste (@AuthenticationPrincipal authenticationPrincipal: OAuth2AuthenticatedPrincipal): HttpEntity<out Any> {
        return ResponseEntity.ok(mapOf(
                "message" to "ok"
        ))
    }

    @GetMapping("/login")
    fun consentRedirect(): HttpEntity<out Any> {
        return ResponseEntity.status(HttpStatus.SEE_OTHER)
                .location(URI("http://localhost:3000/auth?client_id=client&response_type=code&scope=offline_access%20openid%20profile&state=xyz&prompt=consent"))
                .build()
    }

    @GetMapping("/login-response")
    fun oauthResponse(@RequestParam("code") code: String): HttpEntity<out Any> {
        val restTemplate = RestTemplate()

        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED;
        headers.setBasicAuth("client", "secret")

        val body: MultiValueMap<String, String> = LinkedMultiValueMap()
        body["grant_type"] = "authorization_code"
        body["code"] = code


        val request = HttpEntity(body, headers)

        val response = restTemplate.postForObject("http://localhost:3000/token", request, TokenResponse::class.java)
                ?: return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                        "message" to "Erro"
                ))

        return ResponseEntity.ok(response)
    }
}

data class TokenResponse(
        @JsonProperty("access_token")
        val accessToken: String,
        @JsonProperty("expires_in")
        val expiresIn: Long,
        @JsonProperty("id_token")
        val idToken: String,
        @JsonProperty("refresh_token")
        val refreshToken: String,
        val scope: String,
        @JsonProperty("token_type")
        val tokenType: String
)

data class User(
        val id: UUID = UUID.randomUUID(),
        val username: String,
        val password: String
)

data class UserRequest(
        val username: String,
        val password: String
)