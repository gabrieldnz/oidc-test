package com.sample.controller

import org.springframework.http.HttpEntity
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class TestController {

    private val users = mapOf(
            "user" to User(username = "user", password = "pass"),
            "name" to User(username = "name", password = "word")
    )

    @GetMapping("/teste")
    fun teste(): HttpEntity<out Any> {
        return ResponseEntity.ok("Ok")
    }

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
}

data class User(
        val id: UUID = UUID.randomUUID(),
        val username: String,
        val password: String
)

data class UserRequest(
        val username: String,
        val password: String
)